const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/micronutrient/profile - Create or update micronutrient profile
router.post('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { age, weight, height, gender, micronutrients } = req.body;

        console.log('Creating/updating micronutrient profile for user:', userId);

        // Validate required fields
        if (!age || !weight) {
            return res.status(400).json({
                success: false,
                message: 'Age and weight are required'
            });
        }

        // Validate age and weight
        if (age < 1 || age > 150) {
            return res.status(400).json({
                success: false,
                message: 'Age must be between 1 and 150 years'
            });
        }

        if (weight < 1 || weight > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Weight must be between 1 and 1000 kg'
            });
        }

        // Start transaction
        await db.query('BEGIN');

        try {
            // Check if profile already exists
            const existingProfile = await db.query(
                'SELECT id FROM micronutrient_profiles WHERE user_id = $1',
                [userId]
            );

            let profileId;

            if (existingProfile.rows.length > 0) {
                // Update existing profile
                profileId = existingProfile.rows[0].id;
                
                await db.query(
                    `UPDATE micronutrient_profiles 
                     SET age = $1, weight = $2, height = $3, gender = $4, updated_at = CURRENT_TIMESTAMP
                     WHERE user_id = $5`,
                    [age, weight, height || null, gender || null, userId]
                );

                // Delete existing supplements
                await db.query(
                    'DELETE FROM micronutrient_supplements WHERE profile_id = $1',
                    [profileId]
                );

                console.log('Updated existing micronutrient profile for user:', userId);
            } else {
                // Create new profile
                const profileResult = await db.query(
                    `INSERT INTO micronutrient_profiles (user_id, age, weight, height, gender)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id`,
                    [userId, age, weight, height || null, gender || null]
                );

                profileId = profileResult.rows[0].id;
                console.log('Created new micronutrient profile for user:', userId);
            }

            // Insert micronutrients if provided
            if (micronutrients && micronutrients.length > 0) {
                for (const supplement of micronutrients) {
                    await db.query(
                        `INSERT INTO micronutrient_supplements 
                         (profile_id, name, category, dosage, unit, frequency, start_date, notes)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [
                            profileId,
                            supplement.name,
                            supplement.category,
                            supplement.dosage,
                            supplement.unit,
                            supplement.frequency,
                            supplement.startDate || null,
                            supplement.notes || null
                        ]
                    );
                }
                console.log(`Added ${micronutrients.length} supplements for user:`, userId);
            }

            // Commit transaction
            await db.query('COMMIT');

            res.json({
                success: true,
                message: 'Micronutrient profile saved successfully',
                data: {
                    profileId,
                    age,
                    weight,
                    height,
                    gender,
                    supplementCount: micronutrients ? micronutrients.length : 0
                }
            });

        } catch (error) {
            // Rollback transaction
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error saving micronutrient profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save micronutrient profile',
            error: error.message
        });
    }
});

// GET /api/micronutrient/profile/:userId - Get micronutrient profile
router.get('/profile/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        console.log('Fetching micronutrient profile for user:', userId);

        // Get profile
        const profileResult = await db.query(
            `SELECT id, user_id, age, weight, height, gender, created_at, updated_at
             FROM micronutrient_profiles 
             WHERE user_id = $1`,
            [userId]
        );

        if (profileResult.rows.length === 0) {
            return res.json({
                success: true,
                data: null,
                message: 'No micronutrient profile found'
            });
        }

        const profile = profileResult.rows[0];

        // Get supplements
        const supplementsResult = await db.query(
            `SELECT name, category, dosage, unit, frequency, start_date, notes, created_at, updated_at
             FROM micronutrient_supplements 
             WHERE profile_id = $1
             ORDER BY category, name`,
            [profile.id]
        );

        const supplements = supplementsResult.rows.map(supplement => ({
            name: supplement.name,
            category: supplement.category,
            dosage: supplement.dosage,
            unit: supplement.unit,
            frequency: supplement.frequency,
            startDate: supplement.start_date,
            notes: supplement.notes
        }));

        const responseData = {
            userId: profile.user_id,
            age: profile.age,
            weight: profile.weight,
            height: profile.height,
            gender: profile.gender,
            micronutrients: supplements,
            lastUpdated: profile.updated_at
        };

        res.json({
            success: true,
            data: responseData,
            message: 'Micronutrient profile retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching micronutrient profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch micronutrient profile',
            error: error.message
        });
    }
});

// GET /api/micronutrient/recommendations/:userId - Get personalized nutrition recommendations
router.get('/recommendations/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        console.log('Generating nutrition recommendations for user:', userId);

        // Get user profile
        const profileResult = await db.query(
            `SELECT age, weight, height, gender
             FROM micronutrient_profiles 
             WHERE user_id = $1`,
            [userId]
        );

        if (profileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No micronutrient profile found. Please create a profile first.'
            });
        }

        const profile = profileResult.rows[0];

        // Get current supplements
        const supplementsResult = await db.query(
            `SELECT ms.name, ms.category, ms.dosage, ms.unit, ms.frequency
             FROM micronutrient_supplements ms
             JOIN micronutrient_profiles mp ON ms.profile_id = mp.id
             WHERE mp.user_id = $1`,
            [userId]
        );

        const currentSupplements = supplementsResult.rows;

        // Generate personalized recommendations based on age, weight, and IBD
        const recommendations = generateIBDRecommendations(profile, currentSupplements);

        res.json({
            success: true,
            data: {
                profile: {
                    age: profile.age,
                    weight: profile.weight,
                    height: profile.height,
                    gender: profile.gender
                },
                currentSupplements: currentSupplements,
                recommendations: recommendations
            },
            message: 'Nutrition recommendations generated successfully'
        });

    } catch (error) {
        console.error('Error generating nutrition recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate nutrition recommendations',
            error: error.message
        });
    }
});

// Helper function to generate IBD-specific nutrition recommendations
function generateIBDRecommendations(profile, currentSupplements) {
    const recommendations = {
        essential: [],
        beneficial: [],
        considerations: [],
        warnings: []
    };

    const age = profile.age;
    const weight = profile.weight;
    const gender = profile.gender;

    // Check for common deficiencies in IBD patients
    const currentSupplementNames = currentSupplements.map(s => s.name.toLowerCase());

    // Vitamin D - Essential for IBD patients
    if (!currentSupplementNames.some(name => name.includes('vitamin d') || name.includes('d3'))) {
        recommendations.essential.push({
            supplement: 'Vitamin D3',
            dosage: age < 18 ? '1000-2000 IU' : '2000-4000 IU',
            frequency: 'Daily',
            reason: 'IBD patients are at high risk for vitamin D deficiency, which can affect bone health and immune function'
        });
    }

    // Vitamin B12 - Common deficiency
    if (!currentSupplementNames.some(name => name.includes('b12') || name.includes('cobalamin'))) {
        recommendations.essential.push({
            supplement: 'Vitamin B12',
            dosage: '1000-2000 mcg',
            frequency: 'Daily',
            reason: 'Essential for nerve function and red blood cell production, commonly deficient in IBD'
        });
    }

    // Iron - Check for anemia risk
    if (!currentSupplementNames.some(name => name.includes('iron'))) {
        recommendations.beneficial.push({
            supplement: 'Iron (if deficient)',
            dosage: '18-65 mg elemental iron',
            frequency: 'Daily with vitamin C',
            reason: 'IBD patients often have iron deficiency anemia due to blood loss and malabsorption'
        });
    }

    // Probiotics - Beneficial for gut health
    if (!currentSupplementNames.some(name => name.includes('probiotic'))) {
        recommendations.beneficial.push({
            supplement: 'Multi-strain Probiotic',
            dosage: '10-50 billion CFU',
            frequency: 'Daily',
            reason: 'May help maintain gut microbiome balance and reduce inflammation'
        });
    }

    // Omega-3 - Anti-inflammatory
    if (!currentSupplementNames.some(name => name.includes('omega') || name.includes('fish oil'))) {
        recommendations.beneficial.push({
            supplement: 'Omega-3 (EPA/DHA)',
            dosage: '1000-2000 mg',
            frequency: 'Daily',
            reason: 'Anti-inflammatory properties may help reduce IBD inflammation'
        });
    }

    // Folic Acid - Important for cell division
    if (!currentSupplementNames.some(name => name.includes('folic') || name.includes('folate'))) {
        recommendations.beneficial.push({
            supplement: 'Folic Acid',
            dosage: '400-800 mcg',
            frequency: 'Daily',
            reason: 'Important for cell division and DNA synthesis, especially if taking certain IBD medications'
        });
    }

    // Age-specific recommendations
    if (age < 18) {
        recommendations.considerations.push({
            type: 'Age-specific',
            note: 'Pediatric dosing may be different. Consult with healthcare provider for appropriate dosages.'
        });
    }

    if (age > 65) {
        recommendations.considerations.push({
            type: 'Age-specific',
            note: 'Older adults may need higher doses of certain vitamins (B12, D3) due to decreased absorption.'
        });
    }

    // Gender-specific recommendations
    if (gender === 'Female') {
        recommendations.considerations.push({
            type: 'Gender-specific',
            note: 'Women with IBD may need additional iron and folic acid, especially during childbearing years.'
        });
    }

    // General IBD considerations
    recommendations.warnings.push({
        type: 'General',
        note: 'Always consult with your healthcare provider before starting new supplements, especially if taking IBD medications.'
    });

    recommendations.warnings.push({
        type: 'General',
        note: 'Some supplements may interact with IBD medications. Discuss with your doctor or pharmacist.'
    });

    return recommendations;
}

module.exports = router;
