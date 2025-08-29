const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/diagnosis - Get user's diagnosis information
router.get('/', authenticateToken, async (req, res) => {
    try {
        const username = req.user.email; // JWT token contains email as username
        
        const result = await db.query(
            'SELECT * FROM user_diagnosis WHERE username = $1 ORDER BY updated_at DESC LIMIT 1',
            [username]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No diagnosis found for this user' });
        }
        
        res.json({
            success: true,
            diagnosis: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching diagnosis:', error);
        res.status(500).json({ error: 'Failed to fetch diagnosis information' });
    }
});

// POST /api/diagnosis - Save or update user's diagnosis information
router.post('/', authenticateToken, async (req, res) => {
    try {
        const username = req.user.email; // JWT token contains email as username
        const {
            diagnosis,
            diagnosisYear,
            diagnosisMonth,
            diseaseLocation,
            diseaseBehavior,
            diseaseSeverity,
            takingMedications,
            currentMedications,
            medicationComplications,
            isAnemic,
            anemiaSeverity,
            giSpecialistFrequency,
            lastGiVisit,
            familyHistory,
            surgeryHistory,
            hospitalizations,
            flareFrequency,
            currentSymptoms,
            dietaryRestrictions,
            comorbidities
        } = req.body;
        
        // Validate required fields
        if (!diagnosis) {
            return res.status(400).json({ error: 'Diagnosis is required' });
        }
        
        // Validate and parse last_gi_visit date
        let parsedLastGiVisit = null;
        if (lastGiVisit) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(lastGiVisit)) {
                return res.status(400).json({ error: 'Invalid date format for last GI visit. Use YYYY-MM-DD format.' });
            }
            parsedLastGiVisit = lastGiVisit;
        }
        
        // Check if user already has a diagnosis record
        const existingResult = await db.query(
            'SELECT id FROM user_diagnosis WHERE username = $1',
            [username]
        );
        
        let result;
        
        if (existingResult.rows.length > 0) {
            // Update existing record
            result = await db.query(`
                UPDATE user_diagnosis SET
                    diagnosis = $1,
                    diagnosis_year = $2,
                    diagnosis_month = $3,
                    disease_location = $4,
                    disease_behavior = $5,
                    disease_severity = $6,
                    taking_medications = $7,
                    current_medications = $8,
                    medication_complications = $9,
                    is_anemic = $10,
                    anemia_severity = $11,
                    gi_specialist_frequency = $12,
                    last_gi_visit = $13,
                    family_history = $14,
                    surgery_history = $15,
                    hospitalizations = $16,
                    flare_frequency = $17,
                    current_symptoms = $18,
                    dietary_restrictions = $19,
                    comorbidities = $20,
                    updated_at = CURRENT_TIMESTAMP
                WHERE username = $21
                RETURNING *
            `, [
                diagnosis,
                diagnosisYear || null,
                diagnosisMonth || null,
                diseaseLocation || null,
                diseaseBehavior || null,
                diseaseSeverity || null,
                takingMedications || null,
                currentMedications || [],
                medicationComplications || [],
                isAnemic || null,
                anemiaSeverity || null,
                giSpecialistFrequency || null,
                parsedLastGiVisit || null,
                familyHistory || null,
                surgeryHistory || null,
                hospitalizations || null,
                flareFrequency || null,
                currentSymptoms || [],
                dietaryRestrictions || [],
                comorbidities || [],
                username
            ]);
        } else {
            // Insert new record
            result = await db.query(`
                INSERT INTO user_diagnosis (
                    username,
                    diagnosis,
                    diagnosis_year,
                    diagnosis_month,
                    disease_location,
                    disease_behavior,
                    disease_severity,
                    taking_medications,
                    current_medications,
                    medication_complications,
                    is_anemic,
                    anemia_severity,
                    gi_specialist_frequency,
                    last_gi_visit,
                    family_history,
                    surgery_history,
                    hospitalizations,
                    flare_frequency,
                    current_symptoms,
                    dietary_restrictions,
                    comorbidities
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
                RETURNING *
            `, [
                username,
                diagnosis,
                diagnosisYear || null,
                diagnosisMonth || null,
                diseaseLocation || null,
                diseaseBehavior || null,
                diseaseSeverity || null,
                takingMedications || null,
                currentMedications || [],
                medicationComplications || [],
                isAnemic || null,
                anemiaSeverity || null,
                giSpecialistFrequency || null,
                parsedLastGiVisit || null,
                familyHistory || null,
                surgeryHistory || null,
                hospitalizations || null,
                flareFrequency || null,
                currentSymptoms || [],
                dietaryRestrictions || [],
                comorbidities || []
            ]);
        }
        
        res.json({
            success: true,
            message: 'Diagnosis information saved successfully',
            diagnosis: result.rows[0]
        });
    } catch (error) {
        console.error('Error saving diagnosis:', error);
        res.status(500).json({ error: 'Failed to save diagnosis information' });
    }
});

// DELETE /api/diagnosis - Delete user's diagnosis information
router.delete('/', authenticateToken, async (req, res) => {
    try {
        const username = req.user.email; // JWT token contains email as username
        
        const result = await db.query(
            'DELETE FROM user_diagnosis WHERE username = $1 RETURNING id',
            [username]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No diagnosis found to delete' });
        }
        
        res.json({
            success: true,
            message: 'Diagnosis information deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting diagnosis:', error);
        res.status(500).json({ error: 'Failed to delete diagnosis information' });
    }
});

// GET /api/diagnosis/history - Get diagnosis history for user
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const username = req.user.email; // JWT token contains email as username
        
        const result = await db.query(
            'SELECT * FROM user_diagnosis WHERE username = $1 ORDER BY updated_at DESC',
            [username]
        );
        
        res.json({
            success: true,
            history: result.rows
        });
    } catch (error) {
        console.error('Error fetching diagnosis history:', error);
        res.status(500).json({ error: 'Failed to fetch diagnosis history' });
    }
});

module.exports = router; 