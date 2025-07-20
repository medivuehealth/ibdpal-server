const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware for profile updates
const validateProfileUpdate = [
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').optional().trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender'),
  body('phoneNumber').optional().trim().isLength({ min: 10 }).withMessage('Valid phone number is required'),
  body('patientType').optional().isIn(['pediatric', 'adult', 'transitional']).withMessage('Invalid patient type'),
  body('ibdType').optional().isIn(['crohns', 'ulcerative_colitis', 'indeterminate_colitis', 'ibd_unspecified']).withMessage('Invalid IBD type'),
  body('diseaseActivity').optional().isIn(['remission', 'mild', 'moderate', 'severe']).withMessage('Invalid disease activity'),
  body('dataSharingConsent').optional().isBoolean().withMessage('Data sharing consent must be boolean'),
  body('aiModelConsent').optional().isBoolean().withMessage('AI model consent must be boolean'),
  body('researchConsent').optional().isBoolean().withMessage('Research consent must be boolean')
];

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await db.query(
      `SELECT 
        user_id, email, first_name, last_name, display_name,
        date_of_birth, gender, phone_number, address, city, state, country, postal_code,
        emergency_contact_name, emergency_contact_phone,
        mrn, pseudonymized_id, patient_type, diagnosis_date, ibd_type,
        disease_location, disease_behavior, current_medications, allergies,
        comorbidities, family_history, disease_activity, last_flare_date,
        flare_frequency, hospitalizations_count, surgeries_count,
        insurance_provider, insurance_id, primary_care_physician,
        gastroenterologist, care_coordinator,
        data_sharing_consent, ai_model_consent, research_consent, consent_date,
        account_status, email_verified, phone_verified,
        created_at, last_login, last_activity
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        phoneNumber: user.phone_number,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        postalCode: user.postal_code,
        emergencyContactName: user.emergency_contact_name,
        emergencyContactPhone: user.emergency_contact_phone,
        mrn: user.mrn,
        pseudonymizedId: user.pseudonymized_id,
        patientType: user.patient_type,
        diagnosisDate: user.diagnosis_date,
        ibdType: user.ibd_type,
        diseaseLocation: user.disease_location,
        diseaseBehavior: user.disease_behavior,
        currentMedications: user.current_medications,
        allergies: user.allergies,
        comorbidities: user.comorbidities,
        familyHistory: user.family_history,
        diseaseActivity: user.disease_activity,
        lastFlareDate: user.last_flare_date,
        flareFrequency: user.flare_frequency,
        hospitalizationsCount: user.hospitalizations_count,
        surgeriesCount: user.surgeries_count,
        insuranceProvider: user.insurance_provider,
        insuranceId: user.insurance_id,
        primaryCarePhysician: user.primary_care_physician,
        gastroenterologist: user.gastroenterologist,
        careCoordinator: user.care_coordinator,
        dataSharingConsent: user.data_sharing_consent,
        aiModelConsent: user.ai_model_consent,
        researchConsent: user.research_consent,
        consentDate: user.consent_date,
        accountStatus: user.account_status,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        lastActivity: user.last_activity
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Unable to fetch user profile',
      message: 'Please try again.'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateProfileUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.userId;
    const {
      firstName, lastName, displayName, dateOfBirth, gender, phoneNumber,
      address, city, state, country, postalCode, emergencyContactName, emergencyContactPhone,
      mrn, patientType, diagnosisDate, ibdType, diseaseLocation, diseaseBehavior,
      currentMedications, allergies, comorbidities, familyHistory, diseaseActivity,
      lastFlareDate, flareFrequency, hospitalizationsCount, surgeriesCount,
      insuranceProvider, insuranceId, primaryCarePhysician, gastroenterologist, careCoordinator,
      dataSharingConsent, aiModelConsent, researchConsent
    } = req.body;

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    // Basic profile fields
    if (firstName !== undefined) {
      updateFields.push(`first_name = $${paramCount++}`);
      updateValues.push(firstName);
    }
    if (lastName !== undefined) {
      updateFields.push(`last_name = $${paramCount++}`);
      updateValues.push(lastName);
    }
    if (displayName !== undefined) {
      updateFields.push(`display_name = $${paramCount++}`);
      updateValues.push(displayName);
    }
    if (dateOfBirth !== undefined) {
      updateFields.push(`date_of_birth = $${paramCount++}`);
      updateValues.push(dateOfBirth);
    }
    if (gender !== undefined) {
      updateFields.push(`gender = $${paramCount++}`);
      updateValues.push(gender);
    }
    if (phoneNumber !== undefined) {
      updateFields.push(`phone_number = $${paramCount++}`);
      updateValues.push(phoneNumber);
    }

    // Address fields
    if (address !== undefined) {
      updateFields.push(`address = $${paramCount++}`);
      updateValues.push(address);
    }
    if (city !== undefined) {
      updateFields.push(`city = $${paramCount++}`);
      updateValues.push(city);
    }
    if (state !== undefined) {
      updateFields.push(`state = $${paramCount++}`);
      updateValues.push(state);
    }
    if (country !== undefined) {
      updateFields.push(`country = $${paramCount++}`);
      updateValues.push(country);
    }
    if (postalCode !== undefined) {
      updateFields.push(`postal_code = $${paramCount++}`);
      updateValues.push(postalCode);
    }

    // Emergency contact
    if (emergencyContactName !== undefined) {
      updateFields.push(`emergency_contact_name = $${paramCount++}`);
      updateValues.push(emergencyContactName);
    }
    if (emergencyContactPhone !== undefined) {
      updateFields.push(`emergency_contact_phone = $${paramCount++}`);
      updateValues.push(emergencyContactPhone);
    }

    // Healthcare fields
    if (mrn !== undefined) {
      updateFields.push(`mrn = $${paramCount++}`);
      updateValues.push(mrn);
    }
    if (patientType !== undefined) {
      updateFields.push(`patient_type = $${paramCount++}`);
      updateValues.push(patientType);
    }
    if (diagnosisDate !== undefined) {
      updateFields.push(`diagnosis_date = $${paramCount++}`);
      updateValues.push(diagnosisDate);
    }
    if (ibdType !== undefined) {
      updateFields.push(`ibd_type = $${paramCount++}`);
      updateValues.push(ibdType);
    }
    if (diseaseLocation !== undefined) {
      updateFields.push(`disease_location = $${paramCount++}`);
      updateValues.push(diseaseLocation);
    }
    if (diseaseBehavior !== undefined) {
      updateFields.push(`disease_behavior = $${paramCount++}`);
      updateValues.push(diseaseBehavior);
    }
    if (currentMedications !== undefined) {
      updateFields.push(`current_medications = $${paramCount++}`);
      updateValues.push(currentMedications);
    }
    if (allergies !== undefined) {
      updateFields.push(`allergies = $${paramCount++}`);
      updateValues.push(allergies);
    }
    if (comorbidities !== undefined) {
      updateFields.push(`comorbidities = $${paramCount++}`);
      updateValues.push(comorbidities);
    }
    if (familyHistory !== undefined) {
      updateFields.push(`family_history = $${paramCount++}`);
      updateValues.push(familyHistory);
    }
    if (diseaseActivity !== undefined) {
      updateFields.push(`disease_activity = $${paramCount++}`);
      updateValues.push(diseaseActivity);
    }
    if (lastFlareDate !== undefined) {
      updateFields.push(`last_flare_date = $${paramCount++}`);
      updateValues.push(lastFlareDate);
    }
    if (flareFrequency !== undefined) {
      updateFields.push(`flare_frequency = $${paramCount++}`);
      updateValues.push(flareFrequency);
    }
    if (hospitalizationsCount !== undefined) {
      updateFields.push(`hospitalizations_count = $${paramCount++}`);
      updateValues.push(hospitalizationsCount);
    }
    if (surgeriesCount !== undefined) {
      updateFields.push(`surgeries_count = $${paramCount++}`);
      updateValues.push(surgeriesCount);
    }

    // Insurance and provider fields
    if (insuranceProvider !== undefined) {
      updateFields.push(`insurance_provider = $${paramCount++}`);
      updateValues.push(insuranceProvider);
    }
    if (insuranceId !== undefined) {
      updateFields.push(`insurance_id = $${paramCount++}`);
      updateValues.push(insuranceId);
    }
    if (primaryCarePhysician !== undefined) {
      updateFields.push(`primary_care_physician = $${paramCount++}`);
      updateValues.push(primaryCarePhysician);
    }
    if (gastroenterologist !== undefined) {
      updateFields.push(`gastroenterologist = $${paramCount++}`);
      updateValues.push(gastroenterologist);
    }
    if (careCoordinator !== undefined) {
      updateFields.push(`care_coordinator = $${paramCount++}`);
      updateValues.push(careCoordinator);
    }

    // Consent fields
    if (dataSharingConsent !== undefined) {
      updateFields.push(`data_sharing_consent = $${paramCount++}`);
      updateValues.push(dataSharingConsent);
    }
    if (aiModelConsent !== undefined) {
      updateFields.push(`ai_model_consent = $${paramCount++}`);
      updateValues.push(aiModelConsent);
    }
    if (researchConsent !== undefined) {
      updateFields.push(`research_consent = $${paramCount++}`);
      updateValues.push(researchConsent);
    }

    // Add consent date if any consent was updated
    if (dataSharingConsent !== undefined || aiModelConsent !== undefined || researchConsent !== undefined) {
      updateFields.push(`consent_date = CURRENT_DATE`);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No fields to update',
        message: 'Please provide at least one field to update.'
      });
    }

    // Add user_id to values array
    updateValues.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramCount}
      RETURNING user_id, email, first_name, last_name, updated_at
    `;

    const result = await db.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: result.rows[0].user_id,
        email: result.rows[0].email,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        updatedAt: result.rows[0].updated_at
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Unable to update profile',
      message: 'Please try again.'
    });
  }
});

// Save diagnosis information
router.post('/diagnosis', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      diagnosis_date,
      ibd_type,
      disease_location,
      disease_behavior,
      disease_activity,
      current_medications,
      medication_complications,
      is_anemic,
      anemia_severity,
      gi_specialist_frequency,
      last_gi_visit,
      family_history,
      surgery_history,
      hospitalizations_count,
      flare_frequency,
      current_symptoms,
      dietary_restrictions,
      comorbidities
    } = req.body;

    // Validate required fields
    if (!ibd_type) {
      return res.status(400).json({
        error: 'IBD type is required'
      });
    }

    // Update user with diagnosis information
    const updateQuery = `
      UPDATE users 
      SET 
        diagnosis_date = $1,
        ibd_type = $2,
        disease_location = $3,
        disease_behavior = $4,
        disease_activity = $5,
        current_medications = $6,
        allergies = $7,
        comorbidities = $8,
        family_history = $9,
        hospitalizations_count = $10,
        flare_frequency = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $12
      RETURNING user_id, ibd_type, diagnosis_date
    `;

    const result = await db.query(updateQuery, [
      diagnosis_date,
      ibd_type,
      disease_location,
      disease_behavior,
      disease_activity,
      current_medications,
      medication_complications, // Store in allergies field for now
      comorbidities,
      family_history,
      hospitalizations_count || 0,
      flare_frequency,
      userId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Log the diagnosis update
    console.log(`Diagnosis updated for user ${userId}:`, {
      ibd_type,
      diagnosis_date,
      disease_location,
      disease_behavior,
      disease_activity
    });

    res.json({
      message: 'Diagnosis information saved successfully',
      diagnosis: {
        ibdType: result.rows[0].ibd_type,
        diagnosisDate: result.rows[0].diagnosis_date,
        userId: result.rows[0].user_id
      }
    });

  } catch (error) {
    console.error('Save diagnosis error:', error);
    res.status(500).json({
      error: 'Unable to save diagnosis information',
      message: 'Please try again.'
    });
  }
});

// Get diagnosis information
router.get('/diagnosis', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT 
        diagnosis_date, ibd_type, disease_location, disease_behavior, 
        disease_activity, current_medications, allergies, comorbidities, 
        family_history, hospitalizations_count, flare_frequency
       FROM users 
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const diagnosis = result.rows[0];

    res.json({
      diagnosis: {
        diagnosisDate: diagnosis.diagnosis_date,
        ibdType: diagnosis.ibd_type,
        diseaseLocation: diagnosis.disease_location,
        diseaseBehavior: diagnosis.disease_behavior,
        diseaseActivity: diagnosis.disease_activity,
        currentMedications: diagnosis.current_medications,
        medicationComplications: diagnosis.allergies, // Using allergies field for complications
        comorbidities: diagnosis.comorbidities,
        familyHistory: diagnosis.family_history,
        hospitalizationsCount: diagnosis.hospitalizations_count,
        flareFrequency: diagnosis.flare_frequency
      }
    });

  } catch (error) {
    console.error('Get diagnosis error:', error);
    res.status(500).json({
      error: 'Unable to fetch diagnosis information',
      message: 'Please try again.'
    });
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Soft delete by setting account status to inactive
    const result = await db.query(
      `UPDATE users 
       SET account_status = 'inactive', updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING user_id`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Unable to deactivate account',
      message: 'Please try again.'
    });
  }
});

module.exports = router; 