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
    const weightProgress = progressData.map(log => {
      let weight = 0;
      let totalReps = 0;
      
      // Try to parse JSON data first (new format)
      if (log.weight_per_set && log.reps_per_set) {
        try {
          const weights = JSON.parse(log.weight_per_set);
          const reps = JSON.parse(log.reps_per_set);
          // Calculate average weight across sets
          weight = weights.reduce((sum, w) => sum + (parseFloat(w) || 0), 0) / weights.length || 0;
          totalReps = reps.reduce((sum, r) => sum + (parseInt(r) || 0), 0);
        } catch (e) {
          // Fall back to old format
          weight = parseFloat(log.weight_used) || 0;
          totalReps = parseInt(log.reps_completed) || 0;
        }
      } else {
        // Use old format
        weight = parseFloat(log.weight_used) || 0;
        totalReps = parseInt(log.reps_completed) || 0;
      }
      
      return {
        date: log.date,
        weight: weight,
        sets: log.sets_completed,
        reps: totalReps
      };
    });

    // Calculate personal records
    let maxWeight = 0;
    let maxVolume = 0; // weight * reps * sets
    let maxReps = 0;

    progressData.forEach(log => {
      let weight = 0;
      let totalReps = 0;
      let sets = log.sets_completed || 0;
      
      // Try to parse JSON data first (new format)
      if (log.weight_per_set && log.reps_per_set) {
        try {
          const weights = JSON.parse(log.weight_per_set);
          const reps = JSON.parse(log.reps_per_set);
          
          // Find max weight across all sets
          const maxWeightInLog = Math.max(...weights.filter(w => w > 0));
          weight = maxWeightInLog || 0;
          
          // Calculate total reps
          totalReps = reps.reduce((sum, r) => sum + (parseInt(r) || 0), 0);
          
          // Calculate total volume
          let volume = 0;
          for (let i = 0; i < Math.min(weights.length, reps.length); i++) {
            volume += (parseFloat(weights[i]) || 0) * (parseInt(reps[i]) || 0);
          }
          
          if (weight > maxWeight) maxWeight = weight;
          if (volume > maxVolume) maxVolume = volume;
          
          // Find max reps in a single set
          const maxRepsInLog = Math.max(...reps.filter(r => r > 0));
          if (maxRepsInLog > maxReps) maxReps = maxRepsInLog;
        } catch (e) {
          // Fall back to old format
          weight = parseFloat(log.weight_used) || 0;
          totalReps = parseInt(log.reps_completed) || 0;
          const volume = weight * sets * totalReps;
          
          if (weight > maxWeight) maxWeight = weight;
          if (volume > maxVolume) maxVolume = volume;
          if (totalReps > maxReps) maxReps = totalReps;
        }
      } else {
        // Use old format
        weight = parseFloat(log.weight_used) || 0;
        totalReps = parseInt(log.reps_completed) || 0;
        const volume = weight * sets * totalReps;
        
        if (weight > maxWeight) maxWeight = weight;
        if (volume > maxVolume) maxVolume = volume;
        if (totalReps > maxReps) maxReps = totalReps;
      }
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

    // First get the list of exercises with basic stats
    const [exerciseProgress] = await pool.query(
      `SELECT 
        e.id,
        e.name,
        e.category,
        e.muscle_group,
        COUNT(el.id) as times_performed,
        MAX(el.sets_completed) as max_sets
       FROM exercises e
       JOIN exercise_logs el ON e.id = el.exercise_id
       JOIN workout_logs wl ON el.workout_log_id = wl.id
       WHERE wl.user_id = ? AND wl.completed_at >= ?
       GROUP BY e.id, e.name, e.category, e.muscle_group
       ORDER BY times_performed DESC`,
      [req.user.id, daysAgo]
    );

    // Process each exercise to calculate max and avg weight from JSON
    const processedData = await Promise.all(
      exerciseProgress.map(async (exercise) => {
        // Get all logs for this exercise
        const [logs] = await pool.query(
          `SELECT el.weight_per_set, el.weight_used
           FROM exercise_logs el
           JOIN workout_logs wl ON el.workout_log_id = wl.id
           WHERE el.exercise_id = ? AND wl.user_id = ? AND wl.completed_at >= ?`,
          [exercise.id, req.user.id, daysAgo]
        );

        let maxWeight = 0;
        let totalWeight = 0;
        let weightCount = 0;

        logs.forEach(log => {
          if (log.weight_per_set) {
            try {
              const weights = JSON.parse(log.weight_per_set);
              weights.forEach(w => {
                const weight = parseFloat(w);
                if (weight > 0) {
                  if (weight > maxWeight) maxWeight = weight;
                  totalWeight += weight;
                  weightCount++;
                }
              });
            } catch (e) {
              // Fall back to old format
              const weight = parseFloat(log.weight_used);
              if (weight > 0) {
                if (weight > maxWeight) maxWeight = weight;
                totalWeight += weight;
                weightCount++;
              }
            }
          } else if (log.weight_used) {
            const weight = parseFloat(log.weight_used);
            if (weight > 0) {
              if (weight > maxWeight) maxWeight = weight;
              totalWeight += weight;
              weightCount++;
            }
          }
        });

        return {
          id: exercise.id,
          name: exercise.name,
          category: exercise.category,
          muscle_group: exercise.muscle_group,
          times_performed: exercise.times_performed,
          max_weight: maxWeight,
          avg_weight: weightCount > 0 ? Math.round(totalWeight / weightCount) : 0,
          max_sets: exercise.max_sets
        };
      })
    );

    res.json({
      success: true,
      data: processedData
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

    // Get all exercise logs with weight and reps data
    const [exerciseLogs] = await pool.query(
      `SELECT 
        DATE(wl.completed_at) as date,
        el.weight_per_set,
        el.reps_per_set,
        el.weight_used,
        el.reps_completed,
        el.sets_completed,
        wl.id as workout_id
       FROM exercise_logs el
       JOIN workout_logs wl ON el.workout_log_id = wl.id
       WHERE wl.user_id = ? AND wl.completed_at >= ?
       ORDER BY date`,
      [req.user.id, daysAgo]
    );

    // Calculate volume by date
    const dailyVolumeMap = {};
    const workoutCounts = {};
    
    exerciseLogs.forEach(log => {
      const date = log.date.toISOString().split('T')[0];
      let volume = 0;
      
      // Try to parse JSON data first (new format)
      if (log.weight_per_set && log.reps_per_set) {
        try {
          const weights = JSON.parse(log.weight_per_set);
          const reps = JSON.parse(log.reps_per_set);
          for (let i = 0; i < Math.min(weights.length, reps.length); i++) {
            volume += (parseFloat(weights[i]) || 0) * (parseInt(reps[i]) || 0);
          }
        } catch (e) {
          // Fall back to old format
          volume = (parseFloat(log.weight_used) || 0) * 
                   (parseInt(log.reps_completed) || 0) * 
                   (log.sets_completed || 0);
        }
      } else {
        // Use old format
        volume = (parseFloat(log.weight_used) || 0) * 
                 (parseInt(log.reps_completed) || 0) * 
                 (log.sets_completed || 0);
      }
      
      dailyVolumeMap[date] = (dailyVolumeMap[date] || 0) + volume;
      workoutCounts[date] = workoutCounts[date] || new Set();
      workoutCounts[date].add(log.workout_id);
    });

    const volumeData = Object.keys(dailyVolumeMap).map(date => ({
      date,
      total_volume: Math.round(dailyVolumeMap[date]),
      workouts: workoutCounts[date].size
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate weekly volume
    const weeklyVolumeMap = {};
    const weeklyWorkoutCounts = {};
    
    exerciseLogs.forEach(log => {
      const date = new Date(log.date);
      const yearWeek = getYearWeek(date);
      const weekStart = getWeekStart(date);
      
      let volume = 0;
      
      // Try to parse JSON data first (new format)
      if (log.weight_per_set && log.reps_per_set) {
        try {
          const weights = JSON.parse(log.weight_per_set);
          const reps = JSON.parse(log.reps_per_set);
          for (let i = 0; i < Math.min(weights.length, reps.length); i++) {
            volume += (parseFloat(weights[i]) || 0) * (parseInt(reps[i]) || 0);
          }
        } catch (e) {
          // Fall back to old format
          volume = (parseFloat(log.weight_used) || 0) * 
                   (parseInt(log.reps_completed) || 0) * 
                   (log.sets_completed || 0);
        }
      } else {
        // Use old format
        volume = (parseFloat(log.weight_used) || 0) * 
                 (parseInt(log.reps_completed) || 0) * 
                 (log.sets_completed || 0);
      }
      
      if (!weeklyVolumeMap[yearWeek]) {
        weeklyVolumeMap[yearWeek] = {
          week: yearWeek,
          week_start: weekStart,
          total_volume: 0,
          workouts: new Set()
        };
      }
      
      weeklyVolumeMap[yearWeek].total_volume += volume;
      weeklyVolumeMap[yearWeek].workouts.add(log.workout_id);
    });

    const weeklyVolume = Object.values(weeklyVolumeMap).map(week => ({
      week: week.week,
      week_start: week.week_start,
      total_volume: Math.round(week.total_volume),
      workouts: week.workouts.size
    })).sort((a, b) => a.week - b.week);

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

// Helper function to get year-week number
function getYearWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return d.getUTCFullYear() * 100 + weekNo;
}

// Helper function to get the start of the week (Monday)
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

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

// Get workout type distribution
router.get('/workout-types', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const [types] = await pool.query(
      `SELECT 
        w.workout_type,
        COUNT(*) as count,
        SUM(wl.duration_minutes) as total_duration,
        AVG(wl.duration_minutes) as avg_duration
       FROM workout_logs wl
       JOIN workouts w ON wl.workout_id = w.id
       WHERE wl.user_id = ? AND wl.completed_at >= ? AND w.workout_type IS NOT NULL
       GROUP BY w.workout_type
       ORDER BY count DESC`,
      [req.user.id, daysAgo]
    );

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Get workout types stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get personal records and achievements
router.get('/records', auth, async (req, res) => {
  try {
    // Heaviest lift by exercise
    const [heaviestLifts] = await pool.query(
      `SELECT 
        e.name as exercise_name,
        e.muscle_group,
        el.weight_per_set,
        wl.completed_at as date_achieved
       FROM exercise_logs el
       JOIN exercises e ON el.exercise_id = e.id
       JOIN workout_logs wl ON el.workout_log_id = wl.id
       WHERE wl.user_id = ?
       ORDER BY el.id DESC
       LIMIT 100`,
      [req.user.id]
    );

    // Process to find max weights per exercise
    const exerciseWeights = {};
    heaviestLifts.forEach(log => {
      try {
        const weights = JSON.parse(log.weight_per_set);
        const maxWeight = Math.max(...weights.filter(w => w > 0));
        if (!exerciseWeights[log.exercise_name] || maxWeight > exerciseWeights[log.exercise_name].max_weight) {
          exerciseWeights[log.exercise_name] = {
            exercise_name: log.exercise_name,
            muscle_group: log.muscle_group,
            max_weight: maxWeight,
            date_achieved: log.date_achieved
          };
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });
    const topHeaviestLifts = Object.values(exerciseWeights)
      .sort((a, b) => b.max_weight - a.max_weight)
      .slice(0, 10);

    // Most reps in a set
    const [mostRepsData] = await pool.query(
      `SELECT 
        e.name as exercise_name,
        el.reps_per_set,
        wl.completed_at as date_achieved
       FROM exercise_logs el
       JOIN exercises e ON el.exercise_id = e.id
       JOIN workout_logs wl ON el.workout_log_id = wl.id
       WHERE wl.user_id = ?
       ORDER BY el.id DESC
       LIMIT 100`,
      [req.user.id]
    );

    // Process to find max reps per exercise
    const exerciseReps = {};
    mostRepsData.forEach(log => {
      try {
        const reps = JSON.parse(log.reps_per_set);
        const maxReps = Math.max(...reps.filter(r => r > 0));
        if (!exerciseReps[log.exercise_name] || maxReps > exerciseReps[log.exercise_name].max_reps) {
          exerciseReps[log.exercise_name] = {
            exercise_name: log.exercise_name,
            max_reps: maxReps,
            date_achieved: log.date_achieved
          };
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });
    const topMostReps = Object.values(exerciseReps)
      .sort((a, b) => b.max_reps - a.max_reps)
      .slice(0, 10);

    // Longest workout
    const [longestWorkout] = await pool.query(
      `SELECT 
        w.name as workout_name,
        wl.duration_minutes,
        wl.completed_at as date
       FROM workout_logs wl
       LEFT JOIN workouts w ON wl.workout_id = w.id
       WHERE wl.user_id = ?
       ORDER BY wl.duration_minutes DESC
       LIMIT 1`,
      [req.user.id]
    );

    // Total volume lifted (calculate from all logs)
    const [volumeData] = await pool.query(
      `SELECT 
        el.weight_per_set,
        el.reps_per_set,
        el.sets_completed
       FROM exercise_logs el
       JOIN workout_logs wl ON el.workout_log_id = wl.id
       WHERE wl.user_id = ?`,
      [req.user.id]
    );

    let totalVolume = 0;
    volumeData.forEach(log => {
      try {
        const weights = JSON.parse(log.weight_per_set);
        const reps = JSON.parse(log.reps_per_set);
        for (let i = 0; i < Math.min(weights.length, reps.length); i++) {
          totalVolume += (weights[i] || 0) * (reps[i] || 0);
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });

    res.json({
      success: true,
      data: {
        heaviest_lifts: topHeaviestLifts,
        most_reps: topMostReps,
        longest_workout: longestWorkout[0] || null,
        total_volume: Math.round(totalVolume)
      }
    });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get workout frequency by time of day
router.get('/time-distribution', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const [distribution] = await pool.query(
      `SELECT 
        CASE 
          WHEN HOUR(completed_at) BETWEEN 5 AND 11 THEN 'Morning'
          WHEN HOUR(completed_at) BETWEEN 12 AND 16 THEN 'Afternoon'
          WHEN HOUR(completed_at) BETWEEN 17 AND 21 THEN 'Evening'
          ELSE 'Night'
        END as time_of_day,
        COUNT(*) as count,
        AVG(duration_minutes) as avg_duration
       FROM workout_logs
       WHERE user_id = ? AND completed_at >= ?
       GROUP BY time_of_day
       ORDER BY FIELD(time_of_day, 'Morning', 'Afternoon', 'Evening', 'Night')`,
      [req.user.id, daysAgo]
    );

    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Get time distribution error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
