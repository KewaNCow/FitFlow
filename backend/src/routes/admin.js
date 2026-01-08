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
// WORKOUT EXERCISES (for predefined workouts)
// =====================================================

// Get exercises for a predefined workout
router.get('/workouts/:id/exercises', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify workout exists and is predefined
    const [workout] = await pool.query(
      'SELECT id FROM workouts WHERE id = ? AND is_predefined = TRUE',
      [id]
    );

    if (workout.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Predefined workout not found'
      });
    }

    const [exercises] = await pool.query(`
      SELECT we.*, e.name, e.description, e.category, e.muscle_group, 
             e.equipment, e.image_url, e.video_url, e.exercise_type
      FROM workout_exercises we
      JOIN exercises e ON we.exercise_id = e.id
      WHERE we.workout_id = ?
      ORDER BY we.order_index
    `, [id]);

    res.json({
      success: true,
      data: exercises
    });
  } catch (error) {
    console.error('Error fetching workout exercises:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workout exercises'
    });
  }
});

// Add exercise to predefined workout
router.post('/workouts/:id/exercises', async (req, res) => {
  try {
    const { id } = req.params;
    const { exercise_id, sets, reps, weight, duration, rest_time, notes, distance, calories, intensity } = req.body;

    // Verify workout exists and is predefined
    const [workout] = await pool.query(
      'SELECT id FROM workouts WHERE id = ? AND is_predefined = TRUE',
      [id]
    );

    if (workout.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Predefined workout not found'
      });
    }

    // Get the next order index
    const [[{ maxOrder }]] = await pool.query(
      'SELECT COALESCE(MAX(order_index), -1) as maxOrder FROM workout_exercises WHERE workout_id = ?',
      [id]
    );

    const [result] = await pool.query(
      `INSERT INTO workout_exercises 
       (workout_id, exercise_id, order_index, sets, reps, weight, duration, rest_time, notes, distance, calories, intensity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, exercise_id, maxOrder + 1, sets || 3, reps || 10, weight || null, 
       duration || null, rest_time || 60, notes || null, distance || null, 
       calories || null, intensity || null]
    );

    // Fetch the created exercise with details
    const [newExercise] = await pool.query(`
      SELECT we.*, e.name, e.description, e.category, e.muscle_group, 
             e.equipment, e.image_url, e.video_url, e.exercise_type
      FROM workout_exercises we
      JOIN exercises e ON we.exercise_id = e.id
      WHERE we.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      data: newExercise[0]
    });
  } catch (error) {
    console.error('Error adding exercise to workout:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding exercise to workout'
    });
  }
});

// Update exercise in predefined workout
router.put('/workouts/:workoutId/exercises/:exerciseId', async (req, res) => {
  try {
    const { workoutId, exerciseId } = req.params;
    const { sets, reps, weight, duration, rest_time, notes, distance, calories, intensity, order_index } = req.body;

    // Verify workout exercise exists
    const [existing] = await pool.query(
      `SELECT we.* FROM workout_exercises we
       JOIN workouts w ON we.workout_id = w.id
       WHERE we.id = ? AND w.id = ? AND w.is_predefined = TRUE`,
      [exerciseId, workoutId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Workout exercise not found'
      });
    }

    await pool.query(
      `UPDATE workout_exercises SET 
       sets = ?, reps = ?, weight = ?, duration = ?, rest_time = ?, 
       notes = ?, distance = ?, calories = ?, intensity = ?, order_index = ?
       WHERE id = ?`,
      [sets ?? existing[0].sets, reps ?? existing[0].reps, weight, duration, 
       rest_time ?? existing[0].rest_time, notes, distance, calories, intensity,
       order_index ?? existing[0].order_index, exerciseId]
    );

    const [updated] = await pool.query(`
      SELECT we.*, e.name, e.description, e.category, e.muscle_group, 
             e.equipment, e.image_url, e.video_url, e.exercise_type
      FROM workout_exercises we
      JOIN exercises e ON we.exercise_id = e.id
      WHERE we.id = ?
    `, [exerciseId]);

    res.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating workout exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating workout exercise'
    });
  }
});

// Remove exercise from predefined workout
router.delete('/workouts/:workoutId/exercises/:exerciseId', async (req, res) => {
  try {
    const { workoutId, exerciseId } = req.params;

    // Verify workout exercise exists
    const [existing] = await pool.query(
      `SELECT we.* FROM workout_exercises we
       JOIN workouts w ON we.workout_id = w.id
       WHERE we.id = ? AND w.id = ? AND w.is_predefined = TRUE`,
      [exerciseId, workoutId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Workout exercise not found'
      });
    }

    await pool.query('DELETE FROM workout_exercises WHERE id = ?', [exerciseId]);

    res.json({
      success: true,
      message: 'Exercise removed from workout'
    });
  } catch (error) {
    console.error('Error removing exercise from workout:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing exercise from workout'
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
// PROGRAM WORKOUTS (for predefined programs)
// =====================================================

// Get workouts for a predefined program
router.get('/programs/:id/workouts', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify program exists and is predefined
    const [program] = await pool.query(
      'SELECT id FROM programs WHERE id = ? AND is_predefined = TRUE',
      [id]
    );

    if (program.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Predefined program not found'
      });
    }

    const [workouts] = await pool.query(`
      SELECT pw.*, w.name as workout_name, w.description as workout_description, 
             w.workout_type, w.is_predefined as workout_is_predefined
      FROM program_workouts pw
      JOIN workouts w ON pw.workout_id = w.id
      WHERE pw.program_id = ?
      ORDER BY pw.day_of_week, pw.order_index
    `, [id]);

    res.json({
      success: true,
      data: workouts
    });
  } catch (error) {
    console.error('Error fetching program workouts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching program workouts'
    });
  }
});

// Add workout to predefined program
router.post('/programs/:id/workouts', async (req, res) => {
  try {
    const { id } = req.params;
    const { workout_id, day_of_week, notes } = req.body;

    // Verify program exists and is predefined
    const [program] = await pool.query(
      'SELECT id FROM programs WHERE id = ? AND is_predefined = TRUE',
      [id]
    );

    if (program.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Predefined program not found'
      });
    }

    // Get the next order index for the given day
    const [[{ maxOrder }]] = await pool.query(
      'SELECT COALESCE(MAX(order_index), -1) as maxOrder FROM program_workouts WHERE program_id = ? AND day_of_week = ?',
      [id, day_of_week || 0]
    );

    const [result] = await pool.query(
      `INSERT INTO program_workouts (program_id, workout_id, day_of_week, order_index, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [id, workout_id, day_of_week || 0, maxOrder + 1, notes || null]
    );

    // Fetch the created program workout with details
    const [newWorkout] = await pool.query(`
      SELECT pw.*, w.name as workout_name, w.description as workout_description, 
             w.workout_type, w.is_predefined as workout_is_predefined
      FROM program_workouts pw
      JOIN workouts w ON pw.workout_id = w.id
      WHERE pw.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      data: newWorkout[0]
    });
  } catch (error) {
    console.error('Error adding workout to program:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding workout to program'
    });
  }
});

// Update workout in predefined program
router.put('/programs/:programId/workouts/:workoutId', async (req, res) => {
  try {
    const { programId, workoutId } = req.params;
    const { day_of_week, notes, order_index } = req.body;

    // Verify program workout exists
    const [existing] = await pool.query(
      `SELECT pw.* FROM program_workouts pw
       JOIN programs p ON pw.program_id = p.id
       WHERE pw.id = ? AND p.id = ? AND p.is_predefined = TRUE`,
      [workoutId, programId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program workout not found'
      });
    }

    await pool.query(
      `UPDATE program_workouts SET day_of_week = ?, notes = ?, order_index = ? WHERE id = ?`,
      [day_of_week ?? existing[0].day_of_week, notes, order_index ?? existing[0].order_index, workoutId]
    );

    const [updated] = await pool.query(`
      SELECT pw.*, w.name as workout_name, w.description as workout_description, 
             w.workout_type, w.is_predefined as workout_is_predefined
      FROM program_workouts pw
      JOIN workouts w ON pw.workout_id = w.id
      WHERE pw.id = ?
    `, [workoutId]);

    res.json({
      success: true,
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating program workout:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating program workout'
    });
  }
});

// Remove workout from predefined program
router.delete('/programs/:programId/workouts/:workoutId', async (req, res) => {
  try {
    const { programId, workoutId } = req.params;

    // Verify program workout exists
    const [existing] = await pool.query(
      `SELECT pw.* FROM program_workouts pw
       JOIN programs p ON pw.program_id = p.id
       WHERE pw.id = ? AND p.id = ? AND p.is_predefined = TRUE`,
      [workoutId, programId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program workout not found'
      });
    }

    await pool.query('DELETE FROM program_workouts WHERE id = ?', [workoutId]);

    res.json({
      success: true,
      message: 'Workout removed from program'
    });
  } catch (error) {
    console.error('Error removing workout from program:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing workout from program'
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
    // Basic counts
    const [[{ userCount }]] = await pool.query('SELECT COUNT(*) as userCount FROM users');
    const [[{ workoutCount }]] = await pool.query('SELECT COUNT(*) as workoutCount FROM workouts WHERE is_predefined = TRUE');
    const [[{ programCount }]] = await pool.query('SELECT COUNT(*) as programCount FROM programs WHERE is_predefined = TRUE');
    const [[{ exerciseCount }]] = await pool.query('SELECT COUNT(*) as exerciseCount FROM exercises WHERE user_id IS NULL');
    const [[{ equipmentCount }]] = await pool.query('SELECT COUNT(*) as equipmentCount FROM equipment WHERE is_public = TRUE OR user_id IS NULL');

    // User activity stats
    const [[{ totalWorkoutLogs }]] = await pool.query('SELECT COUNT(*) as totalWorkoutLogs FROM workout_logs');
    const [[{ totalCaloriesBurned }]] = await pool.query('SELECT COALESCE(SUM(calories_burned), 0) as totalCaloriesBurned FROM workout_logs');
    const [[{ totalMinutesActive }]] = await pool.query('SELECT COALESCE(SUM(duration_minutes), 0) as totalMinutesActive FROM workout_logs');
    
    // New users this week
    const [[{ newUsersThisWeek }]] = await pool.query(`
      SELECT COUNT(*) as newUsersThisWeek 
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    
    // Active users (users who logged a workout in the last 7 days)
    const [[{ activeUsersThisWeek }]] = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as activeUsersThisWeek 
      FROM workout_logs 
      WHERE completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    
    // Workouts logged this week
    const [[{ workoutsThisWeek }]] = await pool.query(`
      SELECT COUNT(*) as workoutsThisWeek 
      FROM workout_logs 
      WHERE completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    
    // User created workouts count
    const [[{ userCreatedWorkouts }]] = await pool.query(`
      SELECT COUNT(*) as userCreatedWorkouts 
      FROM workouts 
      WHERE is_predefined = FALSE
    `);
    
    // User created routes count
    const [[{ totalRoutes }]] = await pool.query('SELECT COUNT(*) as totalRoutes FROM routes');
    
    // Average overall rating (only for predefined workouts and programs)
    const [[{ avgRating }]] = await pool.query(`
      SELECT COALESCE(AVG(r.rating), 0) as avgRating 
      FROM ratings r
      LEFT JOIN workouts w ON r.workout_id = w.id
      LEFT JOIN programs p ON r.program_id = p.id
      WHERE (w.is_predefined = TRUE OR p.is_predefined = TRUE)
    `);
    
    // Recent user signups (last 10)
    const [recentUsers] = await pool.query(`
      SELECT id, first_name, last_name, email, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    // Most active users (by workout count)
    const [topUsers] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email,
             COUNT(wl.id) as workout_count,
             COALESCE(SUM(wl.duration_minutes), 0) as total_minutes,
             COALESCE(SUM(wl.calories_burned), 0) as total_calories
      FROM users u
      LEFT JOIN workout_logs wl ON u.id = wl.user_id
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY workout_count DESC
      LIMIT 10
    `);
    
    // Daily workout activity (last 30 days)
    const [dailyActivity] = await pool.query(`
      SELECT DATE(completed_at) as date, 
             COUNT(*) as workouts,
             COUNT(DISTINCT user_id) as unique_users
      FROM workout_logs 
      WHERE completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(completed_at)
      ORDER BY date ASC
    `);
    
    // Most popular exercises (by usage in workout logs) - only public/admin exercises
    const [popularExercises] = await pool.query(`
      SELECT e.id, e.name, e.muscle_group, COUNT(el.id) as usage_count
      FROM exercises e
      JOIN exercise_logs el ON e.id = el.exercise_id
      WHERE e.user_id IS NULL
      GROUP BY e.id, e.name, e.muscle_group
      ORDER BY usage_count DESC
      LIMIT 10
    `);

    // Rating statistics - only for predefined content
    const [[{ totalRatings }]] = await pool.query(`
      SELECT COUNT(*) as totalRatings 
      FROM ratings r
      LEFT JOIN workouts w ON r.workout_id = w.id
      LEFT JOIN programs p ON r.program_id = p.id
      WHERE (w.is_predefined = TRUE OR p.is_predefined = TRUE)
    `);
    const [[{ avgWorkoutRating }]] = await pool.query(`
      SELECT COALESCE(AVG(r.rating), 0) as avgWorkoutRating 
      FROM ratings r
      JOIN workouts w ON r.workout_id = w.id
      WHERE w.is_predefined = TRUE
    `);
    const [[{ avgProgramRating }]] = await pool.query(`
      SELECT COALESCE(AVG(r.rating), 0) as avgProgramRating 
      FROM ratings r
      JOIN programs p ON r.program_id = p.id
      WHERE p.is_predefined = TRUE
    `);
    
    // Top rated workouts - only predefined
    const [topRatedWorkouts] = await pool.query(`
      SELECT w.id, w.name, w.workout_type,
             AVG(r.rating) as avg_rating,
             COUNT(r.id) as rating_count
      FROM workouts w
      JOIN ratings r ON w.id = r.workout_id
      WHERE w.is_predefined = TRUE
      GROUP BY w.id, w.name, w.workout_type
      HAVING rating_count >= 1
      ORDER BY avg_rating DESC, rating_count DESC
      LIMIT 10
    `);
    
    // Top rated programs - only predefined
    const [topRatedPrograms] = await pool.query(`
      SELECT p.id, p.name, p.difficulty,
             AVG(r.rating) as avg_rating,
             COUNT(r.id) as rating_count
      FROM programs p
      JOIN ratings r ON p.id = r.program_id
      WHERE p.is_predefined = TRUE
      GROUP BY p.id, p.name, p.difficulty
      HAVING rating_count >= 1
      ORDER BY avg_rating DESC, rating_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        // Basic counts
        users: userCount,
        predefinedWorkouts: workoutCount,
        predefinedPrograms: programCount,
        publicExercises: exerciseCount,
        publicEquipment: equipmentCount,
        
        // Activity metrics
        totalWorkoutLogs: parseInt(totalWorkoutLogs),
        totalCaloriesBurned: parseFloat(totalCaloriesBurned),
        totalMinutesActive: parseInt(totalMinutesActive),
        userCreatedWorkouts: parseInt(userCreatedWorkouts),
        totalRoutes: parseInt(totalRoutes),
        avgRating: parseFloat(avgRating).toFixed(1),
        
        // Weekly metrics
        newUsersThisWeek: parseInt(newUsersThisWeek),
        activeUsersThisWeek: parseInt(activeUsersThisWeek),
        workoutsThisWeek: parseInt(workoutsThisWeek),
        
        // Lists
        recentUsers,
        topUsers,
        dailyActivity,
        popularExercises,
        
        // Rating stats
        totalRatings: parseInt(totalRatings),
        avgWorkoutRating: parseFloat(avgWorkoutRating).toFixed(1),
        avgProgramRating: parseFloat(avgProgramRating).toFixed(1),
        topRatedWorkouts,
        topRatedPrograms
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
