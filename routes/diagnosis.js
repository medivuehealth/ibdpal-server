const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const router = express.Router();

// Create a new pool using the Neon database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ILP7Oz0VhYKj@ep-lucky-wildflower-ae5uww1l-pooler.c-2.us-east-2.aws.neon.tech/medivue?sslmode=require&channel_binding=require',
    ssl: {
        rejectUnauthorized: false
    }
});

// POST /api/users/:user_id/diagnosis - Save diagnosis information
router.post('/:user_id', async (req, res) => {
    const { user_id } = req.params;
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
        comorbidities,
    } = req.body;

    console.log('DEBUG: Diagnosis save request for user:', user_id);
    console.log('DEBUG: Request body:', req.body);

    try {
        // Construct diagnosis date from year and month
        let diagnosisDate = null;
        if (diagnosisYear && diagnosisMonth) {
            diagnosisDate = `${diagnosisYear}-${diagnosisMonth}-01`;
        }

        // Prepare current medications as text
        const medicationsText = currentMedications && currentMedications.length > 0 
            ? currentMedications.join(', ') 
            : null;

        // Prepare complications as text
        const complicationsText = medicationComplications && medicationComplications.length > 0 
            ? medicationComplications.join(', ') 
            : null;

        // Prepare symptoms as text
        const symptomsText = currentSymptoms && currentSymptoms.length > 0 
            ? currentSymptoms.join(', ') 
            : null;

        // Prepare dietary restrictions as text
        const restrictionsText = dietaryRestrictions && dietaryRestrictions.length > 0 
            ? dietaryRestrictions.join(', ') 
            : null;

        // Prepare comorbidities as text
        const comorbiditiesText = comorbidities && comorbidities.length > 0 
            ? comorbidities.join(', ') 
            : null;

        // Check if medical history record already exists for this user
        const existingRecord = await pool.query(
            'SELECT history_id FROM medical_history WHERE user_id = $1',
            [user_id]
        );

        if (existingRecord.rows.length > 0) {
            // Update existing record
            const updateQuery = `
                UPDATE medical_history 
                SET 
                    diagnosis = $1,
                    diagnosis_date = $2,
                    current_medications = $3,
                    notes = $4,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $5
                RETURNING *
            `;

            const notes = JSON.stringify({
                diseaseLocation,
                diseaseBehavior,
                diseaseSeverity,
                takingMedications,
                medicationComplications: complicationsText,
                isAnemic,
                anemiaSeverity,
                giSpecialistFrequency,
                lastGiVisit,
                familyHistory,
                surgeryHistory,
                hospitalizations,
                flareFrequency,
                currentSymptoms: symptomsText,
                dietaryRestrictions: restrictionsText,
                comorbidities: comorbiditiesText,
            });

            const result = await pool.query(updateQuery, [
                diagnosis,
                diagnosisDate,
                medicationsText,
                notes,
                user_id
            ]);

            console.log('DEBUG: Updated medical history record:', result.rows[0]);

            res.json({
                message: 'Diagnosis information updated successfully',
                data: result.rows[0]
            });
        } else {
            // Create new record
            const insertQuery = `
                INSERT INTO medical_history 
                (user_id, diagnosis, diagnosis_date, current_medications, notes)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;

            const notes = JSON.stringify({
                diseaseLocation,
                diseaseBehavior,
                diseaseSeverity,
                takingMedications,
                medicationComplications: complicationsText,
                isAnemic,
                anemiaSeverity,
                giSpecialistFrequency,
                lastGiVisit,
                familyHistory,
                surgeryHistory,
                hospitalizations,
                flareFrequency,
                currentSymptoms: symptomsText,
                dietaryRestrictions: restrictionsText,
                comorbidities: comorbiditiesText,
            });

            const result = await pool.query(insertQuery, [
                user_id,
                diagnosis,
                diagnosisDate,
                medicationsText,
                notes
            ]);

            console.log('DEBUG: Created new medical history record:', result.rows[0]);

            res.json({
                message: 'Diagnosis information saved successfully',
                data: result.rows[0]
            });
        }
    } catch (err) {
        console.error('Error saving diagnosis information:', err);
        res.status(500).json({
            error: 'Internal server error',
            details: err.message
        });
    }
});

// GET /api/users/:user_id/diagnosis - Get diagnosis information
router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM medical_history WHERE user_id = $1',
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'No diagnosis information found for this user'
            });
        }

        const record = result.rows[0];
        
        // Parse the notes JSON to extract additional fields
        let additionalData = {};
        if (record.notes) {
            try {
                additionalData = JSON.parse(record.notes);
            } catch (e) {
                console.error('Error parsing notes JSON:', e);
            }
        }

        // Extract diagnosis year and month from diagnosis_date
        let diagnosisYear = null;
        let diagnosisMonth = null;
        if (record.diagnosis_date) {
            const date = new Date(record.diagnosis_date);
            diagnosisYear = date.getFullYear().toString();
            diagnosisMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        }

        // Parse arrays from text fields
        const currentMedications = record.current_medications ? record.current_medications.split(', ') : [];
        const medicationComplications = additionalData.medicationComplications ? additionalData.medicationComplications.split(', ') : [];
        const currentSymptoms = additionalData.currentSymptoms ? additionalData.currentSymptoms.split(', ') : [];
        const dietaryRestrictions = additionalData.dietaryRestrictions ? additionalData.dietaryRestrictions.split(', ') : [];
        const comorbidities = additionalData.comorbidities ? additionalData.comorbidities.split(', ') : [];

        res.json({
            diagnosis: record.diagnosis,
            diagnosisYear,
            diagnosisMonth,
            diseaseLocation: additionalData.diseaseLocation,
            diseaseBehavior: additionalData.diseaseBehavior,
            diseaseSeverity: additionalData.diseaseSeverity,
            takingMedications: additionalData.takingMedications,
            currentMedications,
            medicationComplications,
            isAnemic: additionalData.isAnemic,
            anemiaSeverity: additionalData.anemiaSeverity,
            giSpecialistFrequency: additionalData.giSpecialistFrequency,
            lastGiVisit: additionalData.lastGiVisit,
            familyHistory: additionalData.familyHistory,
            surgeryHistory: additionalData.surgeryHistory,
            hospitalizations: additionalData.hospitalizations,
            flareFrequency: additionalData.flareFrequency,
            currentSymptoms,
            dietaryRestrictions,
            comorbidities,
        });
    } catch (err) {
        console.error('Error fetching diagnosis information:', err);
        res.status(500).json({
            error: 'Internal server error',
            details: err.message
        });
    }
});

module.exports = router; 