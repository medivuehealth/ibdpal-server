const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Test endpoint to check Railway API
router.get('/test', (req, res) => {
    console.log('🧪 Test endpoint called');
    res.json({
        message: 'Journal API is working',
        timestamp: new Date().toISOString(),
        server: 'IBDPal Server',
        environment: process.env.NODE_ENV || 'development'
    });
});

// POST /api/journal/entries - Create a new journal entry
router.post('/entries', async (req, res) => {
    try {
        // Get the journal entry data
        const journalData = req.body;
        
        console.log('Server received journal entry data:', {
            medication_taken: journalData.medication_taken,
            medication_type: journalData.medication_type,
            dosage_level: journalData.dosage_level,
            typeOfDosage: typeof journalData.dosage_level,
            rawData: JSON.stringify(journalData)
        });

        // Ensure entry_date is truncated to just the date part (YYYY-MM-DD)
        const truncatedEntryDate = journalData.entry_date ? 
            new Date(journalData.entry_date).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0];
        
        console.log('📅 Original entry_date:', journalData.entry_date);
        console.log('📅 Truncated entry_date:', truncatedEntryDate);

        // Check if an entry already exists for this user and date
        const existingEntryQuery = `
            SELECT je.entry_id FROM journal_entries je
            JOIN users u ON je.user_id = u.user_id
            WHERE u.email = $1 AND DATE(je.entry_date) = $2
        `;
        const existingResult = await db.query(existingEntryQuery, [journalData.username, truncatedEntryDate]);
        
        if (existingResult.rows.length > 0) {
            // Update existing entry
            const entryId = existingResult.rows[0].entry_id;
            return await updateJournalEntry(entryId, journalData, res);
        } else {
            // Create new entry with proper defaults
            return await createJournalEntry(journalData, res);
        }

    } catch (error) {
        console.error('Error saving journal entry:', error);
        res.status(500).json({
            error: 'Failed to save journal entry',
            details: error.message
        });
    }
});

// Helper function to create a new journal entry
async function createJournalEntry(journalData, res) {
    try {
        // First, get the user_id from the username (email)
        console.log('🔍 Looking up user with email:', journalData.username);
        const userQuery = `SELECT user_id FROM users WHERE email = $1`;
        const userResult = await db.query(userQuery, [journalData.username]);
        
        console.log('🔍 User lookup result:', userResult.rows);
        
        if (userResult.rows.length === 0) {
            console.log('❌ User not found with email:', journalData.username);
            return res.status(404).json({
                error: 'User not found',
                message: 'User with this email address not found'
            });
        }
        
        const userId = userResult.rows[0].user_id;
        console.log('✅ Found user_id:', userId);
        
        // Ensure entry_date is truncated to just the date part (YYYY-MM-DD)
        const truncatedEntryDate = journalData.entry_date ? 
            new Date(journalData.entry_date).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0];
        
        console.log('📅 Original entry_date:', journalData.entry_date);
        console.log('📅 Truncated entry_date:', truncatedEntryDate);
        
        // Insert journal entry with proper defaults for constraints
        const journalQuery = `
            INSERT INTO journal_entries (
                user_id, entry_date, calories, protein, carbs, fiber,
                has_allergens, meals_per_day, hydration_level, bowel_frequency,
                bristol_scale, urgency_level, blood_present, pain_location,
                pain_severity, pain_time, medication_taken, medication_type,
                dosage_level, sleep_hours, stress_level, fatigue_level, notes,
                menstruation, breakfast, lunch, dinner, snacks,
                breakfast_calories, breakfast_protein, breakfast_carbs, breakfast_fiber, breakfast_fat,
                lunch_calories, lunch_protein, lunch_carbs, lunch_fiber, lunch_fat,
                dinner_calories, dinner_protein, dinner_carbs, dinner_fiber, dinner_fat,
                snack_calories, snack_protein, snack_carbs, snack_fiber, snack_fat
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                    $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
                    $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48)
            RETURNING entry_id;
        `;
        
        // Prepare values with proper defaults
        const values = [
            userId,                    // $1 - user_id
            truncatedEntryDate,        // $2 - entry_date
            Math.round(journalData.calories || 0), // $3 - calories
            Math.round(journalData.protein || 0),  // $4 - protein
            Math.round(journalData.carbs || 0),    // $5 - carbs
            Math.round(journalData.fiber || 0),    // $6 - fiber
            false,                     // $7 - has_allergens (boolean)
            4,                         // $8 - meals_per_day (integer)
            0,                         // $9 - hydration_level (integer)
            0,                         // $10 - bowel_frequency (integer)
            0,                         // $11 - bristol_scale (integer, not boolean)
            0,                         // $12 - urgency_level (integer, not string)
            0,                         // $13 - blood_present (integer)
            0,                         // $14 - pain_location (integer, not string)
            0,                         // $15 - pain_severity (integer, not boolean)
            0,                         // $16 - pain_time (integer, not string)
            0,                         // $17 - medication_taken (integer)
            '',                        // $18 - medication_type (string)
            'not_applicable',          // $19 - dosage_level (string)
            0,                         // $20 - sleep_hours (integer)
            0,                         // $21 - stress_level (integer)
            0,                         // $22 - fatigue_level (integer)
            '',                        // $23 - notes (string)
            false,                     // $24 - menstruation (boolean)
            journalData.breakfast || '', // $25 - breakfast
            journalData.lunch || '',     // $26 - lunch
            journalData.dinner || '',    // $27 - dinner
            journalData.snacks || '',    // $28 - snacks
            Math.round(journalData.breakfast_calories || 0), // $29 - breakfast_calories
            Math.round(journalData.breakfast_protein || 0),  // $30 - breakfast_protein
            Math.round(journalData.breakfast_carbs || 0),    // $31 - breakfast_carbs
            Math.round(journalData.breakfast_fiber || 0),    // $32 - breakfast_fiber
            Math.round(journalData.breakfast_fat || 0),      // $33 - breakfast_fat
            Math.round(journalData.lunch_calories || 0),     // $34 - lunch_calories
            Math.round(journalData.lunch_protein || 0),      // $35 - lunch_protein
            Math.round(journalData.lunch_carbs || 0),        // $36 - lunch_carbs
            Math.round(journalData.lunch_fiber || 0),        // $37 - lunch_fiber
            Math.round(journalData.lunch_fat || 0),          // $38 - lunch_fat
            Math.round(journalData.dinner_calories || 0),    // $39 - dinner_calories
            Math.round(journalData.dinner_protein || 0),     // $40 - dinner_protein
            Math.round(journalData.dinner_carbs || 0),       // $41 - dinner_carbs
            Math.round(journalData.dinner_fiber || 0),       // $42 - dinner_fiber
            Math.round(journalData.dinner_fat || 0),         // $43 - dinner_fat
            Math.round(journalData.snack_calories || 0),     // $44 - snack_calories
            Math.round(journalData.snack_protein || 0),      // $45 - snack_protein
            Math.round(journalData.snack_carbs || 0),        // $46 - snack_carbs
            Math.round(journalData.snack_fiber || 0),        // $47 - snack_fiber
            Math.round(journalData.snack_fat || 0)           // $48 - snack_fat
        ];
        
        console.log('🔍 Executing journal entry query with values:', values);
        console.log('🔍 Query length:', journalQuery.length);
        console.log('🔍 Values length:', values.length);
        console.log('🔍 Expected parameters:', journalQuery.match(/\$/g)?.length || 0);
        
        const result = await db.query(journalQuery, values);
        
        console.log('✅ Journal entry created successfully with ID:', result.rows[0].entry_id);
        
        res.status(201).json({
            message: 'Journal entry created successfully',
            entry_id: result.rows[0].entry_id
        });
    } catch (error) {
        console.error('Error creating journal entry:', error);
        res.status(500).json({
            error: 'Failed to create journal entry',
            details: error.message
        });
    }
}

// Helper function to update an existing journal entry
async function updateJournalEntry(entryId, journalData, res) {
    // Build dynamic update query based on what fields are provided
    let updateFields = [];
    let updateValues = [];
    let paramCount = 1;

    // Only update fields that are provided (not undefined/null)
    const fieldsToUpdate = {
        'calories': journalData.calories,
        'protein': journalData.protein,
        'carbs': journalData.carbs,
        'fiber': journalData.fiber,
        'has_allergens': journalData.has_allergens,
        'meals_per_day': journalData.meals_per_day,
        'hydration_level': journalData.hydration_level,
        'bowel_frequency': journalData.bowel_frequency,
        'bristol_scale': journalData.bristol_scale,
        'urgency_level': journalData.urgency_level,
        'blood_present': journalData.blood_present,
        'pain_location': journalData.pain_location,
        'pain_severity': journalData.pain_severity,
        'pain_time': journalData.pain_time,
        'medication_taken': journalData.medication_taken,
        'medication_type': journalData.medication_type,
        'dosage_level': journalData.dosage_level,
        'sleep_hours': journalData.sleep_hours,
        'stress_level': journalData.stress_level,
        'menstruation': journalData.menstruation,
        'fatigue_level': journalData.fatigue_level,
        'notes': journalData.notes,
        'breakfast': journalData.breakfast,
        'lunch': journalData.lunch,
        'dinner': journalData.dinner,
        'snacks': journalData.snacks,
        // Individual meal nutrition
        'breakfast_calories': journalData.breakfast_calories,
        'breakfast_protein': journalData.breakfast_protein,
        'breakfast_carbs': journalData.breakfast_carbs,
        'breakfast_fiber': journalData.breakfast_fiber,
        'breakfast_fat': journalData.breakfast_fat,
        'lunch_calories': journalData.lunch_calories,
        'lunch_protein': journalData.lunch_protein,
        'lunch_carbs': journalData.lunch_carbs,
        'lunch_fiber': journalData.lunch_fiber,
        'lunch_fat': journalData.lunch_fat,
        'dinner_calories': journalData.dinner_calories,
        'dinner_protein': journalData.dinner_protein,
        'dinner_carbs': journalData.dinner_carbs,
        'dinner_fiber': journalData.dinner_fiber,
        'dinner_fat': journalData.dinner_fat,
        'snack_calories': journalData.snack_calories,
        'snack_protein': journalData.snack_protein,
        'snack_carbs': journalData.snack_carbs,
        'snack_fiber': journalData.snack_fiber,
        'snack_fat': journalData.snack_fat
    };

    Object.entries(fieldsToUpdate).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
            updateFields.push(`${field} = $${paramCount}`);
            
            // Handle special cases for constraints
            if (field === 'bristol_scale') {
                // Bristol scale must be 1-7, default to 4 if 0 or invalid
                updateValues.push((value && value >= 1 && value <= 7) ? value : 4);
            } else if (field === 'menstruation') {
                // Ensure valid menstruation value
                updateValues.push(value || 'not_applicable');
            } else if (field === 'medication_type') {
                // Medication type must be one of the valid values, default to 'None' if empty/invalid
                updateValues.push((value && ['None', 'biologic', 'immunosuppressant', 'steroid'].includes(value)) ? value : 'None');
            } else if (field === 'pain_location') {
                // Pain location must be one of the valid values, default to 'None' if empty/invalid
                updateValues.push((value && ['None', 'full_abdomen', 'lower_abdomen', 'upper_abdomen'].includes(value)) ? value : 'None');
            } else if (field === 'pain_time') {
                // Pain time must be one of the valid values, default to 'None' if empty/invalid
                updateValues.push((value && ['None', 'morning', 'afternoon', 'evening', 'night', 'variable'].includes(value)) ? value : 'None');
            } else if (field === 'dosage_level') {
                // Dosage level must be text and match medication type constraints
                let validDosage = '0'; // default for 'None' medication type
                const medicationType = journalData.medication_type || 'None';
                
                if (medicationType === 'biologic') {
                    validDosage = (value && ['every_2_weeks', 'every_4_weeks', 'every_8_weeks'].includes(value)) ? value : 'every_4_weeks';
                } else if (medicationType === 'immunosuppressant') {
                    validDosage = (value && ['daily', 'twice_daily', 'weekly'].includes(value)) ? value : 'daily';
                } else if (medicationType === 'steroid') {
                    validDosage = (value && ['5', '10', '20'].includes(value)) ? value : '5';
                } else {
                    // For 'None' or any other medication type, use '0'
                    validDosage = '0';
                }
                updateValues.push(validDosage);
            } else {
                updateValues.push(value);
            }
            paramCount++;
        }
    });

    if (updateFields.length === 0) {
        return res.json({
            message: 'No fields to update',
            entry_id: entryId
        });
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    
    // Add entry_id for WHERE clause
    updateValues.push(entryId);

    const updateQuery = `
        UPDATE journal_entries SET
            ${updateFields.join(', ')}
        WHERE entry_id = $${paramCount}
        RETURNING entry_id;
    `;

    console.log('Executing journal entry update query:', updateQuery);
    console.log('Update values:', updateValues);
    
    const updateResult = await db.query(updateQuery, updateValues);
    
    if (updateResult.rows.length === 0) {
        throw new Error('Entry not found or unauthorized');
    }

    res.json({
        message: 'Journal entry updated successfully',
        entry_id: entryId
    });
}

// GET /api/journal/entries/:username - Get all journal entries for a user
router.get('/entries/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        // Get journal entries by joining with users table
        const query = `
            SELECT je.* FROM journal_entries je
            JOIN users u ON je.user_id = u.user_id
            WHERE u.email = $1 
            ORDER BY je.entry_date DESC, je.created_at DESC
        `;
        
        const result = await db.query(query, [username]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ error: 'Failed to fetch journal entries', details: error.message });
    }
});

// PUT /api/journal/entries/:entryId - Update an existing journal entry
router.put('/entries/:entryId', async (req, res) => {
    try {
        const { entryId } = req.params;
        const journalData = req.body;
        
        console.log('Server received journal update data for entry:', entryId, {
            medication_taken: journalData.medication_taken,
            medication_type: journalData.medication_type,
            dosage_level: journalData.dosage_level,
            typeOfDosage: typeof journalData.dosage_level,
            rawData: JSON.stringify(journalData)
        });

        // Use the same logic as updateJournalEntry - only update fields that are provided
        let updateFields = [];
        let updateValues = [];
        let paramCount = 1;

        // Only update fields that are provided (not undefined/null)
        const fieldsToUpdate = {
            'entry_date': journalData.entry_date,
            'calories': journalData.calories,
            'protein': journalData.protein,
            'carbs': journalData.carbs,
            'fiber': journalData.fiber,
            'has_allergens': journalData.has_allergens,
            'meals_per_day': journalData.meals_per_day,
            'hydration_level': journalData.hydration_level,
            'breakfast': journalData.breakfast,
            'lunch': journalData.lunch,
            'dinner': journalData.dinner,
            'snacks': journalData.snacks,
            'bowel_frequency': journalData.bowel_frequency,
            'bristol_scale': journalData.bristol_scale,
            'urgency_level': journalData.urgency_level,
            'blood_present': journalData.blood_present,
            'pain_location': journalData.pain_location,
            'pain_severity': journalData.pain_severity,
            'pain_time': journalData.pain_time,
            'medication_taken': journalData.medication_taken,
            'medication_type': journalData.medication_type,
            'dosage_level': journalData.dosage_level,
            'sleep_hours': journalData.sleep_hours,
            'stress_level': journalData.stress_level,
            'menstruation': journalData.menstruation,
            'fatigue_level': journalData.fatigue_level,
            'notes': journalData.notes,
            // Individual meal nutrition
            'breakfast_calories': journalData.breakfast_calories,
            'breakfast_protein': journalData.breakfast_protein,
            'breakfast_carbs': journalData.breakfast_carbs,
            'breakfast_fiber': journalData.breakfast_fiber,
            'breakfast_fat': journalData.breakfast_fat,
            'lunch_calories': journalData.lunch_calories,
            'lunch_protein': journalData.lunch_protein,
            'lunch_carbs': journalData.lunch_carbs,
            'lunch_fiber': journalData.lunch_fiber,
            'lunch_fat': journalData.lunch_fat,
            'dinner_calories': journalData.dinner_calories,
            'dinner_protein': journalData.dinner_protein,
            'dinner_carbs': journalData.dinner_carbs,
            'dinner_fiber': journalData.dinner_fiber,
            'dinner_fat': journalData.dinner_fat,
            'snack_calories': journalData.snack_calories,
            'snack_protein': journalData.snack_protein,
            'snack_carbs': journalData.snack_carbs,
            'snack_fiber': journalData.snack_fiber,
            'snack_fat': journalData.snack_fat
        };

        Object.entries(fieldsToUpdate).forEach(([field, value]) => {
            if (value !== undefined && value !== null) {
                updateFields.push(`${field} = $${paramCount}`);
                
                // Handle special cases for constraints
                if (field === 'bristol_scale') {
                    // Bristol scale must be 1-7, default to 4 if 0 or invalid
                    updateValues.push((value && value >= 1 && value <= 7) ? value : 4);
                } else if (field === 'menstruation') {
                    // Ensure valid menstruation value
                    updateValues.push(value || 'not_applicable');
                } else if (field === 'medication_type') {
                    // Medication type must be one of the valid values, default to 'None' if empty/invalid
                    updateValues.push((value && ['None', 'biologic', 'immunosuppressant', 'steroid'].includes(value)) ? value : 'None');
                } else if (field === 'pain_location') {
                    // Pain location must be one of the valid values, default to 'None' if empty/invalid
                    updateValues.push((value && ['None', 'full_abdomen', 'lower_abdomen', 'upper_abdomen'].includes(value)) ? value : 'None');
                } else if (field === 'pain_time') {
                    // Pain time must be one of the valid values, default to 'None' if empty/invalid
                    updateValues.push((value && ['None', 'morning', 'afternoon', 'evening', 'night', 'variable'].includes(value)) ? value : 'None');
                } else if (field === 'dosage_level') {
                    // Dosage level must be text and match medication type constraints
                    let validDosage = '0'; // default for 'None' medication type
                    
                    if (journalData.medication_type === 'biologic') {
                        validDosage = (value && ['every_2_weeks', 'every_4_weeks', 'every_8_weeks'].includes(value)) ? value : 'every_4_weeks';
                    } else if (journalData.medication_type === 'immunosuppressant') {
                        validDosage = (value && ['daily', 'twice_daily', 'weekly'].includes(value)) ? value : 'daily';
                    } else if (journalData.medication_type === 'steroid') {
                        validDosage = (value && ['5', '10', '20'].includes(value)) ? value : '5';
                    } else {
                        // For 'None' or any other medication type, use '0'
                        validDosage = '0';
                    }
                    updateValues.push(validDosage);
                } else {
                    updateValues.push(value);
                }
                paramCount++;
            }
        });

        if (updateFields.length === 0) {
            return res.json({
                message: 'No fields to update',
                entry_id: entryId
            });
        }

        // Add updated_at timestamp
        updateFields.push(`updated_at = NOW()`);
        
        // Add entry_id and username for WHERE clause
        updateValues.push(entryId);
        updateValues.push(journalData.username);

        const updateQuery = `
            UPDATE journal_entries SET
                ${updateFields.join(', ')}
            WHERE entry_id = $${paramCount} AND user_id = (
                SELECT user_id FROM users WHERE email = $${paramCount + 1}
            )
            RETURNING entry_id;
        `;

        console.log('Executing journal entry update query:', updateQuery);
        console.log('Update values:', updateValues);
        
        const updateResult = await db.query(updateQuery, updateValues);
        
        if (updateResult.rows.length === 0) {
            throw new Error('Entry not found or unauthorized');
        }

        res.json({
            message: 'Journal entry updated successfully',
            entry_id: entryId
        });

    } catch (error) {
        console.error('Error updating journal entry:', error);
        res.status(500).json({
            error: 'Failed to update journal entry',
            details: error.message
        });
    }
});

// GET /api/flare-statistics - Get flare prediction statistics
router.get('/flare-statistics', async (req, res) => {
    try {
        const { username, days = 30 } = req.query;
        
        if (!username) {
            return res.status(400).json({ error: 'username is required' });
        }

        // Look up user_id from username
        const userResult = await db.query('SELECT user_id FROM users WHERE email = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // For now, return mock data since we don't have flare predictions set up
        res.json({
            total_predictions: 0,
            total_flares: 0,
            avg_flare_probability: 0,
            highest_risk: 0
        });
    } catch (error) {
        console.error('Error fetching flare statistics:', error);
        res.status(500).json({ 
            error: 'Failed to fetch flare statistics',
            details: error.message 
        });
    }
});

// GET /api/recent-predictions - Get recent flare predictions
router.get('/recent-predictions', async (req, res) => {
    try {
        const { username, limit = 30 } = req.query;
        
        if (!username) {
            return res.status(400).json({ error: 'username is required' });
        }

        // Look up user_id from username
        const userResult = await db.query('SELECT user_id FROM users WHERE email = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // For now, return mock data since we don't have flare predictions set up
        res.json({
            predictions: []
        });
    } catch (error) {
        console.error('Error fetching recent predictions:', error);
        res.status(500).json({ 
            error: 'Failed to fetch recent predictions',
            details: error.message 
        });
    }
});

// GET /api/meal_logs - Get meal logs
router.get('/meal_logs', async (req, res) => {
    try {
        const { username, days = 30 } = req.query;
        
        if (!username) {
            return res.status(400).json({ error: 'username is required' });
        }

        // Look up user_id from username
        const userResult = await db.query('SELECT user_id FROM users WHERE email = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // For now, return mock data since we don't have meal logs set up
        res.json({
            meal_logs: []
        });
    } catch (error) {
        console.error('Error fetching meal logs:', error);
        res.status(500).json({ 
            error: 'Failed to fetch meal logs',
            details: error.message 
        });
    }
});

module.exports = router; 