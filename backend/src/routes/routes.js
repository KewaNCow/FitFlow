const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all routes for user
router.get('/', auth, async (req, res) => {
  try {
    const [routes] = await pool.execute(
      `SELECT * FROM routes WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    
    // Parse waypoints JSON for each route
    const parsedRoutes = routes.map(route => ({
      ...route,
      waypoints: route.waypoints ? JSON.parse(route.waypoints) : []
    }));
    
    res.json({ success: true, data: parsedRoutes });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single route
router.get('/:id', auth, async (req, res) => {
  try {
    const [routes] = await pool.execute(
      `SELECT * FROM routes WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    
    if (routes.length === 0) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    
    const route = {
      ...routes[0],
      waypoints: routes[0].waypoints ? JSON.parse(routes[0].waypoints) : []
    };
    
    res.json({ success: true, data: route });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create route
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Route name is required'),
  body('activity_type').isIn(['running', 'biking', 'walking', 'hiking']).optional(),
  body('waypoints').isArray().withMessage('Waypoints must be an array'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { 
      name, 
      description, 
      activity_type = 'running', 
      distance_km, 
      estimated_duration,
      elevation_gain,
      waypoints,
      start_location,
      end_location,
      workout_id = null
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO routes (user_id, name, description, activity_type, distance_km, 
        estimated_duration, elevation_gain, waypoints, start_location, end_location, workout_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, 
        name, 
        description || null, 
        activity_type, 
        distance_km || null,
        estimated_duration || null,
        elevation_gain || null,
        JSON.stringify(waypoints || []),
        start_location || null,
        end_location || null,
        workout_id
      ]
    );

    const [newRoute] = await pool.execute('SELECT * FROM routes WHERE id = ?', [result.insertId]);
    
    res.status(201).json({ 
      success: true, 
      data: {
        ...newRoute[0],
        waypoints: newRoute[0].waypoints ? JSON.parse(newRoute[0].waypoints) : []
      }
    });
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update route
router.put('/:id', auth, async (req, res) => {
  try {
    // Check ownership
    const [existing] = await pool.execute(
      'SELECT id FROM routes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    const { 
      name, 
      description, 
      activity_type, 
      distance_km, 
      estimated_duration,
      elevation_gain,
      waypoints,
      start_location,
      end_location,
      is_favorite
    } = req.body;

    await pool.execute(
      `UPDATE routes SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        activity_type = COALESCE(?, activity_type),
        distance_km = COALESCE(?, distance_km),
        estimated_duration = COALESCE(?, estimated_duration),
        elevation_gain = COALESCE(?, elevation_gain),
        waypoints = COALESCE(?, waypoints),
        start_location = COALESCE(?, start_location),
        end_location = COALESCE(?, end_location),
        is_favorite = COALESCE(?, is_favorite)
       WHERE id = ?`,
      [
        name || null, 
        description, 
        activity_type || null,
        distance_km,
        estimated_duration,
        elevation_gain,
        waypoints ? JSON.stringify(waypoints) : null,
        start_location,
        end_location,
        is_favorite !== undefined ? is_favorite : null,
        req.params.id
      ]
    );

    const [updated] = await pool.execute('SELECT * FROM routes WHERE id = ?', [req.params.id]);
    
    res.json({ 
      success: true, 
      data: {
        ...updated[0],
        waypoints: updated[0].waypoints ? JSON.parse(updated[0].waypoints) : []
      }
    });
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete route
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM routes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    res.json({ success: true, message: 'Route deleted' });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle favorite
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const [routes] = await pool.execute(
      'SELECT is_favorite FROM routes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (routes.length === 0) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    await pool.execute(
      'UPDATE routes SET is_favorite = ? WHERE id = ?',
      [!routes[0].is_favorite, req.params.id]
    );

    res.json({ success: true, data: { is_favorite: !routes[0].is_favorite } });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Log a completed route
router.post('/:id/log', auth, async (req, res) => {
  try {
    const { 
      actual_duration, 
      actual_distance_km, 
      average_pace, 
      average_speed,
      calories_burned,
      notes 
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO route_logs (user_id, route_id, actual_duration, actual_distance_km, 
        average_pace, average_speed, calories_burned, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        req.params.id,
        actual_duration || null,
        actual_distance_km || null,
        average_pace || null,
        average_speed || null,
        calories_burned || null,
        notes || null
      ]
    );

    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('Log route error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get route logs/history
router.get('/logs/history', auth, async (req, res) => {
  try {
    const [logs] = await pool.execute(
      `SELECT rl.*, r.name as route_name, r.activity_type
       FROM route_logs rl
       LEFT JOIN routes r ON rl.route_id = r.id
       WHERE rl.user_id = ?
       ORDER BY rl.completed_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get route logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get route statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_activities,
        SUM(actual_distance_km) as total_distance,
        SUM(actual_duration) as total_duration,
        SUM(calories_burned) as total_calories,
        AVG(average_pace) as avg_pace,
        AVG(average_speed) as avg_speed
       FROM route_logs
       WHERE user_id = ?`,
      [req.user.id]
    );

    const [byType] = await pool.execute(
      `SELECT 
        r.activity_type,
        COUNT(*) as count,
        SUM(rl.actual_distance_km) as distance
       FROM route_logs rl
       JOIN routes r ON rl.route_id = r.id
       WHERE rl.user_id = ?
       GROUP BY r.activity_type`,
      [req.user.id]
    );

    res.json({ 
      success: true, 
      data: {
        summary: stats[0],
        by_activity: byType
      }
    });
  } catch (error) {
    console.error('Get route stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
