const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const pool = require('../config/database');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Update profile validation
const updateProfileValidation = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required')
];

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, email, first_name, last_name, profile_image, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Get user stats
    const [workoutCount] = await pool.query(
      'SELECT COUNT(*) as count FROM workouts WHERE user_id = ?',
      [req.user.id]
    );

    const [programCount] = await pool.query(
      'SELECT COUNT(*) as count FROM programs WHERE user_id = ?',
      [req.user.id]
    );

    const [logCount] = await pool.query(
      'SELECT COUNT(*) as count FROM workout_logs WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImage: user.profile_image,
        createdAt: user.created_at,
        stats: {
          workouts: workoutCount[0].count,
          programs: programCount[0].count,
          completedWorkouts: logCount[0].count
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// Update user profile
router.put('/profile', auth, updateProfileValidation, validate, async (req, res) => {
  try {
    const { firstName, lastName, email, profileImage } = req.body;
    const updates = [];
    const values = [];

    if (firstName) {
      updates.push('first_name = ?');
      values.push(firstName);
    }
    if (lastName) {
      updates.push('last_name = ?');
      values.push(lastName);
    }
    if (email) {
      // Check if email is already taken
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
      updates.push('email = ?');
      values.push(email);
    }
    if (profileImage !== undefined) {
      updates.push('profile_image = ?');
      values.push(profileImage);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }

    values.push(req.user.id);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated user
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, profile_image FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: users[0].id,
        email: users[0].email,
        firstName: users[0].first_name,
        lastName: users[0].last_name,
        profileImage: users[0].profile_image
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Change password
router.put('/password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    // Delete all user data (cascading will handle related records)
    await pool.query('DELETE FROM users WHERE id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
});

module.exports = router;
