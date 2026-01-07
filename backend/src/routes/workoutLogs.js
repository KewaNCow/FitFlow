const express = require('express');
const { body } = require('express-validator');
const pool = require('../config/database');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Get workout logs for current user
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, workoutId, limit = 50, page = 1 } = req.query;

    let query = `
      SELECT 
        wl.*, 
        w.name as workout_name,
        COUNT(DISTINCT el.id) as exercises_completed,
        SUM(el.sets_completed) as total_sets,
        GROUP_CONCAT(DISTINCT e.name SEPARATOR ', ') as exercise_names
      FROM workout_logs wl
      LEFT JOIN workouts w ON wl.workout_id = w.id
      LEFT JOIN exercise_logs el ON el.workout_log_id = wl.id
      LEFT JOIN exercises e ON e.id = el.exercise_id
      WHERE wl.user_id = ?
    `;
    const params = [req.user.id];

    if (startDate) {
      query += ' AND wl.completed_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND wl.completed_at <= ?';
      params.push(endDate);
    }
    if (workoutId) {
      query += ' AND wl.workout_id = ?';
      params.push(workoutId);
    }

    query += ' GROUP BY wl.id ORDER BY wl.completed_at DESC';

    // Pagination
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), parseInt(offset));
    query += ' LIMIT ? OFFSET ?';

    const [logs] = await pool.query(query, params);

    // Get total count
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM workout_logs WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get workout logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workout logs'
    });
  }
});

// Get workout statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = 'AND completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      dateFilter = 'AND completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    } else if (period === 'year') {
      dateFilter = 'AND completed_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)';
    }

    // Total workouts completed
    const [totalResult] = await pool.query(
      `SELECT COUNT(*) as total FROM workout_logs WHERE user_id = ? ${dateFilter}`,
      [req.user.id]
    );

    // Total duration
    const [durationResult] = await pool.query(
      `SELECT SUM(duration_minutes) as total_minutes FROM workout_logs WHERE user_id = ? ${dateFilter}`,
      [req.user.id]
    );

    // Workouts per week (last 8 weeks)
    const [weeklyResult] = await pool.query(
      `SELECT 
        YEARWEEK(completed_at) as week,
        COUNT(*) as count
       FROM workout_logs 
       WHERE user_id = ? 
         AND completed_at >= DATE_SUB(NOW(), INTERVAL 8 WEEK)
       GROUP BY YEARWEEK(completed_at)
       ORDER BY week DESC`,
      [req.user.id]
    );

    // Most frequent workouts
    const [frequentWorkouts] = await pool.query(
      `SELECT w.name, COUNT(*) as count
       FROM workout_logs wl
       JOIN workouts w ON wl.workout_id = w.id
       WHERE wl.user_id = ? ${dateFilter}
       GROUP BY wl.workout_id, w.name
       ORDER BY count DESC
       LIMIT 5`,
      [req.user.id]
    );

    // Current streak
    const [streakResult] = await pool.query(
      `SELECT DATE(completed_at) as date
       FROM workout_logs
       WHERE user_id = ?
       GROUP BY DATE(completed_at)
       ORDER BY date DESC`,
      [req.user.id]
    );

    let currentStreak = 0;
    if (streakResult.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);

      for (const row of streakResult) {
        const logDate = new Date(row.date);
        logDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((checkDate - logDate) / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          currentStreak++;
          checkDate = logDate;
        } else {
          break;
        }
      }
    }

    // Total exercises and sets completed
    const [exerciseStats] = await pool.query(
      `SELECT 
        COUNT(DISTINCT el.exercise_id) as total_exercises,
        SUM(el.sets_completed) as total_sets
       FROM exercise_logs el
       JOIN workout_logs wl ON el.workout_log_id = wl.id
       WHERE wl.user_id = ? ${dateFilter}`,
      [req.user.id]
    );

    // Average workout duration
    const [avgDuration] = await pool.query(
      `SELECT AVG(duration_minutes) as avg_duration
       FROM workout_logs
       WHERE user_id = ? AND duration_minutes > 0 ${dateFilter}`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        totalWorkouts: totalResult[0].total,
        total_workouts: totalResult[0].total, // Legacy support
        totalMinutes: durationResult[0].total_minutes || 0,
        total_minutes: durationResult[0].total_minutes || 0, // Legacy support
        totalExercises: exerciseStats[0].total_exercises || 0,
        total_exercises: exerciseStats[0].total_exercises || 0, // Legacy support
        totalSets: exerciseStats[0].total_sets || 0,
        total_sets: exerciseStats[0].total_sets || 0, // Legacy support
        avgDuration: Math.round(avgDuration[0].avg_duration || 0),
        avg_duration: Math.round(avgDuration[0].avg_duration || 0), // Legacy support
        weeklyData: weeklyResult,
        frequentWorkouts,
        currentStreak
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Log a completed workout
router.post('/', auth, [
  body('workoutId').optional().custom(value => {
    const parsed = parseInt(value);
    if (isNaN(parsed) || parsed < 1) {
      throw new Error('Invalid workout ID');
    }
    return true;
  }),
  body('durationMinutes').optional().isInt({ min: 0 }).withMessage('Duration must be a valid number'),
  body('completedAt').optional().isISO8601().withMessage('Completed at must be a valid ISO 8601 date'),
  body('exercises').optional().isArray().withMessage('Exercises must be an array')
], validate, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Received workout log request:', JSON.stringify(req.body, null, 2));
    
    const { workoutId, durationMinutes, notes, completedAt, exercises } = req.body;

    // Convert completedAt to MySQL datetime format if provided
    let mysqlCompletedAt;
    if (completedAt) {
      const date = new Date(completedAt);
      mysqlCompletedAt = date.toISOString().slice(0, 19).replace('T', ' ');
    } else {
      const date = new Date();
      mysqlCompletedAt = date.toISOString().slice(0, 19).replace('T', ' ');
    }

    // Insert workout log
    const [result] = await connection.query(
      `INSERT INTO workout_logs (user_id, workout_id, duration_minutes, notes, completed_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        workoutId || null,
        durationMinutes || null,
        notes || null,
        mysqlCompletedAt
      ]
    );

    const workoutLogId = result.insertId;

    // Insert exercise logs if provided
    if (exercises && exercises.length > 0) {
      for (const exercise of exercises) {
        const { exerciseId, sets } = exercise;
        
        if (!exerciseId || !sets || sets.length === 0) continue;

        // Extract reps and weights from sets
        const repsPerSet = sets.map(s => s.reps || 0);
        const weightPerSet = sets.map(s => s.weight || 0);
        const totalSets = sets.length;
        
        await connection.query(
          `INSERT INTO exercise_logs 
           (workout_log_id, exercise_id, sets_completed, reps_per_set, weight_per_set, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            workoutLogId,
            exerciseId,
            totalSets,
            JSON.stringify(repsPerSet),
            JSON.stringify(weightPerSet),
            sets.map(s => s.notes).filter(Boolean).join('; ') || null
          ]
        );
      }
    }

    await connection.commit();

    // Fetch the complete log with workout name
    const [newLog] = await pool.query(
      `SELECT wl.*, w.name as workout_name
       FROM workout_logs wl
       LEFT JOIN workouts w ON wl.workout_id = w.id
       WHERE wl.id = ?`,
      [workoutLogId]
    );

    res.status(201).json({
      success: true,
      message: 'Workout logged successfully',
      data: newLog[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Log workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging workout',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Get single workout log by ID with exercise details
router.get('/:id', auth, async (req, res) => {
  try {
    // Get workout log
    const [logs] = await pool.query(
      `SELECT wl.*, w.name as workout_name
       FROM workout_logs wl
       LEFT JOIN workouts w ON wl.workout_id = w.id
       WHERE wl.id = ? AND wl.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (logs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Workout log not found'
      });
    }

    const workoutLog = logs[0];

    // Get exercise logs
    const [exerciseLogs] = await pool.query(
      `SELECT el.*, e.name as exercise_name, e.category
       FROM exercise_logs el
       LEFT JOIN exercises e ON el.exercise_id = e.id
       WHERE el.workout_log_id = ?
       ORDER BY el.id`,
      [req.params.id]
    );

    // Parse JSON fields for frontend
    const parsedExercises = exerciseLogs.map(log => {
      const parsedLog = { ...log };
      
      // Parse weight_per_set if it's a string
      if (log.weight_per_set && typeof log.weight_per_set === 'string') {
        try {
          parsedLog.weight_per_set = JSON.parse(log.weight_per_set);
        } catch (e) {
          parsedLog.weight_per_set = [];
        }
      }
      
      // Parse reps_per_set if it's a string
      if (log.reps_per_set && typeof log.reps_per_set === 'string') {
        try {
          parsedLog.reps_per_set = JSON.parse(log.reps_per_set);
        } catch (e) {
          parsedLog.reps_per_set = [];
        }
      }
      
      // Calculate totals for convenience
      if (parsedLog.weight_per_set && parsedLog.reps_per_set) {
        parsedLog.total_volume = 0;
        for (let i = 0; i < Math.min(parsedLog.weight_per_set.length, parsedLog.reps_per_set.length); i++) {
          parsedLog.total_volume += (parseFloat(parsedLog.weight_per_set[i]) || 0) * (parseInt(parsedLog.reps_per_set[i]) || 0);
        }
        parsedLog.total_reps = parsedLog.reps_per_set.reduce((sum, r) => sum + (parseInt(r) || 0), 0);
        parsedLog.max_weight = Math.max(...parsedLog.weight_per_set.filter(w => w > 0));
      }
      
      return parsedLog;
    });

    workoutLog.exercises = parsedExercises;

    res.json({
      success: true,
      data: workoutLog
    });
  } catch (error) {
    console.error('Get workout log error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workout log'
    });
  }
});

// Update workout log
router.put('/:id', auth, async (req, res) => {
  try {
    const { durationMinutes, notes, completedAt } = req.body;

    // Check ownership
    const [existing] = await pool.query(
      'SELECT id FROM workout_logs WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Workout log not found'
      });
    }

    const updates = [];
    const values = [];

    if (durationMinutes !== undefined) {
      updates.push('duration_minutes = ?');
      values.push(durationMinutes);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }
    if (completedAt !== undefined) {
      updates.push('completed_at = ?');
      values.push(completedAt);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }

    values.push(req.params.id);

    await pool.query(
      `UPDATE workout_logs SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedLog] = await pool.query(
      `SELECT wl.*, w.name as workout_name
       FROM workout_logs wl
       LEFT JOIN workouts w ON wl.workout_id = w.id
       WHERE wl.id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Workout log updated successfully',
      data: updatedLog[0]
    });
  } catch (error) {
    console.error('Update workout log error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating workout log'
    });
  }
});

// Delete workout log
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM workout_logs WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Workout log not found'
      });
    }

    res.json({
      success: true,
      message: 'Workout log deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout log error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting workout log'
    });
  }
});

module.exports = router;
