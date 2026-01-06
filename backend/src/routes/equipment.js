const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all equipment (system + user's custom)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT e.*, 
        CASE WHEN e.user_id IS NULL THEN 'system' ELSE 'custom' END as source
      FROM equipment e
      WHERE (e.user_id IS NULL ${req.user ? 'OR e.user_id = ?' : ''})
    `;
    const params = req.user ? [req.user.id] : [];

    if (category) {
      query += ' AND e.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (e.name LIKE ? OR e.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY e.category, e.name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [equipment] = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total FROM equipment e
      WHERE (e.user_id IS NULL ${req.user ? 'OR e.user_id = ?' : ''})
    `;
    const countParams = req.user ? [req.user.id] : [];

    if (category) {
      countQuery += ' AND e.category = ?';
      countParams.push(category);
    }
    if (search) {
      countQuery += ' AND (e.name LIKE ? OR e.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        equipment,
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment'
    });
  }
});

// Get equipment categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'free_weights', name: 'Free Weights', description: 'Barbells, dumbbells, kettlebells' },
      { id: 'machines', name: 'Machines', description: 'Cable machines, leg press, etc.' },
      { id: 'cardio', name: 'Cardio Equipment', description: 'Treadmills, bikes, rowers' },
      { id: 'bodyweight', name: 'Bodyweight Equipment', description: 'Pull-up bars, dip bars, rings' },
      { id: 'accessories', name: 'Accessories', description: 'Bands, ropes, mats' },
      { id: 'other', name: 'Other', description: 'Benches, racks, misc.' }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get equipment categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// Get single equipment
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    let query = `
      SELECT e.*,
        CASE WHEN e.user_id IS NULL THEN 'system' ELSE 'custom' END as source
      FROM equipment e
      WHERE e.id = ? AND (e.user_id IS NULL ${req.user ? 'OR e.user_id = ?' : ''})
    `;
    const params = req.user ? [req.params.id, req.user.id] : [req.params.id];

    const [equipment] = await pool.query(query, params);

    if (equipment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: equipment[0]
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment'
    });
  }
});

// Create custom equipment (authenticated users only)
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Equipment name is required'),
  body('category').optional().isIn(['free_weights', 'machines', 'cardio', 'bodyweight', 'accessories', 'other'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }

  try {
    const { name, description, category, image_url } = req.body;

    const [result] = await pool.query(
      `INSERT INTO equipment (name, description, category, image_url, user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description || null, category || 'other', image_url || null, req.user.id]
    );

    const [newEquipment] = await pool.query(
      'SELECT * FROM equipment WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: newEquipment[0]
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating equipment'
    });
  }
});

// Update custom equipment (owner only)
router.put('/:id', auth, [
  body('name').optional().trim().notEmpty().withMessage('Equipment name cannot be empty'),
  body('category').optional().isIn(['free_weights', 'machines', 'cardio', 'bodyweight', 'accessories', 'other'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }

  try {
    // Check ownership (only custom equipment can be edited)
    const [existing] = await pool.query(
      'SELECT id, user_id FROM equipment WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    if (existing[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own custom equipment'
      });
    }

    const { name, description, category, image_url } = req.body;

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
    if (category) {
      updates.push('category = ?');
      values.push(category);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(image_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push('updated_at = NOW()');
    values.push(req.params.id);

    await pool.query(
      `UPDATE equipment SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updated] = await pool.query(
      'SELECT * FROM equipment WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating equipment'
    });
  }
});

// Delete custom equipment (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check ownership
    const [existing] = await pool.query(
      'SELECT id, user_id FROM equipment WHERE id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    if (existing[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own custom equipment'
      });
    }

    await pool.query('DELETE FROM equipment WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting equipment'
    });
  }
});

module.exports = router;
