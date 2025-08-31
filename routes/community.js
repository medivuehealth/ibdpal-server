const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../database/db');

// GET /api/community/hospitals - Get nearby hospitals and medical centers
router.get('/hospitals', async (req, res) => {
    try {
        const { latitude, longitude, radius = 32.2, limit = 20 } = req.query; // 20 miles = 32.2 km
        
        console.log('Getting nearby hospitals:', { latitude, longitude, radius, limit });

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

        // Calculate distance using Haversine formula
        // This is a simplified version - in production, you might want to use PostGIS
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
            FROM medical_centers 
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
        const hospitals = result.rows;

        console.log(`Found ${hospitals.length} hospitals within ${radiusKm}km`);

        res.json({
            success: true,
            data: {
                hospitals,
                userLocation: { latitude: lat, longitude: lng },
                searchRadius: radiusKm,
                total: hospitals.length
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

// GET /api/community/hospitals/:id - Get specific hospital details
router.get('/hospitals/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'SELECT * FROM medical_centers WHERE id = $1';
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        const hospital = result.rows[0];

        res.json({
            success: true,
            data: {
                hospital
            }
        });

    } catch (error) {
        console.error('Error fetching hospital details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch hospital details',
            error: error.message
        });
    }
});

// GET /api/community/specialists - Get IBD specialists near user
router.get('/specialists', async (req, res) => {
    try {
        const { latitude, longitude, radius = 32.2, limit = 20 } = req.query; // 20 miles = 32.2 km
        
        console.log('Getting nearby IBD specialists:', { latitude, longitude, radius, limit });

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

        // Get specialists with distance calculation
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
            FROM ibd_specialists 
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
        const specialists = result.rows;

        console.log(`Found ${specialists.length} specialists within ${radiusKm}km`);

        res.json({
            success: true,
            data: {
                specialists,
                userLocation: { latitude: lat, longitude: lng },
                searchRadius: radiusKm,
                total: specialists.length
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

module.exports = router; 