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
        
        // Debug logging for breakfast_calories
        console.log('🔍 breakfast_calories debug:');
        console.log('  - Raw value:', journalData.breakfast_calories);
        console.log('  - Type:', typeof journalData.breakfast_calories);
        console.log('  - parseFloat result:', parseFloat(journalData.breakfast_calories));
        console.log('  - Final result:', Math.round(parseFloat(journalData.breakfast_calories) || 0));
        
        const userResult = await db.query('SELECT user_id FROM users WHERE email = $1', [journalData.username]);
        
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
            Math.round(parseFloat(journalData.calories) || 0), // $3 - calories
            Math.round(parseFloat(journalData.protein) || 0),  // $4 - protein
            Math.round(parseFloat(journalData.carbs) || 0),    // $5 - carbs
            Math.round(parseFloat(journalData.fiber) || 0),    // $6 - fiber
            false,                     // $7 - has_allergens
            4,                         // $8 - meals_per_day
            5,                         // $9 - hydration_level
            0,                         // $10 - bowel_frequency
            4,                         // $11 - bristol_scale
            0,                         // $12 - urgency_level
            false,                     // $13 - blood_present
            'None',                    // $14 - pain_location
            0,                         // $15 - pain_severity
            'None',                    // $16 - pain_time
            false,                     // $17 - medication_taken
            'None',                    // $18 - medication_type
            '0',                       // $19 - dosage_level
            0,                         // $20 - sleep_hours
            5,                         // $21 - stress_level
            5,                         // $22 - fatigue_level
            '',                        // $23 - notes
            'not_applicable',          // $24 - menstruation
            journalData.breakfast || '', // $25 - breakfast
            journalData.lunch || '',     // $26 - lunch
            journalData.dinner || '',    // $27 - dinner
            journalData.snacks || '',    // $28 - snacks
            Math.round(parseFloat(journalData.breakfast_calories) || 0), // $29 - breakfast_calories
            Math.round(parseFloat(journalData.breakfast_protein) || 0),  // $30 - breakfast_protein
            Math.round(parseFloat(journalData.breakfast_carbs) || 0),    // $31 - breakfast_carbs
            Math.round(parseFloat(journalData.breakfast_fiber) || 0),    // $32 - breakfast_fiber
            Math.round(parseFloat(journalData.breakfast_fat) || 0),      // $33 - breakfast_fat
            Math.round(parseFloat(journalData.lunch_calories) || 0),     // $34 - lunch_calories
            Math.round(parseFloat(journalData.lunch_protein) || 0),      // $35 - lunch_protein
            Math.round(parseFloat(journalData.lunch_carbs) || 0),        // $36 - lunch_carbs
            Math.round(parseFloat(journalData.lunch_fiber) || 0),        // $37 - lunch_fiber
            Math.round(parseFloat(journalData.lunch_fat) || 0),          // $38 - lunch_fat
            Math.round(parseFloat(journalData.dinner_calories) || 0),    // $39 - dinner_calories
            Math.round(parseFloat(journalData.dinner_protein) || 0),     // $40 - dinner_protein
            Math.round(parseFloat(journalData.dinner_carbs) || 0),       // $41 - dinner_carbs
            Math.round(parseFloat(journalData.dinner_fiber) || 0),       // $42 - dinner_fiber
            Math.round(parseFloat(journalData.dinner_fat) || 0),         // $43 - dinner_fat
            Math.round(parseFloat(journalData.snack_calories) || 0),     // $44 - snack_calories
            Math.round(parseFloat(journalData.snack_protein) || 0),      // $45 - snack_protein
            Math.round(parseFloat(journalData.snack_carbs) || 0),        // $46 - snack_carbs
            Math.round(parseFloat(journalData.snack_fiber) || 0),        // $47 - snack_fiber
            Math.round(parseFloat(journalData.snack_fat) || 0)           // $48 - snack_fat
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
            } else if (['calories', 'protein', 'carbs', 'fiber', 'breakfast_calories', 'breakfast_protein', 'breakfast_carbs', 'breakfast_fiber', 'breakfast_fat', 'lunch_calories', 'lunch_protein', 'lunch_carbs', 'lunch_fiber', 'lunch_fat', 'dinner_calories', 'dinner_protein', 'dinner_carbs', 'dinner_fiber', 'dinner_fat', 'snack_calories', 'snack_protein', 'snack_carbs', 'snack_fiber', 'snack_fat'].includes(field)) {
                // Convert nutrition fields to integers
                updateValues.push(Math.round(parseFloat(value) || 0));
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

// GET /api/journal/entries/:username - Get journal entries for a user (optionally filtered by date)
router.get('/entries/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { date } = req.query;
        
        console.log('📅 Fetching entries for user:', username, 'date:', date);
        
        let query;
        let queryParams;
        
        if (date) {
            // Filter by specific date
            query = `
                SELECT je.* FROM journal_entries je
                JOIN users u ON je.user_id = u.user_id
                WHERE u.email = $1 AND je.entry_date = $2
                ORDER BY je.created_at DESC
            `;
            queryParams = [username, date];
            console.log('🔍 Filtering entries by date:', date);
        } else {
            // Get all entries for user
            query = `
                SELECT je.* FROM journal_entries je
                JOIN users u ON je.user_id = u.user_id
                WHERE u.email = $1 
                ORDER BY je.entry_date DESC, je.created_at DESC
            `;
            queryParams = [username];
            console.log('📋 Fetching all entries for user');
        }
        
        const result = await db.query(query, queryParams);
        console.log('✅ Found', result.rows.length, 'entries');
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
                } else if (['calories', 'protein', 'carbs', 'fiber', 'breakfast_calories', 'breakfast_protein', 'breakfast_carbs', 'breakfast_fiber', 'breakfast_fat', 'lunch_calories', 'lunch_protein', 'lunch_carbs', 'lunch_fiber', 'lunch_fat', 'dinner_calories', 'dinner_protein', 'dinner_carbs', 'dinner_fiber', 'dinner_fat', 'snack_calories', 'snack_protein', 'snack_carbs', 'snack_fiber', 'snack_fat'].includes(field)) {
                    // Convert nutrition fields to integers
                    updateValues.push(Math.round(parseFloat(value) || 0));
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

// GET /api/journal/nutrition/analysis/:userId - Get nutrition analysis based on user's log data
router.get('/nutrition/analysis/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log('🔍 [Nutrition Analysis] User ID:', userId);
        
        // Check if userId is an email or UUID and look up the actual user_id
        let actualUserId = userId;
        if (userId.includes('@')) {
            // It's an email, look up the user_id
            const userResult = await db.query('SELECT user_id FROM users WHERE email = $1', [userId]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            actualUserId = userResult.rows[0].user_id;
            console.log('🔍 [Nutrition Analysis] Found user_id for email:', actualUserId);
        }
        
        // First, let's see what entries exist for this user
        const checkQuery = `
            SELECT entry_id, entry_date, breakfast_calories, lunch_calories, dinner_calories, snack_calories,
                   breakfast_protein, lunch_protein, dinner_protein, snack_protein,
                   breakfast_fiber, lunch_fiber, dinner_fiber, snack_fiber
            FROM journal_entries 
            WHERE user_id = $1
            ORDER BY entry_date DESC
            LIMIT 10
        `;
        
        const checkResult = await db.query(checkQuery, [actualUserId]);
        console.log('🔍 [Nutrition Analysis] Found entries:', checkResult.rows);
        
        // Get user's nutrition data from the last 7 days for Home screen
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
        
        console.log('🔍 [Nutrition Analysis] Looking for entries since:', sevenDaysAgoStr);
        
        const query = `
            SELECT 
                ROUND(AVG(COALESCE(breakfast_calories, 0) + COALESCE(lunch_calories, 0) + COALESCE(dinner_calories, 0) + COALESCE(snack_calories, 0)), 1) as avg_calories,
                ROUND(AVG(COALESCE(breakfast_protein, 0) + COALESCE(lunch_protein, 0) + COALESCE(dinner_protein, 0) + COALESCE(snack_protein, 0)), 1) as avg_protein,
                ROUND(AVG(COALESCE(breakfast_carbs, 0) + COALESCE(lunch_carbs, 0) + COALESCE(dinner_carbs, 0) + COALESCE(snack_carbs, 0)), 1) as avg_carbs,
                ROUND(AVG(COALESCE(breakfast_fiber, 0) + COALESCE(lunch_fiber, 0) + COALESCE(dinner_fiber, 0) + COALESCE(snack_fiber, 0)), 1) as avg_fiber,
                ROUND(AVG(COALESCE(breakfast_fat, 0) + COALESCE(lunch_fat, 0) + COALESCE(dinner_fat, 0) + COALESCE(snack_fat, 0)), 1) as avg_fat,
                COUNT(*) as days_with_meals
            FROM journal_entries 
            WHERE user_id = $1 
            AND entry_date >= $2
            AND (
                COALESCE(breakfast_calories, 0) > 0 OR 
                COALESCE(lunch_calories, 0) > 0 OR 
                COALESCE(dinner_calories, 0) > 0 OR 
                COALESCE(snack_calories, 0) > 0 OR
                COALESCE(breakfast_protein, 0) > 0 OR 
                COALESCE(lunch_protein, 0) > 0 OR 
                COALESCE(dinner_protein, 0) > 0 OR 
                COALESCE(snack_protein, 0) > 0 OR
                breakfast IS NOT NULL AND breakfast != '' OR
                lunch IS NOT NULL AND lunch != '' OR
                dinner IS NOT NULL AND dinner != '' OR
                snacks IS NOT NULL AND snacks != ''
            )
        `;
        
        const result = await db.query(query, [actualUserId, sevenDaysAgoStr]);
        
        console.log('🔍 [Nutrition Analysis] Query result:', result.rows);
        
        if (result.rows.length === 0 || result.rows[0].days_with_meals === 0) {
            console.log('🔍 [Nutrition Analysis] No meal data found, returning default response');
            return res.json({
                avg_calories: 0,
                avg_protein: 0,
                avg_carbs: 0,
                avg_fiber: 0,
                avg_fat: 0,
                days_with_meals: 0,
                deficiencies: [],
                recommendations: ["Start logging your meals to get personalized nutrition analysis"],
                overall_score: 0,
                last_updated: new Date().toISOString()
            });
        }
        
        const data = result.rows[0];
        console.log('🔍 [Nutrition Analysis] Processed data:', data);
        
        // IBD-specific nutrition benchmarks based on research
        const benchmarks = {
            calories: { recommended: 2000, unit: "kcal" },
            protein: { recommended: 84, unit: "g" }, // 1.2g/kg for 70kg person
            carbs: { recommended: 250, unit: "g" },
            fiber: { recommended: 25, unit: "g" }, // Lower fiber for IBD patients
            fat: { recommended: 65, unit: "g" }
        };
        
        // Calculate deficiencies
        const deficiencies = [];
        let overallScore = 100;
        
        // Protein analysis (critical for IBD)
        const proteinDeficiency = calculateDeficiency(
            "Protein", 
            data.avg_protein || 0, 
            benchmarks.protein.recommended,
            "Protein is crucial for tissue repair and immune function in IBD patients"
        );
        if (proteinDeficiency) {
            deficiencies.push(proteinDeficiency);
            overallScore -= 20;
        }
        
        // Fiber analysis (lower tolerance in IBD)
        const fiberDeficiency = calculateDeficiency(
            "Fiber", 
            data.avg_fiber || 0, 
            benchmarks.fiber.recommended,
            "Fiber should be introduced gradually in IBD patients"
        );
        if (fiberDeficiency) {
            deficiencies.push(fiberDeficiency);
            overallScore -= 15;
        }
        
        // Calories analysis
        const caloriesDeficiency = calculateDeficiency(
            "Calories", 
            data.avg_calories || 0, 
            benchmarks.calories.recommended,
            "Adequate calories are essential for maintaining weight and energy in IBD"
        );
        if (caloriesDeficiency) {
            deficiencies.push(caloriesDeficiency);
            overallScore -= 15;
        }
        
        // Generate recommendations
        const recommendations = generateNutritionRecommendations(deficiencies, data);
        
        const response = {
            avg_calories: data.avg_calories || 0,
            avg_protein: data.avg_protein || 0,
            avg_carbs: data.avg_carbs || 0,
            avg_fiber: data.avg_fiber || 0,
            avg_fat: data.avg_fat || 0,
            days_with_meals: data.days_with_meals || 0,
            deficiencies: deficiencies,
            recommendations: recommendations,
            overall_score: Math.max(0, overallScore),
            last_updated: new Date().toISOString()
        };
        
        console.log('🔍 [Nutrition Analysis] Final response:', response);
        
        res.json(response);
        
    } catch (error) {
        console.error('Error calculating nutrition analysis:', error);
        res.status(500).json({ 
            error: 'Failed to calculate nutrition analysis',
            details: error.message 
        });
    }
});

// GET /api/flare-risk/:userId - Get flare risk analysis based on 3 months of data
router.get('/flare-risk/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get user's data from the last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const query = `
            SELECT 
                entry_date,
                pain_severity,
                bowel_frequency,
                blood_present,
                urgency_level,
                bristol_scale,
                stress_level,
                fatigue_level,
                sleep_hours,
                medication_taken,
                calories,
                protein,
                fiber
            FROM journal_entries 
            WHERE user_id = $1 
            AND entry_date >= $2
            ORDER BY entry_date ASC
        `;
        
        const result = await db.query(query, [userId, threeMonthsAgo.toISOString().split('T')[0]]);
        
        if (result.rows.length === 0) {
            return res.json({
                current_risk: "low",
                trend: [],
                factors: [],
                last_updated: new Date().toISOString()
            });
        }
        
        // Calculate flare risk trend
        const trend = calculateFlareRiskTrend(result.rows);
        
        // Calculate current risk level
        const currentRisk = calculateCurrentRisk(result.rows);
        
        // Identify risk factors
        const factors = identifyRiskFactors(result.rows);
        
        res.json({
            current_risk: currentRisk,
            trend: trend,
            factors: factors,
            last_updated: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error calculating flare risk:', error);
        res.status(500).json({ 
            error: 'Failed to calculate flare risk',
            details: error.message 
        });
    }
});

// Helper function to calculate nutrition deficiency
function calculateDeficiency(nutrient, current, recommended, impact) {
    const percentage = (current / recommended) * 100;
    
    if (percentage >= 90) return null; // No deficiency
    
    let severity = "low";
    if (percentage < 50) severity = "critical";
    else if (percentage < 70) severity = "high";
    else if (percentage < 90) severity = "moderate";
    
    const foodSources = getFoodSources(nutrient);
    
    return {
        nutrient: nutrient,
        current_level: Math.round(current * 10) / 10,
        recommended_level: recommended,
        severity: severity,
        impact: impact,
        food_sources: foodSources
    };
}

// Helper function to get food sources for nutrients
function getFoodSources(nutrient) {
    const sources = {
        "Protein": ["Lean meats", "Fish", "Eggs", "Greek yogurt", "Legumes"],
        "Fiber": ["Cooked vegetables", "Well-cooked grains", "Bananas", "Applesauce"],
        "Calories": ["Nut butters", "Avocado", "Olive oil", "Nuts", "Seeds"],
        "Carbs": ["White rice", "Potatoes", "Bananas", "Applesauce", "Oatmeal"],
        "Fat": { recommended: 65, unit: "g" }
    };
    
    return sources[nutrient] || ["Consult with your dietitian"];
}

// Helper function to generate nutrition recommendations
function generateNutritionRecommendations(deficiencies, data) {
    const recommendations = [];
    
    if (deficiencies.length === 0) {
        recommendations.push("Excellent nutrition balance! Keep up the good work.");
        return recommendations;
    }
    
    deficiencies.forEach(deficiency => {
        switch (deficiency.nutrient) {
            case "Protein":
                recommendations.push("Increase protein intake with lean meats, fish, or plant-based sources");
                break;
            case "Fiber":
                recommendations.push("Consider soluble fiber sources like bananas and well-cooked vegetables");
                break;
            case "Calories":
                recommendations.push("Add calorie-dense foods like nut butters and healthy fats");
                break;
        }
    });
    
    recommendations.push("Consult with your healthcare team for personalized nutrition advice");
    
    return recommendations.slice(0, 3); // Limit to 3 recommendations
}

// Helper function to calculate flare risk trend
function calculateFlareRiskTrend(entries) {
    const trend = [];
    const weeklyData = groupByWeek(entries);
    
    weeklyData.forEach((weekData, weekStart) => {
        const riskScore = calculateWeeklyRiskScore(weekData);
        const riskLevel = getRiskLevel(riskScore);
        
        trend.push({
            date: weekStart,
            risk_level: riskLevel,
            score: riskScore
        });
    });
    
    return trend;
}

// Helper function to group entries by week
function groupByWeek(entries) {
    const weeklyData = new Map();
    
    entries.forEach(entry => {
        const date = new Date(entry.entry_date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData.has(weekKey)) {
            weeklyData.set(weekKey, []);
        }
        weeklyData.get(weekKey).push(entry);
    });
    
    return weeklyData;
}

// Helper function to calculate weekly risk score
function calculateWeeklyRiskScore(weekEntries) {
    if (weekEntries.length === 0) return 0;
    
    let totalScore = 0;
    let maxScore = 0;
    
    weekEntries.forEach(entry => {
        let dayScore = 0;
        
        // Pain severity (0-10 scale)
        dayScore += (entry.pain_severity || 0) * 5;
        
        // Bowel frequency (high frequency = higher risk)
        if (entry.bowel_frequency > 5) dayScore += 15;
        else if (entry.bowel_frequency > 3) dayScore += 10;
        
        // Blood present
        if (entry.blood_present) dayScore += 20;
        
        // Urgency level (0-10 scale)
        dayScore += (entry.urgency_level || 0) * 2;
        
        // Stress level (0-10 scale)
        dayScore += (entry.stress_level || 5) * 1.5;
        
        // Poor sleep
        if (entry.sleep_hours < 6) dayScore += 10;
        
        // Medication adherence
        if (!entry.medication_taken) dayScore += 15;
        
        totalScore += dayScore;
        maxScore = Math.max(maxScore, dayScore);
    });
    
    // Return average score, but weight recent days more heavily
    const avgScore = totalScore / weekEntries.length;
    const weightedScore = (avgScore * 0.7) + (maxScore * 0.3);
    
    return Math.min(100, Math.round(weightedScore));
}

// Helper function to get risk level from score
function getRiskLevel(score) {
    if (score < 20) return "low";
    if (score < 40) return "moderate";
    if (score < 60) return "high";
    return "very_high";
}

// Helper function to calculate current risk
function calculateCurrentRisk(entries) {
    if (entries.length === 0) return "low";
    
    // Use the last 7 days for current risk
    const last7Days = entries.slice(-7);
    const currentScore = calculateWeeklyRiskScore(last7Days);
    
    return getRiskLevel(currentScore);
}

// Helper function to identify risk factors
function identifyRiskFactors(entries) {
    if (entries.length === 0) return [];
    
    const factors = [];
    const last30Days = entries.slice(-30);
    
    // Check for high pain levels
    const highPainDays = last30Days.filter(entry => (entry.pain_severity || 0) > 5).length;
    if (highPainDays > 5) {
        factors.push({
            factor: "High Pain Levels",
            impact: Math.min(0.9, highPainDays / 30),
            description: `${highPainDays} days with pain severity > 5`
        });
    }
    
    // Check for blood presence
    const bloodDays = last30Days.filter(entry => entry.blood_present).length;
    if (bloodDays > 0) {
        factors.push({
            factor: "Blood in Stool",
            impact: Math.min(0.9, bloodDays / 30),
            description: `${bloodDays} days with blood present`
        });
    }
    
    // Check for high stress
    const avgStress = last30Days.reduce((sum, entry) => sum + (entry.stress_level || 5), 0) / last30Days.length;
    if (avgStress > 7) {
        factors.push({
            factor: "High Stress Levels",
            impact: (avgStress - 5) / 5,
            description: `Average stress level: ${Math.round(avgStress)}/10`
        });
    }
    
    // Check for poor sleep
    const poorSleepDays = last30Days.filter(entry => (entry.sleep_hours || 8) < 6).length;
    if (poorSleepDays > 10) {
        factors.push({
            factor: "Poor Sleep",
            impact: Math.min(0.8, poorSleepDays / 30),
            description: `${poorSleepDays} days with < 6 hours sleep`
        });
    }
    
    // Check for medication non-adherence
    const missedMedDays = last30Days.filter(entry => !entry.medication_taken).length;
    if (missedMedDays > 5) {
        factors.push({
            factor: "Medication Non-adherence",
            impact: Math.min(0.9, missedMedDays / 30),
            description: `${missedMedDays} days without medication`
        });
    }
    
    return factors.sort((a, b) => b.impact - a.impact).slice(0, 5);
}

// Helper function for Math.max
function max(a, b) {
    return a > b ? a : b;
}

module.exports = router; 