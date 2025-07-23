const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// GET /api/blogs/stories - Get all published stories with filters
router.get('/stories', async (req, res) => {
    try {
        const {
            diseaseType = 'all',
            filter = 'all',
            search = '',
            page = 1,
            limit = 10,
            userId
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = ['is_published = true'];
        let params = [];
        let paramIndex = 1;

        // Disease type filter
        if (diseaseType !== 'all') {
            whereConditions.push(`disease_type = $${paramIndex}`);
            params.push(diseaseType);
            paramIndex++;
        }

        // Search filter
        if (search) {
            whereConditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR $${paramIndex} = ANY(tags))`);
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Filter conditions
        switch (filter) {
            case 'recent':
                whereConditions.push(`created_at >= NOW() - INTERVAL '7 days'`);
                break;
            case 'popular':
                whereConditions.push('likes > 20');
                break;
            case 'my_stories':
                if (userId) {
                    whereConditions.push(`user_id = $${paramIndex}`);
                    params.push(userId);
                    paramIndex++;
                }
                break;
        }

        const whereClause = whereConditions.join(' AND ');

        // Get stories with user info and like status
        const storiesQuery = `
            SELECT 
                bs.*,
                CASE WHEN bsl.user_id IS NOT NULL THEN true ELSE false END as is_liked
            FROM blog_stories bs
            LEFT JOIN blog_story_likes bsl ON bs.id = bsl.story_id AND bsl.user_id = $${paramIndex}
            WHERE ${whereClause}
            ORDER BY 
                CASE WHEN $${paramIndex + 1} = 'popular' THEN bs.likes END DESC,
                CASE WHEN $${paramIndex + 1} = 'recent' THEN bs.created_at END DESC,
                bs.created_at DESC
            LIMIT $${paramIndex + 2} OFFSET $${paramIndex + 3}
        `;

        params.push(userId || null, filter, limit, offset);

        const storiesResult = await pool.query(storiesQuery, params);
        const stories = storiesResult.rows;

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM blog_stories bs
            WHERE ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params.slice(0, -4));
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: {
                stories,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stories',
            error: error.message
        });
    }
});

// GET /api/blogs/stories/:id - Get a specific story with comments
router.get('/stories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        // Get story details
        const storyQuery = `
            SELECT 
                bs.*,
                CASE WHEN bsl.user_id IS NOT NULL THEN true ELSE false END as is_liked
            FROM blog_stories bs
            LEFT JOIN blog_story_likes bsl ON bs.id = bsl.story_id AND bsl.user_id = $1
            WHERE bs.id = $2 AND bs.is_published = true
        `;
        const storyResult = await pool.query(storyQuery, [userId || null, id]);

        if (storyResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        const story = storyResult.rows[0];

        // Get comments for the story
        const commentsQuery = `
            SELECT 
                bc.*,
                CASE WHEN bcl.user_id IS NOT NULL THEN true ELSE false END as is_liked
            FROM blog_comments bc
            LEFT JOIN blog_comment_likes bcl ON bc.id = bcl.comment_id AND bcl.user_id = $1
            WHERE bc.story_id = $2
            ORDER BY bc.created_at ASC
        `;
        const commentsResult = await pool.query(commentsQuery, [userId || null, id]);
        const comments = commentsResult.rows;

        // Record view
        await pool.query(
            'INSERT INTO blog_story_views (story_id, user_id, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
            [id, userId || null, req.ip, req.get('User-Agent')]
        );

        res.json({
            success: true,
            data: {
                story,
                comments
            }
        });

    } catch (error) {
        console.error('Error fetching story:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch story',
            error: error.message
        });
    }
});

// POST /api/blogs/stories - Create a new story
router.post('/stories', auth, async (req, res) => {
    try {
        const {
            title,
            content,
            diseaseType,
            tags = [],
            isAnonymous = false
        } = req.body;

        const userId = req.user.id;

        // Validate required fields
        if (!title || !content || !diseaseType) {
            return res.status(400).json({
                success: false,
                message: 'Title, content, and disease type are required'
            });
        }

        // Validate disease type
        const validDiseaseTypes = ['crohns', 'ulcerative_colitis', 'indeterminate'];
        if (!validDiseaseTypes.includes(diseaseType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid disease type'
            });
        }

        // Get user info
        const userQuery = 'SELECT name, age FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [userId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userResult.rows[0];

        // Create story
        const storyQuery = `
            INSERT INTO blog_stories (
                user_id, user_name, user_age, disease_type, title, content, 
                tags, is_anonymous, is_published
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
            RETURNING *
        `;
        
        const storyResult = await pool.query(storyQuery, [
            userId,
            isAnonymous ? 'Anonymous' : user.name,
            user.age,
            diseaseType,
            title,
            content,
            tags,
            isAnonymous
        ]);

        const story = storyResult.rows[0];

        res.status(201).json({
            success: true,
            message: 'Story created successfully',
            data: story
        });

    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create story',
            error: error.message
        });
    }
});

// PUT /api/blogs/stories/:id - Update a story
router.put('/stories/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            content,
            diseaseType,
            tags,
            isAnonymous
        } = req.body;

        const userId = req.user.id;

        // Check if story exists and belongs to user
        const checkQuery = 'SELECT * FROM blog_stories WHERE id = $1 AND user_id = $2';
        const checkResult = await pool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Story not found or you do not have permission to edit it'
            });
        }

        // Update story
        const updateQuery = `
            UPDATE blog_stories 
            SET title = COALESCE($1, title),
                content = COALESCE($2, content),
                disease_type = COALESCE($3, disease_type),
                tags = COALESCE($4, tags),
                is_anonymous = COALESCE($5, is_anonymous),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6 AND user_id = $7
            RETURNING *
        `;

        const updateResult = await pool.query(updateQuery, [
            title, content, diseaseType, tags, isAnonymous, id, userId
        ]);

        res.json({
            success: true,
            message: 'Story updated successfully',
            data: updateResult.rows[0]
        });

    } catch (error) {
        console.error('Error updating story:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update story',
            error: error.message
        });
    }
});

// DELETE /api/blogs/stories/:id - Delete a story
router.delete('/stories/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if story exists and belongs to user
        const checkQuery = 'SELECT * FROM blog_stories WHERE id = $1 AND user_id = $2';
        const checkResult = await pool.query(checkQuery, [id, userId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Story not found or you do not have permission to delete it'
            });
        }

        // Delete story (cascade will handle related records)
        await pool.query('DELETE FROM blog_stories WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Story deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting story:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete story',
            error: error.message
        });
    }
});

// POST /api/blogs/stories/:id/like - Like/unlike a story
router.post('/stories/:id/like', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if story exists
        const storyQuery = 'SELECT * FROM blog_stories WHERE id = $1 AND is_published = true';
        const storyResult = await pool.query(storyQuery, [id]);

        if (storyResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        // Check if user already liked the story
        const likeQuery = 'SELECT * FROM blog_story_likes WHERE story_id = $1 AND user_id = $2';
        const likeResult = await pool.query(likeQuery, [id, userId]);

        if (likeResult.rows.length > 0) {
            // Unlike
            await pool.query('DELETE FROM blog_story_likes WHERE story_id = $1 AND user_id = $2', [id, userId]);
            res.json({
                success: true,
                message: 'Story unliked',
                liked: false
            });
        } else {
            // Like
            await pool.query('INSERT INTO blog_story_likes (story_id, user_id) VALUES ($1, $2)', [id, userId]);
            res.json({
                success: true,
                message: 'Story liked',
                liked: true
            });
        }

    } catch (error) {
        console.error('Error toggling story like:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle like',
            error: error.message
        });
    }
});

// POST /api/blogs/stories/:id/comments - Add a comment to a story
router.post('/stories/:id/comments', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, isAnonymous = false } = req.body;
        const userId = req.user.id;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        // Check if story exists
        const storyQuery = 'SELECT * FROM blog_stories WHERE id = $1 AND is_published = true';
        const storyResult = await pool.query(storyQuery, [id]);

        if (storyResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        // Get user info
        const userQuery = 'SELECT name FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [userId]);
        const user = userResult.rows[0];

        // Create comment
        const commentQuery = `
            INSERT INTO blog_comments (story_id, user_id, user_name, content, is_anonymous)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const commentResult = await pool.query(commentQuery, [
            id, userId, isAnonymous ? 'Anonymous' : user.name, content, isAnonymous
        ]);

        const comment = commentResult.rows[0];

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: comment
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment',
            error: error.message
        });
    }
});

// POST /api/blogs/comments/:id/like - Like/unlike a comment
router.post('/comments/:id/like', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if comment exists
        const commentQuery = 'SELECT * FROM blog_comments WHERE id = $1';
        const commentResult = await pool.query(commentQuery, [id]);

        if (commentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user already liked the comment
        const likeQuery = 'SELECT * FROM blog_comment_likes WHERE comment_id = $1 AND user_id = $2';
        const likeResult = await pool.query(likeQuery, [id, userId]);

        if (likeResult.rows.length > 0) {
            // Unlike
            await pool.query('DELETE FROM blog_comment_likes WHERE comment_id = $1 AND user_id = $2', [id, userId]);
            res.json({
                success: true,
                message: 'Comment unliked',
                liked: false
            });
        } else {
            // Like
            await pool.query('INSERT INTO blog_comment_likes (comment_id, user_id) VALUES ($1, $2)', [id, userId]);
            res.json({
                success: true,
                message: 'Comment liked',
                liked: true
            });
        }

    } catch (error) {
        console.error('Error toggling comment like:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle like',
            error: error.message
        });
    }
});

// GET /api/blogs/tags - Get popular tags
router.get('/tags', async (req, res) => {
    try {
        const query = `
            SELECT tag, usage_count 
            FROM blog_popular_tags 
            ORDER BY usage_count DESC, last_used DESC 
            LIMIT 20
        `;
        
        const result = await pool.query(query);
        
        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tags',
            error: error.message
        });
    }
});

// GET /api/blogs/stories/user/:userId - Get user's stories
router.get('/stories/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const query = `
            SELECT * FROM blog_stories 
            WHERE user_id = $1 AND is_published = true
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const result = await pool.query(query, [userId, limit, offset]);
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM blog_stories 
            WHERE user_id = $1 AND is_published = true
        `;
        const countResult = await pool.query(countQuery, [userId]);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: {
                stories: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching user stories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user stories',
            error: error.message
        });
    }
});

// POST /api/blogs/stories/:id/report - Report a story
router.post('/stories/:id/report', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, description } = req.body;
        const userId = req.user.id;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Report reason is required'
            });
        }

        const validReasons = ['inappropriate', 'spam', 'harassment', 'medical_advice', 'other'];
        if (!validReasons.includes(reason)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid report reason'
            });
        }

        // Check if story exists
        const storyQuery = 'SELECT * FROM blog_stories WHERE id = $1';
        const storyResult = await pool.query(storyQuery, [id]);

        if (storyResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Story not found'
            });
        }

        // Check if user already reported this story
        const existingReportQuery = 'SELECT * FROM blog_story_reports WHERE story_id = $1 AND reporter_user_id = $2';
        const existingReportResult = await pool.query(existingReportQuery, [id, userId]);

        if (existingReportResult.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this story'
            });
        }

        // Create report
        await pool.query(
            'INSERT INTO blog_story_reports (story_id, reporter_user_id, reason, description) VALUES ($1, $2, $3, $4)',
            [id, userId, reason, description]
        );

        res.json({
            success: true,
            message: 'Story reported successfully'
        });

    } catch (error) {
        console.error('Error reporting story:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to report story',
            error: error.message
        });
    }
});

module.exports = router; 