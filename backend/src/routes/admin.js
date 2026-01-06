const express = require('express');
const { body } = require('express-validator');
const pool = require('../config/database');
const validate = require('../middleware/validate');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(auth, adminOnly);

// =====================================================
// PREDEFINED WORKOUTS
// =====================================================

// Get all predefined workouts
router.get('/workouts', async (req, res) => {
  try {
    const [workouts] = await pool.query(`
      SELECT w.*, 
             COUNT(DISTINCT we.id) as exercise_count
      FROM workouts w
      LEFT JOIN workout_exercises we ON w.id = we.workout_id
      WHERE w.is_predefined = TRUE
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `);

    res.json({
      success: true,
      data: workouts
    });
  } catch (error) {
    console.error('Error fetching predefined workouts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching predefined workouts'
    });
  }
});

// Create predefined workout
router.post('/workouts', [
  body('name').trim().notEmpty().withMessage('Workout name is required'),
  body('workout_type').optional().isIn(['strength', 'cardio', 'mixed', 'flexibility']),
], validate, async (req, res) => {
  try {
    const { name, description, workout_type } = req.body;

    const [result] = await pool.query(
      `INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) 
       VALUES (?, ?, ?, ?, TRUE)`,
      [req.user.id, name, description || null, workout_type || 'strength']
    );

    const [newWorkout] = await pool.query(
      'SELECT * FROM workouts WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newWorkout[0]
    });
  } catch (error) {
    console.error('Error creating predefined workout:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating predefined workout'
    });
  }
});

// Update predefined workout
router.put('/workouts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, workout_type } = req.body;

    // Check if workout exists and is predefined
    const [existing] = await pool.query(
      'SELECT * FROM workouts WHERE id = ? AND is_predefined = TRUE',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Predefined workout not found'
      });
    }

    await pool.query(
      `UPDATE workouts SET name = ?, description = ?, workout_type = ? WHERE id = ?`,
      [name || existing[0].name, description, workout_type || existing[0].workout_type, id]
    );

    const [updated] = await pool.query('SELECT * FROM workouts WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating predefined workout:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating predefined workout'
    });
  }
});

// Delete predefined workout
router.delete('/workouts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM workouts WHERE id = ? AND is_predefined = TRUE',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Predefined workout not found'
      });
    }

    await pool.query('DELETE FROM workouts WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Predefined workout deleted'
    });
  } catch (error) {
    console.error('Error deleting predefined workout:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting predefined workout'
    });
  }
});

// =====================================================
// PREDEFINED PROGRAMS
// =====================================================

// Get all predefined programs
router.get('/programs', async (req, res) => {
  try {
    const [programs] = await pool.query(`
      SELECT p.*, 
             COUNT(DISTINCT pw.id) as workout_count
      FROM programs p
      LEFT JOIN program_workouts pw ON p.id = pw.program_id
      WHERE p.is_predefined = TRUE
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      data: programs
    });
  } catch (error) {
    console.error('Error fetching predefined programs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching predefined programs'
    });
  }
});

// Create predefined program
router.post('/programs', [
  body('name').trim().notEmpty().withMessage('Program name is required'),
], validate, async (req, res) => {
  try {
    const { name, description, duration_weeks, difficulty } = req.body;

    const [result] = await pool.query(
      `INSERT INTO programs (user_id, name, description, duration_weeks, difficulty, is_predefined) 
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [req.user.id, name, description || null, duration_weeks || null, difficulty || 'intermediate']
    );

    const [newProgram] = await pool.query(
      'SELECT * FROM programs WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newProgram[0]
    });
  } catch (error) {
    console.error('Error creating predefined program:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating predefined program'
    });
  }
});

// Update predefined program
router.put('/programs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration_weeks, difficulty } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM programs WHERE id = ? AND is_predefined = TRUE',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Predefined program not found'
      });
    }

    await pool.query(
      `UPDATE programs SET name = ?, description = ?, duration_weeks = ?, difficulty = ? WHERE id = ?`,
      [name || existing[0].name, description, duration_weeks, difficulty || existing[0].difficulty, id]
    );

    const [updated] = await pool.query('SELECT * FROM programs WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating predefined program:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating predefined program'
    });
  }
});

// Delete predefined program
router.delete('/programs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM programs WHERE id = ? AND is_predefined = TRUE',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Predefined program not found'
      });
    }

    await pool.query('DELETE FROM programs WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Predefined program deleted'
    });
  } catch (error) {
    console.error('Error deleting predefined program:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting predefined program'
    });
  }
});

// =====================================================
// PUBLIC EXERCISES (user_id IS NULL = public)
// =====================================================

// Get all public exercises
router.get('/exercises', async (req, res) => {
  try {
    const [exercises] = await pool.query(`
      SELECT e.*, eq.name as equipment_name
      FROM exercises e
      LEFT JOIN equipment eq ON e.equipment_id = eq.id
      WHERE e.user_id IS NULL
      ORDER BY e.name ASC
    `);

    res.json({
      success: true,
      data: exercises
    });
  } catch (error) {
    console.error('Error fetching public exercises:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching public exercises'
    });
  }
});

// Create public exercise
router.post('/exercises', [
  body('name').trim().notEmpty().withMessage('Exercise name is required'),
  body('category').isIn(['strength', 'cardio', 'flexibility', 'bodyweight', 'machine']),
], validate, async (req, res) => {
  try {
    const { 
      name, description, category, exercise_type, 
      muscle_group, equipment, equipment_id, difficulty,
      instructions, video_url, image_url 
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO exercises (user_id, name, description, category, exercise_type, 
       muscle_group, equipment, equipment_id, difficulty, instructions, video_url, image_url) 
       VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, category, exercise_type || 'strength',
       muscle_group || null, equipment || null, equipment_id || null, 
       difficulty || 'intermediate', instructions || null, video_url || null, image_url || null]
    );

    const [newExercise] = await pool.query(
      'SELECT * FROM exercises WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newExercise[0]
    });
  } catch (error) {
    console.error('Error creating public exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating public exercise'
    });
  }
});

// Update public exercise
router.put('/exercises/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, description, category, exercise_type, 
      muscle_group, equipment, equipment_id, difficulty,
      instructions, video_url, image_url 
    } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM exercises WHERE id = ? AND user_id IS NULL',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Public exercise not found'
      });
    }

    await pool.query(
      `UPDATE exercises SET 
       name = ?, description = ?, category = ?, exercise_type = ?,
       muscle_group = ?, equipment = ?, equipment_id = ?, difficulty = ?,
       instructions = ?, video_url = ?, image_url = ?
       WHERE id = ?`,
      [name || existing[0].name, description, category || existing[0].category,
       exercise_type || existing[0].exercise_type, muscle_group, equipment,
       equipment_id, difficulty || existing[0].difficulty, instructions,
       video_url, image_url, id]
    );

    const [updated] = await pool.query('SELECT * FROM exercises WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating public exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating public exercise'
    });
  }
});

// Delete public exercise
router.delete('/exercises/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM exercises WHERE id = ? AND user_id IS NULL',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Public exercise not found'
      });
    }

    await pool.query('DELETE FROM exercises WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Public exercise deleted'
    });
  } catch (error) {
    console.error('Error deleting public exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting public exercise'
    });
  }
});

// =====================================================
// PUBLIC EQUIPMENT (is_public = TRUE or user_id IS NULL)
// =====================================================

// Get all public equipment
router.get('/equipment', async (req, res) => {
  try {
    const [equipment] = await pool.query(`
      SELECT * FROM equipment
      WHERE is_public = TRUE OR user_id IS NULL
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Error fetching public equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching public equipment'
    });
  }
});

// Create public equipment
router.post('/equipment', [
  body('name').trim().notEmpty().withMessage('Equipment name is required'),
], validate, async (req, res) => {
  try {
    const { name, description, category, image_url } = req.body;

    const [result] = await pool.query(
      `INSERT INTO equipment (user_id, name, description, category, image_url, is_public) 
       VALUES (NULL, ?, ?, ?, ?, TRUE)`,
      [name, description || null, category || 'other', image_url || null]
    );

    const [newEquipment] = await pool.query(
      'SELECT * FROM equipment WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newEquipment[0]
    });
  } catch (error) {
    console.error('Error creating public equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating public equipment'
    });
  }
});

// Update public equipment
router.put('/equipment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, image_url } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM equipment WHERE id = ? AND (is_public = TRUE OR user_id IS NULL)',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Public equipment not found'
      });
    }

    await pool.query(
      `UPDATE equipment SET name = ?, description = ?, category = ?, image_url = ? WHERE id = ?`,
      [name || existing[0].name, description, category || existing[0].category, image_url, id]
    );

    const [updated] = await pool.query('SELECT * FROM equipment WHERE id = ?', [id]);

    res.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating public equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating public equipment'
    });
  }
});

// Delete public equipment
router.delete('/equipment/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM equipment WHERE id = ? AND (is_public = TRUE OR user_id IS NULL)',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Public equipment not found'
      });
    }

    await pool.query('DELETE FROM equipment WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Public equipment deleted'
    });
  } catch (error) {
    console.error('Error deleting public equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting public equipment'
    });
  }
});

// =====================================================
// ADMIN STATS
// =====================================================

router.get('/stats', async (req, res) => {
  try {
    const [[{ userCount }]] = await pool.query('SELECT COUNT(*) as userCount FROM users');
    const [[{ workoutCount }]] = await pool.query('SELECT COUNT(*) as workoutCount FROM workouts WHERE is_predefined = TRUE');
    const [[{ programCount }]] = await pool.query('SELECT COUNT(*) as programCount FROM programs WHERE is_predefined = TRUE');
    const [[{ exerciseCount }]] = await pool.query('SELECT COUNT(*) as exerciseCount FROM exercises WHERE user_id IS NULL');
    const [[{ equipmentCount }]] = await pool.query('SELECT COUNT(*) as equipmentCount FROM equipment WHERE is_public = TRUE OR user_id IS NULL');

    res.json({
      success: true,
      data: {
        users: userCount,
        predefinedWorkouts: workoutCount,
        predefinedPrograms: programCount,
        publicExercises: exerciseCount,
        publicEquipment: equipmentCount
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin stats'
    });
  }
});

module.exports = router;
