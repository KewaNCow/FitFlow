const express = require('express');
const { body } = require('express-validator');
const pool = require('../config/database');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Rate a workout
router.post('/workout/:id', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim()
], validate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    // Check if workout exists
    const [workouts] = await pool.query(
      'SELECT id FROM workouts WHERE id = ?',
      [id]
    );

    if (workouts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Upsert rating (insert or update if exists)
    await pool.query(
      `INSERT INTO ratings (user_id, workout_id, rating, review)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review), updated_at = NOW()`,
      [userId, id, rating, review || null]
    );

    // Get updated average rating
    const [avgResult] = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count
       FROM ratings WHERE workout_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        avgRating: parseFloat(avgResult[0].avg_rating) || 0,
        ratingCount: avgResult[0].rating_count,
        userRating: rating
      }
    });
  } catch (error) {
    console.error('Rate workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rating workout'
    });
  }
});

// Rate a program
router.post('/program/:id', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim()
], validate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    // Check if program exists
    const [programs] = await pool.query(
      'SELECT id FROM programs WHERE id = ?',
      [id]
    );

    if (programs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    // Upsert rating
    await pool.query(
      `INSERT INTO ratings (user_id, program_id, rating, review)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review), updated_at = NOW()`,
      [userId, id, rating, review || null]
    );

    // Get updated average rating
    const [avgResult] = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count
       FROM ratings WHERE program_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        avgRating: parseFloat(avgResult[0].avg_rating) || 0,
        ratingCount: avgResult[0].rating_count,
        userRating: rating
      }
    });
  } catch (error) {
    console.error('Rate program error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rating program'
    });
  }
});

// Get rating for a workout
router.get('/workout/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get average rating
    const [avgResult] = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count
       FROM ratings WHERE workout_id = ?`,
      [id]
    );

    // Get user's rating
    const [userRating] = await pool.query(
      `SELECT rating, review FROM ratings WHERE workout_id = ? AND user_id = ?`,
      [id, userId]
    );

    res.json({
      success: true,
      data: {
        avgRating: parseFloat(avgResult[0].avg_rating) || 0,
        ratingCount: avgResult[0].rating_count,
        userRating: userRating[0]?.rating || null,
        userReview: userRating[0]?.review || null
      }
    });
  } catch (error) {
    console.error('Get workout rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rating'
    });
  }
});

// Get rating for a program
router.get('/program/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get average rating
    const [avgResult] = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count
       FROM ratings WHERE program_id = ?`,
      [id]
    );

    // Get user's rating
    const [userRating] = await pool.query(
      `SELECT rating, review FROM ratings WHERE program_id = ? AND user_id = ?`,
      [id, userId]
    );

    res.json({
      success: true,
      data: {
        avgRating: parseFloat(avgResult[0].avg_rating) || 0,
        ratingCount: avgResult[0].rating_count,
        userRating: userRating[0]?.rating || null,
        userReview: userRating[0]?.review || null
      }
    });
  } catch (error) {
    console.error('Get program rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rating'
    });
  }
});

// Delete user's rating for a workout
router.delete('/workout/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      'DELETE FROM ratings WHERE workout_id = ? AND user_id = ?',
      [id, userId]
    );

    // Get updated average rating
    const [avgResult] = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count
       FROM ratings WHERE workout_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        avgRating: parseFloat(avgResult[0].avg_rating) || 0,
        ratingCount: avgResult[0].rating_count
      }
    });
  } catch (error) {
    console.error('Delete workout rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting rating'
    });
  }
});

// Delete user's rating for a program
router.delete('/program/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      'DELETE FROM ratings WHERE program_id = ? AND user_id = ?',
      [id, userId]
    );

    // Get updated average rating
    const [avgResult] = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count
       FROM ratings WHERE program_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        avgRating: parseFloat(avgResult[0].avg_rating) || 0,
        ratingCount: avgResult[0].rating_count
      }
    });
  } catch (error) {
    console.error('Delete program rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting rating'
    });
  }
});

module.exports = router;
