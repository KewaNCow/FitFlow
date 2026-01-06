const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { auth } = require('../middleware/auth');

// Get overall workout statistics
router.get('/overview', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Total workouts
    const [workoutStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_workouts,
        SUM(duration_minutes) as total_duration,
        AVG(duration_minutes) as avg_duration
       FROM workout_logs 
       WHERE user_id = ? AND completed_at >= ?`,
      [req.user.id, daysAgo]
    );

    // Workouts by day of week
    const [byDayOfWeek] = await pool.query(
      `SELECT 
        DAYNAME(completed_at) as day,
        DAYOFWEEK(completed_at) as day_num,
        COUNT(*) as count
       FROM workout_logs 
       WHERE user_id = ? AND completed_at >= ?
       GROUP BY DAYNAME(completed_at), DAYOFWEEK(completed_at)
       ORDER BY day_num`,
      [req.user.id, daysAgo]
    );

    // Workouts over time (daily)
    const [dailyWorkouts] = await pool.query(
      `SELECT 
        DATE(completed_at) as date,
        COUNT(*) as count,
        SUM(duration_minutes) as duration
       FROM workout_logs 
       WHERE user_id = ? AND completed_at >= ?
       GROUP BY DATE(completed_at)
       ORDER BY date`,
      [req.user.id, daysAgo]
    );

    // Current streak
    const [streakData] = await pool.query(
      `SELECT DATE(completed_at) as workout_date
       FROM workout_logs 
       WHERE user_id = ?
       GROUP BY DATE(completed_at)
       ORDER BY workout_date DESC`,
      [req.user.id]
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < streakData.length; i++) {
      const workoutDate = new Date(streakData[i].workout_date);
      workoutDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (workoutDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (i === 0 && workoutDate.getTime() === expectedDate.getTime() - 86400000) {
        // Allow yesterday to count if today hasn't been logged yet
        streak++;
      } else {
        break;
      }
    }

    res.json({
      success: true,
      data: {
        overview: workoutStats[0],
        by_day_of_week: byDayOfWeek,
        daily_workouts: dailyWorkouts,
        current_streak: streak
      }
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get exercise-specific progress (weight, reps over time)
router.get('/exercise/:exerciseId', auth, async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { period = '90' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get exercise info
    const [exercise] = await pool.query(
      'SELECT name, category FROM exercises WHERE id = ?',
      [exerciseId]
    );

    if (exercise.length === 0) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }

    // Get all logged data for this exercise
    const [progressData] = await pool.query(
      `SELECT 
        el.id,
        el.sets_completed,
        el.reps_completed,
        el.weight_used,
        el.weight_per_set,
        el.reps_per_set,
        wl.completed_at as date
       FROM exercise_logs el
       JOIN workout_logs wl ON el.workout_log_id = wl.id
       WHERE el.exercise_id = ? AND wl.user_id = ? AND wl.completed_at >= ?
       ORDER BY wl.completed_at ASC`,
      [exerciseId, req.user.id, daysAgo]
    );

    // Calculate progress metrics
    const weightProgress = progressData.map(log => ({
      date: log.date,
      weight: parseFloat(log.weight_used) || 0,
      sets: log.sets_completed,
      reps: log.reps_completed
    }));

    // Calculate personal records
    let maxWeight = 0;
    let maxVolume = 0; // weight * reps * sets
    let maxReps = 0;

    progressData.forEach(log => {
      const weight = parseFloat(log.weight_used) || 0;
      const sets = log.sets_completed || 0;
      const reps = parseInt(log.reps_completed) || 0;
      const volume = weight * sets * reps;

      if (weight > maxWeight) maxWeight = weight;
      if (volume > maxVolume) maxVolume = volume;
      if (reps > maxReps) maxReps = reps;
    });

    res.json({
      success: true,
      data: {
        exercise: exercise[0],
        progress: weightProgress,
        personal_records: {
          max_weight: maxWeight,
          max_volume: maxVolume,
          max_reps: maxReps,
          total_sessions: progressData.length
        }
      }
    });
  } catch (error) {
    console.error('Get exercise progress error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all exercises with progress data
router.get('/exercises/progress', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const [exerciseProgress] = await pool.query(
      `SELECT 
        e.id,
        e.name,
        e.category,
        e.muscle_group,
        COUNT(el.id) as times_performed,
        MAX(el.weight_used) as max_weight,
        AVG(el.weight_used) as avg_weight,
        MAX(el.sets_completed) as max_sets
       FROM exercises e
       JOIN exercise_logs el ON e.id = el.exercise_id
       JOIN workout_logs wl ON el.workout_log_id = wl.id
       WHERE wl.user_id = ? AND wl.completed_at >= ?
       GROUP BY e.id, e.name, e.category, e.muscle_group
       ORDER BY times_performed DESC`,
      [req.user.id, daysAgo]
    );

    res.json({
      success: true,
      data: exerciseProgress
    });
  } catch (error) {
    console.error('Get exercises progress error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get volume over time (total weight lifted)
router.get('/volume', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const [volumeData] = await pool.query(
      `SELECT 
        DATE(wl.completed_at) as date,
        SUM(el.weight_used * el.sets_completed * CAST(el.reps_completed AS UNSIGNED)) as total_volume,
        COUNT(DISTINCT wl.id) as workouts
       FROM exercise_logs el
       JOIN workout_logs wl ON el.workout_log_id = wl.id
       WHERE wl.user_id = ? AND wl.completed_at >= ? AND el.weight_used IS NOT NULL
       GROUP BY DATE(wl.completed_at)
       ORDER BY date`,
      [req.user.id, daysAgo]
    );

    // Weekly volume
    const [weeklyVolume] = await pool.query(
      `SELECT 
        YEARWEEK(wl.completed_at) as week,
        MIN(DATE(wl.completed_at)) as week_start,
        SUM(el.weight_used * el.sets_completed * CAST(el.reps_completed AS UNSIGNED)) as total_volume,
        COUNT(DISTINCT wl.id) as workouts
       FROM exercise_logs el
       JOIN workout_logs wl ON el.workout_log_id = wl.id
       WHERE wl.user_id = ? AND wl.completed_at >= ? AND el.weight_used IS NOT NULL
       GROUP BY YEARWEEK(wl.completed_at)
       ORDER BY week`,
      [req.user.id, daysAgo]
    );

    res.json({
      success: true,
      data: {
        daily: volumeData,
        weekly: weeklyVolume
      }
    });
  } catch (error) {
    console.error('Get volume stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get muscle group distribution
router.get('/muscle-groups', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const [distribution] = await pool.query(
      `SELECT 
        e.muscle_group,
        COUNT(el.id) as exercise_count,
        SUM(el.sets_completed) as total_sets
       FROM exercise_logs el
       JOIN exercises e ON el.exercise_id = e.id
       JOIN workout_logs wl ON el.workout_log_id = wl.id
       WHERE wl.user_id = ? AND wl.completed_at >= ? AND e.muscle_group IS NOT NULL
       GROUP BY e.muscle_group
       ORDER BY total_sets DESC`,
      [req.user.id, daysAgo]
    );

    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Get muscle group stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
