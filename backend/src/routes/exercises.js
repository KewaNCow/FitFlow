const express = require('express');
const { body, query } = require('express-validator');
const pool = require('../config/database');
const { auth, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Get all exercises with filtering and pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      muscleGroup,
      equipment,
      difficulty,
      search,
      customOnly,
      page = 1,
      limit = 20
    } = req.query;

    let whereClause = 'WHERE (user_id IS NULL';
    const params = [];
    
    // Include user's custom exercises if authenticated
    if (req.user) {
      whereClause += ' OR user_id = ?';
      params.push(req.user.id);
    }
    whereClause += ')';

    // Filter for custom only
    if (customOnly === 'true' && req.user) {
      whereClause = 'WHERE user_id = ?';
      params.length = 0;
      params.push(req.user.id);
    }

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }
    if (muscleGroup) {
      whereClause += ' AND muscle_group = ?';
      params.push(muscleGroup);
    }
    if (equipment) {
      whereClause += ' AND equipment = ?';
      params.push(equipment);
    }
    if (difficulty) {
      whereClause += ' AND difficulty = ?';
      params.push(difficulty);
    }
    if (search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM exercises ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get exercises with pagination
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), parseInt(offset));

    const [exercises] = await pool.query(
      `SELECT * FROM exercises ${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`,
      params
    );

    res.json({
      success: true,
      data: {
        exercises,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercises'
    });
  }
});

// Get exercise categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT DISTINCT category FROM exercises ORDER BY category'
    );
    const [muscleGroups] = await pool.query(
      'SELECT DISTINCT muscle_group FROM exercises WHERE muscle_group IS NOT NULL ORDER BY muscle_group'
    );
    const [equipment] = await pool.query(
      'SELECT DISTINCT equipment FROM exercises WHERE equipment IS NOT NULL ORDER BY equipment'
    );
    const [difficulties] = await pool.query(
      'SELECT DISTINCT difficulty FROM exercises WHERE difficulty IS NOT NULL ORDER BY difficulty'
    );

    res.json({
      success: true,
      data: {
        categories: categories.map(c => c.category),
        muscleGroups: muscleGroups.map(m => m.muscle_group),
        equipment: equipment.map(e => e.equipment),
        difficulties: difficulties.map(d => d.difficulty)
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// Get single exercise
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [exercises] = await pool.query(
      'SELECT * FROM exercises WHERE id = ?',
      [req.params.id]
    );

    if (exercises.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    // Get additional images for this exercise (table may not exist yet)
    let images = [];
    try {
      const [imageRows] = await pool.query(
        'SELECT * FROM exercise_images WHERE exercise_id = ? ORDER BY display_order',
        [req.params.id]
      );
      images = imageRows;
    } catch (imgError) {
      // Table might not exist, ignore
      console.log('exercise_images table not available:', imgError.message);
    }

    res.json({
      success: true,
      data: {
        ...exercises[0],
        images: images
      }
    });
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercise'
    });
  }
});

// Create custom exercise (user-created)
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').trim().notEmpty().withMessage('Category is required')
], validate, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      muscleGroup,
      equipment,
      difficulty,
      instructions,
      imageUrl,
      videoUrl,
      defaultSets,
      defaultReps,
      defaultWeight
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO exercises 
       (user_id, name, description, category, muscle_group, equipment, difficulty, instructions, image_url, video_url, is_custom)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [req.user.id, name, description, category, muscleGroup, equipment, difficulty, instructions, imageUrl, videoUrl]
    );

    const [newExercise] = await pool.query(
      'SELECT * FROM exercises WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: newExercise[0]
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating exercise'
    });
  }
});

// Update custom exercise
router.put('/:id', auth, async (req, res) => {
  try {
    // Check ownership - only custom exercises owned by user can be edited
    const [existing] = await pool.query(
      'SELECT * FROM exercises WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found or you do not have permission to edit it'
      });
    }

    const {
      name,
      description,
      category,
      muscleGroup,
      equipment,
      difficulty,
      instructions,
      imageUrl,
      videoUrl
    } = req.body;

    await pool.query(
      `UPDATE exercises SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        muscle_group = COALESCE(?, muscle_group),
        equipment = COALESCE(?, equipment),
        difficulty = COALESCE(?, difficulty),
        instructions = COALESCE(?, instructions),
        image_url = COALESCE(?, image_url),
        video_url = COALESCE(?, video_url)
       WHERE id = ?`,
      [name, description, category, muscleGroup, equipment, difficulty, instructions, imageUrl, videoUrl, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM exercises WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Exercise updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating exercise'
    });
  }
});

// Delete custom exercise
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM exercises WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Exercise deleted successfully'
    });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting exercise'
    });
  }
});

// ============================================
// EXERCISE IMAGES ENDPOINTS
// ============================================

// Get all images for an exercise
router.get('/:id/images', async (req, res) => {
  try {
    const [images] = await pool.query(
      'SELECT * FROM exercise_images WHERE exercise_id = ? ORDER BY image_order',
      [req.params.id]
    );

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Get exercise images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercise images'
    });
  }
});

// Add image to exercise (owner only for custom exercises)
router.post('/:id/images', auth, [
  body('image_url').trim().notEmpty().withMessage('Image URL is required'),
  body('caption').optional().trim(),
  body('image_order').optional().isInt({ min: 0 })
], validate, async (req, res) => {
  try {
    // Check if exercise belongs to user or is system exercise
    const [exercise] = await pool.query(
      'SELECT user_id FROM exercises WHERE id = ?',
      [req.params.id]
    );

    if (exercise.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    // Only allow adding images to user's own custom exercises
    if (exercise[0].user_id !== null && exercise[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only add images to your own exercises'
      });
    }

    const { image_url, caption, image_order } = req.body;

    // Get the next order index if not provided
    let orderIndex = image_order;
    if (orderIndex === undefined) {
      const [maxOrder] = await pool.query(
        'SELECT MAX(image_order) as max_order FROM exercise_images WHERE exercise_id = ?',
        [req.params.id]
      );
      orderIndex = (maxOrder[0].max_order || 0) + 1;
    }

    const [result] = await pool.query(
      'INSERT INTO exercise_images (exercise_id, image_url, caption, image_order) VALUES (?, ?, ?, ?)',
      [req.params.id, image_url, caption || null, orderIndex]
    );

    const [newImage] = await pool.query(
      'SELECT * FROM exercise_images WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Image added successfully',
      data: newImage[0]
    });
  } catch (error) {
    console.error('Add exercise image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding image'
    });
  }
});

// Update exercise image
router.put('/:exerciseId/images/:imageId', auth, async (req, res) => {
  try {
    // Check exercise ownership
    const [exercise] = await pool.query(
      'SELECT user_id FROM exercises WHERE id = ?',
      [req.params.exerciseId]
    );

    if (exercise.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    if (exercise[0].user_id !== null && exercise[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit images on your own exercises'
      });
    }

    const { image_url, caption, image_order } = req.body;

    const updates = [];
    const values = [];

    if (image_url) {
      updates.push('image_url = ?');
      values.push(image_url);
    }
    if (caption !== undefined) {
      updates.push('caption = ?');
      values.push(caption);
    }
    if (image_order !== undefined) {
      updates.push('image_order = ?');
      values.push(image_order);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(req.params.imageId, req.params.exerciseId);

    await pool.query(
      `UPDATE exercise_images SET ${updates.join(', ')} WHERE id = ? AND exercise_id = ?`,
      values
    );

    const [updated] = await pool.query(
      'SELECT * FROM exercise_images WHERE id = ?',
      [req.params.imageId]
    );

    res.json({
      success: true,
      message: 'Image updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Update exercise image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating image'
    });
  }
});

// Delete exercise image
router.delete('/:exerciseId/images/:imageId', auth, async (req, res) => {
  try {
    // Check exercise ownership
    const [exercise] = await pool.query(
      'SELECT user_id FROM exercises WHERE id = ?',
      [req.params.exerciseId]
    );

    if (exercise.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    if (exercise[0].user_id !== null && exercise[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete images from your own exercises'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM exercise_images WHERE id = ? AND exercise_id = ?',
      [req.params.imageId, req.params.exerciseId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete exercise image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image'
    });
  }
});

module.exports = router;
