const express = require('express');
const { body } = require('express-validator');
const pool = require('../config/database');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Get all workouts for current user (or predefined)
router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;
    
    let query;
    let params;
    
    if (type === 'predefined') {
      // Get predefined workouts (system workouts)
      query = `SELECT w.*, 
        (SELECT COUNT(*) FROM workout_exercises WHERE workout_id = w.id) as exercise_count,
        r.name as route_name, r.distance_km as route_distance, r.activity_type as route_activity
       FROM workouts w 
       LEFT JOIN routes r ON w.route_id = r.id
       WHERE w.is_predefined = TRUE 
       ORDER BY w.name ASC`;
      params = [];
    } else {
      // Get user's own workouts
      query = `SELECT w.*, 
        (SELECT COUNT(*) FROM workout_exercises WHERE workout_id = w.id) as exercise_count,
        r.name as route_name, r.distance_km as route_distance, r.activity_type as route_activity
       FROM workouts w 
       LEFT JOIN routes r ON w.route_id = r.id
       WHERE w.user_id = ? AND w.is_predefined = FALSE
       ORDER BY w.updated_at DESC`;
      params = [req.user.id];
    }
    
    const [workouts] = await pool.query(query, params);

    res.json({
      success: true,
      data: workouts
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workouts'
    });
  }
});

// Get single workout with exercises
router.get('/:id', auth, async (req, res) => {
  try {
    // First try to get user's own workout, or a predefined workout
    const [workouts] = await pool.query(
      `SELECT w.*, r.name as route_name, r.distance_km as route_distance, 
              r.activity_type as route_activity, r.estimated_duration as route_duration
       FROM workouts w
       LEFT JOIN routes r ON w.route_id = r.id
       WHERE w.id = ? AND (w.user_id = ? OR w.is_predefined = TRUE)`,
      [req.params.id, req.user.id]
    );

    if (workouts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    const workout = workouts[0];

    // Get workout exercises
    const [exercises] = await pool.query(
      `SELECT we.*, e.name, e.description, e.category, e.muscle_group, 
              e.equipment, e.image_url, e.video_url, e.exercise_type
       FROM workout_exercises we
       JOIN exercises e ON we.exercise_id = e.id
       WHERE we.workout_id = ?
       ORDER BY we.order_index`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...workout,
        exercises
      }
    });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workout'
    });
  }
});

// Create workout
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Workout name is required')
], validate, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { name, description, exercises = [], route_id = null } = req.body;

    // Create workout with optional route link
    const [workoutResult] = await connection.query(
      'INSERT INTO workouts (user_id, name, description, route_id) VALUES (?, ?, ?, ?)',
      [req.user.id, name, description, route_id]
    );

    const workoutId = workoutResult.insertId;

    // Add exercises if provided
    if (exercises.length > 0) {
      const exerciseValues = exercises.map((ex, index) => [
        workoutId,
        ex.exerciseId,
        index,
        ex.sets || 3,
        ex.reps || 10,
        ex.weight || null,
        ex.duration || null,
        ex.restTime || 60,
        ex.notes || null
      ]);

      await connection.query(
        `INSERT INTO workout_exercises 
         (workout_id, exercise_id, order_index, sets, reps, weight, duration, rest_time, notes)
         VALUES ?`,
        [exerciseValues]
      );
    }

    await connection.commit();

    // Fetch the created workout
    const [newWorkout] = await pool.query(
      'SELECT * FROM workouts WHERE id = ?',
      [workoutId]
    );

    const [workoutExercises] = await pool.query(
      `SELECT we.*, e.name, e.description, e.category, e.muscle_group, e.equipment
       FROM workout_exercises we
       JOIN exercises e ON we.exercise_id = e.id
       WHERE we.workout_id = ?
       ORDER BY we.order_index`,
      [workoutId]
    );

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: {
        ...newWorkout[0],
        exercises: workoutExercises
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating workout'
    });
  } finally {
    connection.release();
  }
});

// Update workout
router.put('/:id', auth, [
  body('name').optional().trim().notEmpty().withMessage('Workout name cannot be empty')
], validate, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Check ownership
    const [existing] = await connection.query(
      'SELECT id FROM workouts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    await connection.beginTransaction();

    const { name, description, exercises, route_id } = req.body;

    // Update workout details
    if (name || description !== undefined || route_id !== undefined) {
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
      if (route_id !== undefined) {
        updates.push('route_id = ?');
        values.push(route_id);
      }

      updates.push('updated_at = NOW()');
      values.push(req.params.id);

      await connection.query(
        `UPDATE workouts SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Update exercises if provided
    if (exercises !== undefined) {
      // Delete existing exercises
      await connection.query(
        'DELETE FROM workout_exercises WHERE workout_id = ?',
        [req.params.id]
      );

      // Add new exercises
      if (exercises.length > 0) {
        const exerciseValues = exercises.map((ex, index) => [
          req.params.id,
          ex.exerciseId,
          index,
          ex.sets || 3,
          ex.reps || 10,
          ex.weight || null,
          ex.duration || null,
          ex.restTime || 60,
          ex.notes || null
        ]);

        await connection.query(
          `INSERT INTO workout_exercises 
           (workout_id, exercise_id, order_index, sets, reps, weight, duration, rest_time, notes)
           VALUES ?`,
          [exerciseValues]
        );
      }
    }

    await connection.commit();

    // Fetch updated workout
    const [workout] = await pool.query(
      'SELECT * FROM workouts WHERE id = ?',
      [req.params.id]
    );

    const [workoutExercises] = await pool.query(
      `SELECT we.*, e.name, e.description, e.category, e.muscle_group, e.equipment
       FROM workout_exercises we
       JOIN exercises e ON we.exercise_id = e.id
       WHERE we.workout_id = ?
       ORDER BY we.order_index`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Workout updated successfully',
      data: {
        ...workout[0],
        exercises: workoutExercises
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating workout'
    });
  } finally {
    connection.release();
  }
});

// Delete workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM workouts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting workout'
    });
  }
});

// Duplicate workout
router.post('/:id/duplicate', auth, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Get original workout
    const [workouts] = await connection.query(
      'SELECT * FROM workouts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (workouts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    const original = workouts[0];

    await connection.beginTransaction();

    // Create new workout
    const [result] = await connection.query(
      'INSERT INTO workouts (user_id, name, description, workout_type) VALUES (?, ?, ?, ?)',
      [req.user.id, `${original.name} (Copy)`, original.description, original.workout_type || 'strength']
    );

    const newWorkoutId = result.insertId;

    // Copy exercises
    await connection.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, weight, duration, rest_time, notes, distance, calories, intensity)
       SELECT ?, exercise_id, order_index, sets, reps, weight, duration, rest_time, notes, distance, calories, intensity
       FROM workout_exercises WHERE workout_id = ?`,
      [newWorkoutId, req.params.id]
    );

    await connection.commit();

    // Fetch new workout with exercise count
    const [newWorkout] = await pool.query(
      `SELECT w.*, (SELECT COUNT(*) FROM workout_exercises WHERE workout_id = w.id) as exercise_count
       FROM workouts w WHERE w.id = ?`,
      [newWorkoutId]
    );

    res.status(201).json({
      success: true,
      message: 'Workout duplicated successfully',
      data: newWorkout[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Duplicate workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error duplicating workout'
    });
  } finally {
    connection.release();
  }
});

// Copy a predefined workout to user's workouts
router.post('/:id/copy', auth, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Get original workout (must be predefined or user's own)
    const [workouts] = await connection.query(
      'SELECT * FROM workouts WHERE id = ? AND (is_predefined = TRUE OR user_id = ?)',
      [req.params.id, req.user.id]
    );

    if (workouts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    const original = workouts[0];

    await connection.beginTransaction();

    // Create new workout for user (not predefined)
    const [result] = await connection.query(
      'INSERT INTO workouts (user_id, name, description, workout_type, is_predefined) VALUES (?, ?, ?, ?, FALSE)',
      [req.user.id, original.name, original.description, original.workout_type || 'strength']
    );

    const newWorkoutId = result.insertId;

    // Copy exercises
    await connection.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, order_index, sets, reps, weight, duration, rest_time, notes, distance, calories, intensity)
       SELECT ?, exercise_id, order_index, sets, reps, weight, duration, rest_time, notes, distance, calories, intensity
       FROM workout_exercises WHERE workout_id = ?`,
      [newWorkoutId, req.params.id]
    );

    await connection.commit();

    // Fetch new workout with exercise count
    const [newWorkout] = await pool.query(
      `SELECT w.*, (SELECT COUNT(*) FROM workout_exercises WHERE workout_id = w.id) as exercise_count
       FROM workouts w WHERE w.id = ?`,
      [newWorkoutId]
    );

    res.status(201).json({
      success: true,
      message: 'Workout copied to your workouts',
      data: newWorkout[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Copy workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error copying workout'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
