const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/db');
const webSearchService = require('../services/webSearchService');

// GET /api/community/hospitals - Get nearby hospitals and medical centers via web search
router.get('/hospitals', async (req, res) => {
    try {
        const { latitude, longitude, radius = 80.5, limit = 20 } = req.query; // 50 miles = 80.5 km
        
        console.log('Getting nearby hospitals via web search:', { latitude, longitude, radius, limit });

        // Validate coordinates
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const radiusKm = parseFloat(radius);

        if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates or radius'
            });
        }

        // Use web search service to find hospitals
        const hospitals = await webSearchService.searchNearbyHospitals(lat, lng, radiusKm * 1000); // Convert km to meters

        // Limit results
        const limitedHospitals = hospitals.slice(0, parseInt(limit));

        console.log(`Found ${limitedHospitals.length} hospitals via web search within ${radiusKm}km`);

        res.json({
            success: true,
            data: {
                hospitals: limitedHospitals,
                userLocation: { latitude: lat, longitude: lng },
                searchRadius: radiusKm,
                total: limitedHospitals.length,
                source: 'web_search'
            }
        });

    } catch (error) {
        console.error('Error fetching nearby hospitals:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nearby hospitals',
            error: error.message
        });
    }
});

// GET /api/community/specialists - Get IBD specialists via web search
router.get('/specialists', async (req, res) => {
    try {
        const { latitude, longitude, radius = 80.5, limit = 20 } = req.query; // 50 miles = 80.5 km
        
        console.log('Getting nearby IBD specialists via web search:', { latitude, longitude, radius, limit });

        // Validate coordinates
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const radiusKm = parseFloat(radius);

        if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates or radius'
            });
        }

        // Use web search service to find specialists
        const specialists = await webSearchService.searchIBDSpecialists(lat, lng, radiusKm * 1000); // Convert km to meters

        // Limit results
        const limitedSpecialists = specialists.slice(0, parseInt(limit));

        console.log(`Found ${limitedSpecialists.length} specialists via web search within ${radiusKm}km`);

        res.json({
            success: true,
            data: {
                specialists: limitedSpecialists,
                userLocation: { latitude: lat, longitude: lng },
                searchRadius: radiusKm,
                total: limitedSpecialists.length,
                source: 'web_search'
            }
        });

    } catch (error) {
        console.error('Error fetching nearby specialists:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nearby specialists',
            error: error.message
        });
    }
});

// GET /api/community/support-organizations - Get IBD support organizations from database
router.get('/support-organizations', async (req, res) => {
    try {
        const { latitude, longitude, radius = 80.5, limit = 20 } = req.query; // 50 miles = 80.5 km
        
        console.log('Getting nearby IBD support organizations:', { latitude, longitude, radius, limit });

        // Validate coordinates
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const radiusKm = parseFloat(radius);

        if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates or radius'
            });
        }

        // Get support organizations with distance calculation
        const distanceQuery = `
            SELECT 
                *,
                (
                    6371 * acos(
                        cos(radians($1)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians($2)) + 
                        sin(radians($1)) * sin(radians(latitude))
                    )
                ) AS distance_km
            FROM ibd_support_organizations 
            WHERE (
                6371 * acos(
                    cos(radians($1)) * cos(radians(latitude)) * 
                    cos(radians(longitude) - radians($2)) + 
                    sin(radians($1)) * sin(radians(latitude))
                )
            ) <= $3
            ORDER BY distance_km ASC
            LIMIT $4
        `;

        const result = await db.query(distanceQuery, [lat, lng, radiusKm, parseInt(limit)]);
        const organizations = result.rows;

        console.log(`Found ${organizations.length} support organizations within ${radiusKm}km`);

        res.json({
            success: true,
            data: {
                organizations,
                userLocation: { latitude: lat, longitude: lng },
                searchRadius: radiusKm,
                total: organizations.length,
                source: 'database'
            }
        });

    } catch (error) {
        console.error('Error fetching nearby support organizations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nearby support organizations',
            error: error.message
        });
    }
});

// GET /api/community/nutrition-articles - Get nutrition articles from database
router.get('/nutrition-articles', async (req, res) => {
    try {
        const { category, limit = 20, featured = false } = req.query;
        
        console.log('Getting nutrition articles:', { category, limit, featured });

        let query = `
        let query = `
            SELECT id, title, excerpt, content, category, source, source_url, 
                   read_time_minutes, is_public, is_featured, view_count, 
                   tags, published_date, created_at 
            FROM nutrition_articles 
            WHERE is_public = TRUE 
        `; 
        
        const queryParams = []; 
        let paramCount = 0; 
        
        if (category) { 
            paramCount++; 
            query += ` AND category = $${paramCount}`; 
            queryParams.push(category); 
        } 
        
        if (featured === "true") { 
            paramCount++; 
            query += ` AND is_featured = $${paramCount}`; 
            queryParams.push(true); 
        } 
        
        query += ` ORDER BY view_count DESC, published_date DESC LIMIT $${paramCount + 1}`; 
        queryParams.push(parseInt(limit)); 
                articles,
                total: articles.length,
                filters: { category, limit, featured },
                source: 'database'
            }
        });

    } catch (error) {
        console.error('Error fetching nutrition articles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nutrition articles',
            error: error.message
        });
    }
});

// GET /api/community/nutrition-articles/:id - Get specific nutrition article and increment view count
router.get('/nutrition-articles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('Getting nutrition article by ID:', id);

        // Get the article
        const articleResult = await db.query(`
            SELECT id, title, excerpt, content, category, source, source_url, 
                   read_time_minutes, is_public, is_featured, view_count, 
                   tags, published_date, created_at
            FROM nutrition_articles 
            WHERE id = $1 AND is_public = TRUE
        `, [id]);

        if (articleResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        const article = articleResult.rows[0];

        // Increment view count
        await db.query(`
            UPDATE nutrition_articles 
            SET view_count = view_count + 1, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1
        `, [id]);

        console.log(`Article "${article.title}" viewed, view count incremented`);

        res.json({
            success: true,
            data: {
                article,
                source: 'database'
            }
        });

    } catch (error) {
        console.error('Error fetching nutrition article:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nutrition article',
            error: error.message
        });
    }
});

module.exports = router;
