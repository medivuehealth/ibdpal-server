const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Middleware to verify JWT token and get user info
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    // Get user email from request body (following journal route pattern)
    const userEmail = req.body.user_id || req.query.user_id;
    if (!userEmail) {
        return res.status(400).json({ error: 'User email required' });
    }

    try {
        // Look up user_id from email (same as journal routes)
        const userResult = await db.query('SELECT user_id FROM users WHERE email = $1', [userEmail]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        req.userId = userResult.rows[0].user_id;
        next();
    } catch (error) {
        console.error('Error looking up user:', error);
        return res.status(500).json({ error: 'Database error' });
    }
};

// GET /api/reminders - Get all reminders for a user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { userId } = req;
        
        const result = await db.query(
            'SELECT * FROM reminders WHERE user_id = $1 ORDER BY time ASC',
            [userId]
        );

        // Transform the data to match the client-side format
        const reminders = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            type: row.type,
            time: new Date(`2000-01-01T${row.time}`).toISOString(), // Convert time to ISO string
            isEnabled: row.is_enabled,
            repeatDays: row.repeat_days
        }));

        res.json({
            success: true,
            reminders: reminders
        });
    } catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch reminders' 
        });
    }
});

// POST /api/reminders - Create a new reminder
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { userId } = req;
        const { title, type, time, isEnabled, repeatDays } = req.body;

        // Validate required fields
        if (!title || !type || !time) {
            return res.status(400).json({
                success: false,
                error: 'Title, type, and time are required'
            });
        }

        // Validate type
        const validTypes = ['medication', 'meal', 'symptom', 'exercise', 'appointment', 'other'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid reminder type'
            });
        }

        // Convert ISO time string to time format
        const timeDate = new Date(time);
        const timeString = timeDate.toTimeString().split(' ')[0]; // Get HH:MM:SS format

        const result = await db.query(
            `INSERT INTO reminders (user_id, title, type, time, is_enabled, repeat_days)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [userId, title, type, timeString, isEnabled || true, JSON.stringify(repeatDays || [])]
        );

        const newReminder = result.rows[0];
        const reminder = {
            id: newReminder.id,
            title: newReminder.title,
            type: newReminder.type,
            time: new Date(`2000-01-01T${newReminder.time}`).toISOString(),
            isEnabled: newReminder.is_enabled,
            repeatDays: newReminder.repeat_days
        };

        res.status(201).json({
            success: true,
            reminder: reminder
        });
    } catch (error) {
        console.error('Error creating reminder:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create reminder' 
        });
    }
});

// PUT /api/reminders/:id - Update a reminder
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { userId } = req;
        const { id } = req.params;
        const { title, type, time, isEnabled, repeatDays } = req.body;

        // Validate required fields
        if (!title || !type || !time) {
            return res.status(400).json({
                success: false,
                error: 'Title, type, and time are required'
            });
        }

        // Validate type
        const validTypes = ['medication', 'meal', 'symptom', 'exercise', 'appointment', 'other'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid reminder type'
            });
        }

        // Convert ISO time string to time format
        const timeDate = new Date(time);
        const timeString = timeDate.toTimeString().split(' ')[0]; // Get HH:MM:SS format

        const result = await db.query(
            `UPDATE reminders 
             SET title = $1, type = $2, time = $3, is_enabled = $4, repeat_days = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 AND user_id = $7
             RETURNING *`,
            [title, type, timeString, isEnabled, JSON.stringify(repeatDays || []), id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Reminder not found'
            });
        }

        const updatedReminder = result.rows[0];
        const reminder = {
            id: updatedReminder.id,
            title: updatedReminder.title,
            type: updatedReminder.type,
            time: new Date(`2000-01-01T${updatedReminder.time}`).toISOString(),
            isEnabled: updatedReminder.is_enabled,
            repeatDays: updatedReminder.repeat_days
        };

        res.json({
            success: true,
            reminder: reminder
        });
    } catch (error) {
        console.error('Error updating reminder:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update reminder' 
        });
    }
});

// DELETE /api/reminders/:id - Delete a reminder
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { userId } = req;
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Reminder not found'
            });
        }

        res.json({
            success: true,
            message: 'Reminder deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting reminder:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete reminder' 
        });
    }
});

// PATCH /api/reminders/:id/toggle - Toggle reminder enabled/disabled
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
    try {
        const { userId } = req;
        const { id } = req.params;
        const { isEnabled } = req.body;

        if (typeof isEnabled !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'isEnabled must be a boolean'
            });
        }

        const result = await db.query(
            `UPDATE reminders 
             SET is_enabled = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND user_id = $3
             RETURNING *`,
            [isEnabled, id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Reminder not found'
            });
        }

        const updatedReminder = result.rows[0];
        const reminder = {
            id: updatedReminder.id,
            title: updatedReminder.title,
            type: updatedReminder.type,
            time: new Date(`2000-01-01T${updatedReminder.time}`).toISOString(),
            isEnabled: updatedReminder.is_enabled,
            repeatDays: updatedReminder.repeat_days
        };

        res.json({
            success: true,
            reminder: reminder
        });
    } catch (error) {
        console.error('Error toggling reminder:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to toggle reminder' 
        });
    }
});

module.exports = router;
