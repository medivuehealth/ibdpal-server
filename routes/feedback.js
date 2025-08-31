const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const auth = require('../middleware/auth');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// POST /api/feedback - Submit user feedback
router.post('/', auth, async (req, res) => {
    const client = await pool.connect();
    
    try {
        const {
            nutrition_features_rating,
            nutrition_helpful_managing_symptoms,
            nutrition_helpful_managing_symptoms_notes,
            flareup_monitoring_helpful,
            flareup_monitoring_helpful_notes,
            app_recommendations,
            overall_rating,
            overall_rating_notes
        } = req.body;

        const userId = req.user.id;

        // Validate required fields
        if (!nutrition_features_rating || !nutrition_helpful_managing_symptoms || 
            !flareup_monitoring_helpful || !overall_rating) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['nutrition_features_rating', 'nutrition_helpful_managing_symptoms', 
                          'flareup_monitoring_helpful', 'overall_rating']
            });
        }

        // Validate rating ranges
        if (nutrition_features_rating < 1 || nutrition_features_rating > 5 ||
            overall_rating < 1 || overall_rating > 5) {
            return res.status(400).json({
                error: 'Ratings must be between 1 and 5'
            });
        }

        // Check if user already submitted feedback (optional - you can remove this if you want multiple submissions)
        const existingFeedback = await client.query(
            'SELECT feedback_id FROM user_feedback WHERE user_id = $1',
            [userId]
        );

        if (existingFeedback.rows.length > 0) {
            return res.status(409).json({
                error: 'Feedback already submitted',
                message: 'You have already submitted feedback. You can update your existing feedback.'
            });
        }

        // Insert new feedback
        const result = await client.query(
            `INSERT INTO user_feedback (
                user_id,
                nutrition_features_rating,
                nutrition_helpful_managing_symptoms,
                nutrition_helpful_managing_symptoms_notes,
                flareup_monitoring_helpful,
                flareup_monitoring_helpful_notes,
                app_recommendations,
                overall_rating,
                overall_rating_notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                userId,
                nutrition_features_rating,
                nutrition_helpful_managing_symptoms,
                nutrition_helpful_managing_symptoms_notes || null,
                flareup_monitoring_helpful,
                flareup_monitoring_helpful_notes || null,
                app_recommendations || null,
                overall_rating,
                overall_rating_notes || null
            ]
        );

        res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback: result.rows[0]
        });

    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            error: 'Failed to submit feedback',
            details: error.message
        });
    } finally {
        client.release();
    }
});

// GET /api/feedback - Get user's feedback
router.get('/', auth, async (req, res) => {
    const client = await pool.connect();
    
    try {
        const userId = req.user.id;

        const result = await client.query(
            'SELECT * FROM user_feedback WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'No feedback found',
                message: 'You have not submitted any feedback yet.'
            });
        }

        res.json({
            feedback: result.rows[0]
        });

    } catch (error) {
        console.error('Error retrieving feedback:', error);
        res.status(500).json({
            error: 'Failed to retrieve feedback',
            details: error.message
        });
    } finally {
        client.release();
    }
});

// PUT /api/feedback/:feedbackId - Update existing feedback
router.put('/:feedbackId', auth, async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { feedbackId } = req.params;
        const userId = req.user.id;
        
        const {
            nutrition_features_rating,
            nutrition_helpful_managing_symptoms,
            nutrition_helpful_managing_symptoms_notes,
            flareup_monitoring_helpful,
            flareup_monitoring_helpful_notes,
            app_recommendations,
            overall_rating,
            overall_rating_notes
        } = req.body;

        // Validate required fields
        if (!nutrition_features_rating || !nutrition_helpful_managing_symptoms || 
            !flareup_monitoring_helpful || !overall_rating) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Validate rating ranges
        if (nutrition_features_rating < 1 || nutrition_features_rating > 5 ||
            overall_rating < 1 || overall_rating > 5) {
            return res.status(400).json({
                error: 'Ratings must be between 1 and 5'
            });
        }

        // Check if feedback exists and belongs to user
        const existingFeedback = await client.query(
            'SELECT feedback_id FROM user_feedback WHERE feedback_id = $1 AND user_id = $2',
            [feedbackId, userId]
        );

        if (existingFeedback.rows.length === 0) {
            return res.status(404).json({
                error: 'Feedback not found',
                message: 'Feedback not found or you do not have permission to update it.'
            });
        }

        // Update feedback
        const result = await client.query(
            `UPDATE user_feedback SET 
                nutrition_features_rating = $1,
                nutrition_helpful_managing_symptoms = $2,
                nutrition_helpful_managing_symptoms_notes = $3,
                flareup_monitoring_helpful = $4,
                flareup_monitoring_helpful_notes = $5,
                app_recommendations = $6,
                overall_rating = $7,
                overall_rating_notes = $8,
                updated_at = NOW()
            WHERE feedback_id = $9 AND user_id = $10 RETURNING *`,
            [
                nutrition_features_rating,
                nutrition_helpful_managing_symptoms,
                nutrition_helpful_managing_symptoms_notes || null,
                flareup_monitoring_helpful,
                flareup_monitoring_helpful_notes || null,
                app_recommendations || null,
                overall_rating,
                overall_rating_notes || null,
                feedbackId,
                userId
            ]
        );

        res.json({
            message: 'Feedback updated successfully',
            feedback: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({
            error: 'Failed to update feedback',
            details: error.message
        });
    } finally {
        client.release();
    }
});

// GET /api/feedback/stats - Get feedback statistics (admin only)
router.get('/stats', auth, async (req, res) => {
    const client = await pool.connect();
    
    try {
        // Check if user is admin (you can implement your own admin check)
        // For now, we'll allow all authenticated users to see stats
        
        const stats = await client.query(`
            SELECT 
                COUNT(*) as total_feedback,
                AVG(nutrition_features_rating) as avg_nutrition_rating,
                AVG(overall_rating) as avg_overall_rating,
                COUNT(CASE WHEN nutrition_helpful_managing_symptoms = true THEN 1 END) as nutrition_helpful_count,
                COUNT(CASE WHEN flareup_monitoring_helpful = true THEN 1 END) as flareup_helpful_count,
                COUNT(CASE WHEN nutrition_helpful_managing_symptoms = false THEN 1 END) as nutrition_not_helpful_count,
                COUNT(CASE WHEN flareup_monitoring_helpful = false THEN 1 END) as flareup_not_helpful_count
            FROM user_feedback
        `);

        res.json({
            statistics: stats.rows[0]
        });

    } catch (error) {
        console.error('Error retrieving feedback statistics:', error);
        res.status(500).json({
            error: 'Failed to retrieve feedback statistics',
            details: error.message
        });
    } finally {
        client.release();
    }
});

module.exports = router; 