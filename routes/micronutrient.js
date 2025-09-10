const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

/**
 * Evidence-Based IBD Micronutrient Requirements
 * 
 * Research Sources:
 * 1. AGA Clinical Practice Update (2024): "Diet and nutritional therapies in patients with IBD"
 *    DOI: 10.1053/j.gastro.2023.11.303
 * 2. Crohn's & Colitis Congress (2024): "Micronutrient deficiencies in IBD"
 * 3. WebMD IBD Research: "Micronutrient Deficiencies and Crohn's Disease"
 * 4. Nutritional Therapy for IBD: Evidence-based recommendations
 * 
 * Key Findings:
 * - 70% of IBD patients have micronutrient deficiencies
 * - Vitamin D: 2000-4000 IU needed (vs 600-800 IU RDA)
 * - Vitamin B12: 1000-2000 mcg needed (vs 2.4 mcg RDA)
 * - Iron: 18-65 mg needed (vs 8-18 mg RDA)
 * - Malabsorption factors: 40-60% reduced absorption
 */


// Helper functions to map client values to database values
function getCategoryValue(category) {
    const categoryMap = {
        "vitamin": "Vitamins",
        "mineral": "Minerals",
        "probiotic": "Probiotics",
        "omega3": "Omega-3",
        "antioxidant": "Antioxidants",
        "other": "Other"
    };
    return categoryMap[category.toLowerCase()] || "Other";
}

function getFrequencyValue(frequency) {
    const frequencyMap = {
        "daily": "Daily",
        "twice daily": "Twice Daily",
        "weekly": "Weekly",
        "as needed": "As Needed",
        "other": "Other"
    };
    return frequencyMap[frequency.toLowerCase()] || "Daily";
}

function getUnitValue(unit) {
    const unitMap = {
        "mg": "mg",
        "mcg": "mcg",
        "g": "g",
        "ml": "ml",
        "iu": "IU",
        "capsule": "capsules",
        "capsules": "capsules",
        "tablet": "tablets",
        "tablets": "tablets",
        "drops": "drops",
        "tsp": "tsp",
        "tbsp": "tbsp"
    };
    return unitMap[unit.toLowerCase()] || "mg";
}

// POST /api/micronutrient/profile - Create or update micronutrient profile
router.post('/profile', authenticateToken, async (req, res) => {
    try {
        const userUuid = req.user.userId;
        // Get username from users table
        const userResult = await db.query("SELECT username FROM users WHERE user_id = $1", [userUuid]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const userId = userResult.rows[0].username;
        const { age, weight, height, gender, labResults, supplements } = req.body;

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
        
        // Validate supplements data if provided
        if (supplements && Array.isArray(supplements)) {
            for (let i = 0; i < supplements.length; i++) {
                const supplement = supplements[i];
                if (!supplement.name || !supplement.category) {
                    return res.status(400).json({
                        success: false,
                        message: `Supplement ${i + 1} is missing required fields (name, category)`
                    });
                }
                if (supplement.dosage === undefined || supplement.dosage === null) {
                    return res.status(400).json({
                        success: false,
                        message: `Supplement ${supplement.name} is missing dosage`
                    });
                }
                // Ensure dosage is a valid number
                if (isNaN(Number(supplement.dosage)) || Number(supplement.dosage) < 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Supplement ${supplement.name} has invalid dosage: ${supplement.dosage}`
                    });
                }
            }
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

                console.log('Updated existing micronutrient profile for user:', userId);
            } else {
                // Create new profile
                const newProfile = await db.query(
                    `INSERT INTO micronutrient_profiles (user_id, age, weight, height, gender)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id`,
                    [userId, age, weight, height || null, gender || null]
                );

                profileId = newProfile.rows[0].id;
                console.log('Created new micronutrient profile for user:', userId);
            }
            
            // Validate profile creation/update was successful
            if (!profileId) {
                throw new Error('Failed to create or update profile');
            }

            // Handle lab results if provided
            if (labResults && Array.isArray(labResults)) {
                // Delete existing lab results
                await db.query(
                    'DELETE FROM micronutrient_lab_results WHERE profile_id = $1',
                    [profileId]
                );

                // Insert new lab results
                for (const labResult of labResults) {
                    await db.query(
                        `INSERT INTO micronutrient_lab_results 
                         (profile_id, nutrient, value, unit, reference_range, status, test_date, notes)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [
                            profileId,
                            labResult.nutrient,
                            labResult.value,
                            labResult.unit,
                            labResult.referenceRange,
                            labResult.status,
                            labResult.testDate,
                            labResult.notes || null
                        ]
                    );
                }
            }

            // Handle supplements if provided
            if (supplements && Array.isArray(supplements)) {
                console.log(`Processing ${supplements.length} supplements for user:`, userId);
                
                // Get existing supplements to compare
                const existingSupplements = await db.query(
                    'SELECT id, name, category, dosage, unit, frequency FROM micronutrient_supplements WHERE profile_id = $1',
                    [profileId]
                );
                
                console.log(`Found ${existingSupplements.rows.length} existing supplements`);
                
                // Process each supplement individually with error handling
                for (let i = 0; i < supplements.length; i++) {
                    const supplement = supplements[i];
                    try {
                        console.log(`Processing supplement ${i + 1}:`, supplement.name);
                        
                        // Check if supplement already exists (by name and category)
                        const existing = existingSupplements.rows.find(existing => 
                            existing.name === supplement.name && 
                            existing.category === getCategoryValue(supplement.category)
                        );
                        
                        if (existing) {
                            // Update existing supplement
                            console.log(`Updating existing supplement:`, supplement.name);
                            await db.query(
                                `UPDATE micronutrient_supplements 
                                 SET dosage = $1, unit = $2, frequency = $3, start_date = $4, is_active = $5, notes = $6
                                 WHERE id = $7`,
                                [
                                    supplement.dosage.toString(),
                                    getUnitValue(supplement.unit),
                                    getFrequencyValue(supplement.frequency),
                                    supplement.startDate,
                                    supplement.isActive !== false,
                                    supplement.notes || null,
                                    existing.id
                                ]
                            );
                        } else {
                            // Insert new supplement
                            console.log(`Inserting new supplement:`, supplement.name);
                            await db.query(
                                `INSERT INTO micronutrient_supplements 
                                 (profile_id, name, category, dosage, unit, frequency, start_date, is_active, notes)
                                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                                [
                                    profileId,
                                    supplement.name,
                                    getCategoryValue(supplement.category),
                                    supplement.dosage.toString(),
                                    getUnitValue(supplement.unit),
                                    getFrequencyValue(supplement.frequency),
                                    supplement.startDate,
                                    supplement.isActive !== false,
                                    supplement.notes || null
                                ]
                            );
                        }
                        
                        console.log(`Successfully processed supplement:`, supplement.name);
                        
                    } catch (supplementError) {
                        console.error(`Error processing supplement ${supplement.name}:`, supplementError);
                        // Continue with other supplements instead of failing the entire operation
                        // Log the error but don't throw - this prevents rollback of all supplements
                    }
                }
                
                // Remove supplements that are no longer in the list
                const currentSupplementNames = supplements.map(s => s.name);
                const supplementsToRemove = existingSupplements.rows.filter(existing => 
                    !currentSupplementNames.includes(existing.name)
                );
                
                for (const supplementToRemove of supplementsToRemove) {
                    console.log(`Removing supplement:`, supplementToRemove.name);
                    await db.query(
                        'DELETE FROM micronutrient_supplements WHERE id = $1',
                        [supplementToRemove.id]
                    );
                }
                
                console.log(`Completed supplement processing for user:`, userId);
            }

            await db.query('COMMIT');

            res.json({
                success: true,
                message: 'Micronutrient profile saved successfully',
                data: {
                    profileId: profileId,
                    userId: userId,
                    age: age,
                    weight: weight,
                    height: height,
                    gender: gender
                }
            });

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Micronutrient profile save error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save micronutrient profile'
        });
    }
});

// GET /api/micronutrient/profile - Get micronutrient profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userUuid = req.user.userId;
        // Get username from users table
        const userResult = await db.query("SELECT username FROM users WHERE user_id = $1", [userUuid]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const userId = userResult.rows[0].username;

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

        // Get lab results
        const labResultsResult = await db.query(
            `SELECT id, nutrient, value, unit, reference_range, status, test_date, notes, created_at, updated_at
             FROM micronutrient_lab_results 
             WHERE profile_id = $1
             ORDER BY test_date DESC`,
            [profile.id]
        );

        // Get supplements
        const supplementsResult = await db.query(
            `SELECT id, name, category, dosage, unit, frequency, start_date, is_active, notes, created_at, updated_at
             FROM micronutrient_supplements 
             WHERE profile_id = $1
             ORDER BY start_date DESC`,
            [profile.id]
        );

        const responseData = {
            userId: profile.user_id,
            age: profile.age,
            weight: profile.weight.toString(),
            height: profile.height ? profile.height.toString() : null,
            gender: profile.gender,
            labResults: labResultsResult.rows.map(row => ({
                id: row.id.toString(),
                nutrient: row.nutrient,
                value: parseFloat(row.value),
                unit: row.unit,
                referenceRange: row.reference_range,
                status: row.status,
                testDate: row.test_date.toISOString().split('T')[0],
                notes: row.notes
            })),
            supplements: supplementsResult.rows.map(row => ({
                id: row.id.toString(),
                name: row.name,
                category: row.category,
                dosage: parseFloat(row.dosage),
                unit: row.unit,
                frequency: row.frequency,
                startDate: row.start_date.toISOString().split('T')[0],
                isActive: row.is_active,
                notes: row.notes
            })),
            lastUpdated: profile.updated_at
        };

        res.json({
            success: true,
            data: responseData,
            message: 'Micronutrient profile retrieved successfully'
        });

    } catch (error) {
        console.error('Micronutrient profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch micronutrient profile'
        });
    }
});

// POST /api/micronutrient/lab-result - Add a single lab result
router.post('/lab-result', authenticateToken, async (req, res) => {
    try {
        const userUuid = req.user.userId;
        // Get username from users table
        const userResult = await db.query("SELECT username FROM users WHERE user_id = $1", [userUuid]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const userId = userResult.rows[0].username;
        const { nutrient, value, unit, referenceRange, status, testDate, notes } = req.body;

        // Validate required fields
        if (!nutrient || value === undefined || !unit || !referenceRange || !status || !testDate) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: nutrient, value, unit, referenceRange, status, testDate'
            });
        }

        // Get user's profile
        const profileResult = await db.query(
            'SELECT id FROM micronutrient_profiles WHERE user_id = $1',
            [userId]
        );

        if (profileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No micronutrient profile found. Please create a profile first.'
            });
        }

        const profileId = profileResult.rows[0].id;

        // Insert lab result
        const result = await db.query(
            `INSERT INTO micronutrient_lab_results 
             (profile_id, nutrient, value, unit, reference_range, status, test_date, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [profileId, nutrient, value, unit, referenceRange, status, testDate, notes || null]
        );

        res.json({
            success: true,
            data: {
                id: result.rows[0].id.toString(),
                nutrient,
                value: parseFloat(value),
                unit,
                referenceRange,
                status,
                testDate,
                notes
            },
            message: 'Lab result added successfully'
        });

    } catch (error) {
        console.error('Add lab result error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add lab result'
        });
    }
});

// POST /api/micronutrient/supplement - Add a single supplement
router.post('/supplement', authenticateToken, async (req, res) => {
    try {
        const userUuid = req.user.userId;
        // Get username from users table
        const userResult = await db.query("SELECT username FROM users WHERE user_id = $1", [userUuid]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const userId = userResult.rows[0].username;
        const { name, category, dosage, unit, frequency, startDate, isActive, notes } = req.body;

        // Validate required fields
        if (!name || !category || dosage === undefined || !unit || !frequency || !startDate) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: name, category, dosage, unit, frequency, startDate'
            });
        }

        // Get user's profile
        const profileResult = await db.query(
            'SELECT id FROM micronutrient_profiles WHERE user_id = $1',
            [userId]
        );

        if (profileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No micronutrient profile found. Please create a profile first.'
            });
        }

        const profileId = profileResult.rows[0].id;

        // Insert supplement
        const result = await db.query(
            `INSERT INTO micronutrient_supplements 
             (profile_id, name, category, dosage, unit, frequency, start_date, is_active, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [profileId, name, category, dosage, unit, frequency, startDate, isActive !== false, notes || null]
        );

        res.json({
            success: true,
            data: {
                id: result.rows[0].id.toString(),
                name,
                category,
                dosage: parseFloat(dosage),
                unit,
                frequency,
                startDate,
                isActive: isActive !== false,
                notes
            },
            message: 'Supplement added successfully'
        });

    } catch (error) {
        console.error('Add supplement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add supplement'
        });
    }
});

// DELETE /api/micronutrient/lab-result/:id - Delete a lab result
router.delete('/lab-result/:id', authenticateToken, async (req, res) => {
    try {
        const userUuid = req.user.userId;
        // Get username from users table
        const userResult = await db.query("SELECT username FROM users WHERE user_id = $1", [userUuid]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const userId = userResult.rows[0].username;
        const labResultId = req.params.id;

        // Verify ownership and delete
        const result = await db.query(
            `DELETE FROM micronutrient_lab_results 
             WHERE id = $1 AND profile_id IN (
                 SELECT id FROM micronutrient_profiles WHERE user_id = $2
             )
             RETURNING id`,
            [labResultId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lab result not found or access denied'
            });
        }

        res.json({
            success: true,
            message: 'Lab result deleted successfully'
        });

    } catch (error) {
        console.error('Delete lab result error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete lab result'
        });
    }
});

// DELETE /api/micronutrient/supplement/:id - Delete a supplement
router.delete('/supplement/:id', authenticateToken, async (req, res) => {
    try {
        const userUuid = req.user.userId;
        // Get username from users table
        const userResult = await db.query("SELECT username FROM users WHERE user_id = $1", [userUuid]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const userId = userResult.rows[0].username;
        const supplementId = req.params.id;

        // Verify ownership and delete
        const result = await db.query(
            `DELETE FROM micronutrient_supplements 
             WHERE id = $1 AND profile_id IN (
                 SELECT id FROM micronutrient_profiles WHERE user_id = $2
             )
             RETURNING id`,
            [supplementId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Supplement not found or access denied'
            });
        }

        res.json({
            success: true,
            message: 'Supplement deleted successfully'
        });

    } catch (error) {
        console.error('Delete supplement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete supplement'
        });
    }
});

module.exports = router;
