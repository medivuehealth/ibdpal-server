const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateReminder = [
  body('title').notEmpty().withMessage('Title is required').trim().isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
  body('reminder_time').notEmpty().withMessage('Reminder time is required').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
  body('frequency').notEmpty().withMessage('Frequency is required').isIn(['daily', 'weekly', 'monthly', 'once']).withMessage('Invalid frequency'),
  body('notification_method').notEmpty().withMessage('Notification method is required').isIn(['email', 'phone', 'both']).withMessage('Invalid notification method'),
  body('days_of_week').optional().isArray().withMessage('Days of week must be an array'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
];

// Custom validation middleware to format error messages
const formatValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      error: 'Validation failed',
      message: firstError.msg,
      details: errors.array()
    });
  }
  next();
};

// Get all reminders for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const result = await db.query(
      `SELECT 
        reminder_id,
        title,
        notes,
        reminder_time,
        frequency,
        days_of_week,
        is_active,
        notification_method,
        created_at,
        updated_at
       FROM reminders 
       WHERE user_id = $1 
       ORDER BY reminder_time ASC`,
      [userId]
    );

    res.json({
      reminders: result.rows
    });

  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      error: 'Failed to fetch reminders',
      message: 'Unable to retrieve reminders. Please try again.'
    });
  }
});

// Create a new reminder
router.post('/', validateReminder, formatValidationErrors, authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { title, notes, reminder_time, frequency, days_of_week, notification_method } = req.body;

    // Validate days_of_week for weekly frequency
    if (frequency === 'weekly' && (!days_of_week || days_of_week.length === 0)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Days of week are required for weekly reminders.'
      });
    }

    // Validate days_of_week values (1-7)
    if (days_of_week) {
      for (const day of days_of_week) {
        if (!Number.isInteger(day) || day < 1 || day > 7) {
          return res.status(400).json({
            error: 'Validation failed',
            message: 'Days of week must be integers between 1 and 7 (1=Monday, 7=Sunday).'
          });
        }
      }
    }

    const result = await db.query(
      `INSERT INTO reminders (
        user_id,
        title,
        notes,
        reminder_time,
        frequency,
        days_of_week,
        notification_method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        reminder_id,
        title,
        notes,
        reminder_time,
        frequency,
        days_of_week,
        is_active,
        notification_method,
        created_at,
        updated_at`,
      [userId, title, notes || null, reminder_time, frequency, days_of_week || null, notification_method]
    );

    const newReminder = result.rows[0];

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder: newReminder
    });

  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({
      error: 'Failed to create reminder',
      message: 'Unable to create reminder. Please try again.'
    });
  }
});

// Update a reminder
router.put('/:reminderId', validateReminder, formatValidationErrors, authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { reminderId } = req.params;
    const { title, notes, reminder_time, frequency, days_of_week, notification_method, is_active } = req.body;

    // Validate days_of_week for weekly frequency
    if (frequency === 'weekly' && (!days_of_week || days_of_week.length === 0)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Days of week are required for weekly reminders.'
      });
    }

    // Validate days_of_week values (1-7)
    if (days_of_week) {
      for (const day of days_of_week) {
        if (!Number.isInteger(day) || day < 1 || day > 7) {
          return res.status(400).json({
            error: 'Validation failed',
            message: 'Days of week must be integers between 1 and 7 (1=Monday, 7=Sunday).'
          });
        }
      }
    }

    // Check if reminder exists and belongs to user
    const existingReminder = await db.query(
      'SELECT reminder_id FROM reminders WHERE reminder_id = $1 AND user_id = $2',
      [reminderId, userId]
    );

    if (existingReminder.rows.length === 0) {
      return res.status(404).json({
        error: 'Reminder not found',
        message: 'Reminder not found or you do not have permission to modify it.'
      });
    }

    const result = await db.query(
      `UPDATE reminders 
       SET title = $1,
           notes = $2,
           reminder_time = $3,
           frequency = $4,
           days_of_week = $5,
           notification_method = $6,
           is_active = $7
       WHERE reminder_id = $8 AND user_id = $9
       RETURNING 
         reminder_id,
         title,
         notes,
         reminder_time,
         frequency,
         days_of_week,
         is_active,
         notification_method,
         created_at,
         updated_at`,
      [title, notes || null, reminder_time, frequency, days_of_week || null, notification_method, is_active !== undefined ? is_active : true, reminderId, userId]
    );

    const updatedReminder = result.rows[0];

    res.json({
      message: 'Reminder updated successfully',
      reminder: updatedReminder
    });

  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({
      error: 'Failed to update reminder',
      message: 'Unable to update reminder. Please try again.'
    });
  }
});

// Delete a reminder
router.delete('/:reminderId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { reminderId } = req.params;

    // Check if reminder exists and belongs to user
    const existingReminder = await db.query(
      'SELECT reminder_id FROM reminders WHERE reminder_id = $1 AND user_id = $2',
      [reminderId, userId]
    );

    if (existingReminder.rows.length === 0) {
      return res.status(404).json({
        error: 'Reminder not found',
        message: 'Reminder not found or you do not have permission to delete it.'
      });
    }

    await db.query(
      'DELETE FROM reminders WHERE reminder_id = $1 AND user_id = $2',
      [reminderId, userId]
    );

    res.json({
      message: 'Reminder deleted successfully'
    });

  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({
      error: 'Failed to delete reminder',
      message: 'Unable to delete reminder. Please try again.'
    });
  }
});

// Toggle reminder active status
router.patch('/:reminderId/toggle', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { reminderId } = req.params;

    // Check if reminder exists and belongs to user
    const existingReminder = await db.query(
      'SELECT reminder_id, is_active FROM reminders WHERE reminder_id = $1 AND user_id = $2',
      [reminderId, userId]
    );

    if (existingReminder.rows.length === 0) {
      return res.status(404).json({
        error: 'Reminder not found',
        message: 'Reminder not found or you do not have permission to modify it.'
      });
    }

    const currentStatus = existingReminder.rows[0].is_active;
    const newStatus = !currentStatus;

    const result = await db.query(
      `UPDATE reminders 
       SET is_active = $1
       WHERE reminder_id = $2 AND user_id = $3
       RETURNING 
         reminder_id,
         title,
         notes,
         reminder_time,
         frequency,
         days_of_week,
         is_active,
         notification_method,
         created_at,
         updated_at`,
      [newStatus, reminderId, userId]
    );

    const updatedReminder = result.rows[0];

    res.json({
      message: `Reminder ${newStatus ? 'activated' : 'deactivated'} successfully`,
      reminder: updatedReminder
    });

  } catch (error) {
    console.error('Toggle reminder error:', error);
    res.status(500).json({
      error: 'Failed to toggle reminder',
      message: 'Unable to toggle reminder status. Please try again.'
    });
  }
});

module.exports = router; 