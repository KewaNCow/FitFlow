const express = require('express');
const { body } = require('express-validator');
const pool = require('../config/database');
const { auth, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Get all programs (user's own + public predefined)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type } = req.query; // 'my', 'predefined', or 'all'

    let query = `
      SELECT p.*, u.first_name as creator_first_name, u.last_name as creator_last_name,
        (SELECT COUNT(*) FROM program_workouts WHERE program_id = p.id) as workout_count
      FROM programs p
      LEFT JOIN users u ON p.user_id = u.id
    `;

    const params = [];

    if (type === 'my' && req.user) {
      query += ' WHERE p.user_id = ?';
      params.push(req.user.id);
    } else if (type === 'predefined') {
      query += ' WHERE p.is_predefined = 1';
    } else if (req.user) {
      query += ' WHERE p.user_id = ? OR p.is_predefined = 1';
      params.push(req.user.id);
    } else {
      query += ' WHERE p.is_predefined = 1';
    }

    query += ' ORDER BY p.updated_at DESC';

    const [programs] = await pool.query(query, params);

    res.json({
      success: true,
      data: programs
    });
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching programs'
    });
  }
});

// Get single program with workouts
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [programs] = await pool.query(
      `SELECT p.*, u.first_name as creator_first_name, u.last_name as creator_last_name
       FROM programs p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (programs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    const program = programs[0];

    // Check access
    if (!program.is_predefined && (!req.user || program.user_id !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get program workouts
    const [programWorkouts] = await pool.query(
      `SELECT pw.*, w.name as workout_name, w.description as workout_description,
        (SELECT COUNT(*) FROM workout_exercises WHERE workout_id = w.id) as exercise_count
       FROM program_workouts pw
       JOIN workouts w ON pw.workout_id = w.id
       WHERE pw.program_id = ?
       ORDER BY pw.day_of_week, pw.order_index`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...program,
        workouts: programWorkouts
      }
    });
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching program'
    });
  }
});

// Create program
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Program name is required'),
  body('durationWeeks').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 week')
], validate, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { name, description, durationWeeks = 4, difficulty, workouts = [] } = req.body;

    // Create program
    const [programResult] = await connection.query(
      `INSERT INTO programs (user_id, name, description, duration_weeks, difficulty) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, name, description, durationWeeks, difficulty]
    );

    const programId = programResult.insertId;

    // Add workouts if provided
    if (workouts.length > 0) {
      const workoutValues = workouts.map((w, index) => [
        programId,
        w.workoutId,
        w.dayOfWeek || index,
        index,
        w.notes || null
      ]);

      await connection.query(
        `INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index, notes)
         VALUES ?`,
        [workoutValues]
      );
    }

    await connection.commit();

    // Fetch created program
    const [newProgram] = await pool.query(
      'SELECT * FROM programs WHERE id = ?',
      [programId]
    );

    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      data: newProgram[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create program error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating program'
    });
  } finally {
    connection.release();
  }
});

// Update program
router.put('/:id', auth, [
  body('name').optional().trim().notEmpty().withMessage('Program name cannot be empty')
], validate, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Check ownership
    const [existing] = await connection.query(
      'SELECT id FROM programs WHERE id = ? AND user_id = ? AND is_predefined = 0',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found or cannot be edited'
      });
    }

    await connection.beginTransaction();

    const { name, description, durationWeeks, difficulty, workouts } = req.body;

    // Update program details
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (durationWeeks) {
      updates.push('duration_weeks = ?');
      values.push(durationWeeks);
    }
    if (difficulty !== undefined) {
      updates.push('difficulty = ?');
      values.push(difficulty);
    }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      values.push(req.params.id);

      await connection.query(
        `UPDATE programs SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Update workouts if provided
    if (workouts !== undefined) {
      await connection.query(
        'DELETE FROM program_workouts WHERE program_id = ?',
        [req.params.id]
      );

      if (workouts.length > 0) {
        const workoutValues = workouts.map((w, index) => [
          req.params.id,
          w.workoutId,
          w.dayOfWeek || index,
          index,
          w.notes || null
        ]);

        await connection.query(
          `INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index, notes)
           VALUES ?`,
          [workoutValues]
        );
      }
    }

    await connection.commit();

    // Fetch updated program
    const [program] = await pool.query(
      'SELECT * FROM programs WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Program updated successfully',
      data: program[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update program error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating program'
    });
  } finally {
    connection.release();
  }
});

// Delete program
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM programs WHERE id = ? AND user_id = ? AND is_predefined = 0',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found or cannot be deleted'
      });
    }

    res.json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting program'
    });
  }
});

// Copy predefined program to user's programs
router.post('/:id/copy', auth, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Get original program
    const [programs] = await connection.query(
      'SELECT * FROM programs WHERE id = ? AND is_predefined = 1',
      [req.params.id]
    );

    if (programs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Predefined program not found'
      });
    }

    const original = programs[0];

    await connection.beginTransaction();

    // Create user's copy
    const [result] = await connection.query(
      `INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [req.user.id, `${original.name} (My Copy)`, original.description, original.duration_weeks, original.difficulty]
    );

    const newProgramId = result.insertId;

    // Copy program workouts
    await connection.query(
      `INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index, notes)
       SELECT ?, workout_id, day_of_week, order_index, notes
       FROM program_workouts WHERE program_id = ?`,
      [newProgramId, req.params.id]
    );

    await connection.commit();

    const [newProgram] = await pool.query(
      'SELECT * FROM programs WHERE id = ?',
      [newProgramId]
    );

    res.status(201).json({
      success: true,
      message: 'Program copied successfully',
      data: newProgram[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Copy program error:', error);
    res.status(500).json({
      success: false,
      message: 'Error copying program'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
