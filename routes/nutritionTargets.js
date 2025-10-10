const express = require('express');
const { query } = require('../database/db');
const router = express.Router();

// MARK: - Fixed NIH DRI-Based Nutrition Targets
// Unified calculation system using NIH Dietary Reference Intakes
// Resolves conflicts between weight-based and DRI-based systems

/**
 * GET /api/nutrition-targets/:userId
 * Get personalized nutrition targets based on NIH DRI with disease activity assessment
 * Lazy loaded - calculates when requested
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { forceUpdate = false } = req.query;
        
        console.log(`🔍 Calculating nutrition targets for user: ${userId}`);
        
        // Get user profile data
        const userProfile = await getUserProfile(userId);
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
            });
        }
        
        // Get current disease activity (lazy load if needed)
        const diseaseActivity = await getCurrentDiseaseActivity(userId, forceUpdate);
        
        // Calculate nutrition targets using fixed NIH DRI system
        const nutritionTargets = calculateNIHDRITargets(userProfile, diseaseActivity);
        
        res.json({
            success: true,
            nutritionTargets,
            diseaseActivity,
            calculationMethod: 'NIH_DRI_Unified',
            lastUpdated: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error calculating nutrition targets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate nutrition targets',
            message: error.message
        });
    }
});

/**
 * GET /api/nutrition-targets/:userId/macronutrients
 * Get macronutrient targets only
 */
router.get('/:userId/macronutrients', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const userProfile = await getUserProfile(userId);
        const diseaseActivity = await getCurrentDiseaseActivity(userId);
        
        const macronutrients = calculateMacronutrientTargets(userProfile, diseaseActivity);
        
        res.json({
            success: true,
            macronutrients,
            diseaseActivity
        });
        
    } catch (error) {
        console.error('❌ Error calculating macronutrient targets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate macronutrient targets',
            message: error.message
        });
    }
});

/**
 * GET /api/nutrition-targets/:userId/micronutrients
 * Get micronutrient targets only
 */
router.get('/:userId/micronutrients', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const userProfile = await getUserProfile(userId);
        const diseaseActivity = await getCurrentDiseaseActivity(userId);
        
        const micronutrients = calculateMicronutrientTargets(userProfile, diseaseActivity);
        
        res.json({
            success: true,
            micronutrients,
            diseaseActivity
        });
        
    } catch (error) {
        console.error('❌ Error calculating micronutrient targets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate micronutrient targets',
            message: error.message
        });
    }
});

// MARK: - Helper Functions

/**
 * Get user profile data
 */
async function getUserProfile(userId) {
    // Get profile from micronutrient_profiles table (has age, weight, height, gender)
    const profileResult = await query(`
        SELECT 
            user_id, age, weight, height, gender
        FROM micronutrient_profiles 
        WHERE user_id = $1
    `, [userId]);
    
    // Get user data from users table
    const userResult = await query(`
        SELECT 
            user_id, email, first_name, last_name, date_of_birth, gender as user_gender,
            disease_activity, ibd_type
        FROM users 
        WHERE user_id = $1
    `, [userId]);
    
    const user = userResult.rows.length > 0 ? userResult.rows[0] : {};
    
    // Get diagnosis data for disease severity mapping
    let diagnosisData = null;
    if (user.email) {
        try {
            const diagnosisResult = await query(`
                SELECT disease_severity, diagnosis, disease_location, disease_behavior
                FROM user_diagnosis 
                WHERE username = $1
            `, [user.email]);
            diagnosisData = diagnosisResult.rows.length > 0 ? diagnosisResult.rows[0] : null;
        } catch (error) {
            // user_diagnosis table might not exist
            diagnosisData = null;
        }
    }
    
    // If no micronutrient profile exists, create one with default values
    if (profileResult.rows.length === 0) {
        // Calculate age from date_of_birth if available
        let age = 30; // Default age
        if (user.date_of_birth) {
            const birthDate = new Date(user.date_of_birth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }
        
        // Create default micronutrient profile
        const defaultGender = user.user_gender && ['Male', 'Female', 'Other'].includes(user.user_gender) 
            ? user.user_gender 
            : 'Other'; // Default to 'Other' if gender is not valid
        
        await query(`
            INSERT INTO micronutrient_profiles (user_id, age, weight, height, gender)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id) DO NOTHING
        `, [userId, age, 70.0, 170.0, defaultGender]);
        
        // Map diagnosis severity to disease activity
        let diseaseActivity = user.disease_activity || 'remission';
        if (diagnosisData && diagnosisData.disease_severity) {
            switch (diagnosisData.disease_severity.toLowerCase()) {
                case 'mild': diseaseActivity = 'mild'; break;
                case 'moderate': diseaseActivity = 'moderate'; break;
                case 'severe': diseaseActivity = 'severe'; break;
                default: diseaseActivity = 'remission';
            }
        }
        
        // Return default profile
        return {
            user_id: userId,
            age: age,
            weight: 70.0,
            height: 170.0,
            gender: defaultGender,
            disease_activity: diseaseActivity,
            disease_type: user.ibd_type || (diagnosisData?.diagnosis || 'IBD')
        };
    }
    
    const profile = profileResult.rows[0];
    
    // Map diagnosis severity to disease activity if available
    let diseaseActivity = user.disease_activity || 'remission';
    if (diagnosisData && diagnosisData.disease_severity) {
        switch (diagnosisData.disease_severity.toLowerCase()) {
            case 'mild': diseaseActivity = 'mild'; break;
            case 'moderate': diseaseActivity = 'moderate'; break;
            case 'severe': diseaseActivity = 'severe'; break;
            default: diseaseActivity = 'remission';
        }
    }
    
    // Combine profile and user data
    return {
        user_id: profile.user_id,
        age: profile.age,
        weight: profile.weight,
        height: profile.height,
        gender: profile.gender,
        disease_activity: diseaseActivity,
        disease_type: user.ibd_type || (diagnosisData?.diagnosis || 'IBD')
    };
}

/**
 * Get current disease activity (lazy load if needed)
 */
async function getCurrentDiseaseActivity(userId, forceUpdate = false) {
    // First check if we have recent assessment
    const result = await query(`
        SELECT disease_activity, last_assessment_date, assessment_confidence
        FROM users 
        WHERE user_id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
        return 'remission'; // Default fallback
    }
    
    const user = result.rows[0];
    const lastAssessment = user.last_assessment_date;
    const daysSinceAssessment = lastAssessment ? 
        Math.floor((new Date() - new Date(lastAssessment)) / (1000 * 60 * 60 * 24)) : 7;
    
    // If assessment is older than 7 days or force update, trigger new assessment
    if (daysSinceAssessment > 7 || forceUpdate) {
        try {
            // Trigger disease activity assessment
            const assessmentResponse = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3004'}/api/disease-activity/assess/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (assessmentResponse.ok) {
                const assessment = await assessmentResponse.json();
                return assessment.diseaseActivity;
            }
        } catch (error) {
            console.error('Error triggering disease activity assessment:', error);
        }
    }
    
    return user.disease_activity || 'remission';
}

/**
 * Calculate nutrition targets using fixed NIH DRI system
 */
function calculateNIHDRITargets(userProfile, diseaseActivity) {
    const { age, weight, height, gender } = userProfile;
    
    // FIXED: Use only NIH DRI baseline values (no weight-based calculations)
    const nihDRI = getNIHDRIBaseline(age, gender);
    
    // FIXED: Corrected age multipliers (resolves documentation vs code conflict)
    const ageMultiplier = getCorrectedAgeMultiplier(age);
    
    // Disease activity multipliers
    const diseaseActivityMultiplier = getDiseaseActivityMultiplier(diseaseActivity);
    
    // Disease type multiplier (IBD patients need more nutrients)
    const diseaseTypeMultiplier = getDiseaseTypeMultiplier(userProfile.disease_type);
    
    // Calculate total multiplier
    const totalMultiplier = ageMultiplier * diseaseActivityMultiplier * diseaseTypeMultiplier;
    
    // Calculate final targets
    const macronutrients = calculateMacronutrientTargets(userProfile, diseaseActivity, nihDRI, totalMultiplier);
    const micronutrients = calculateMicronutrientTargets(userProfile, diseaseActivity, nihDRI, totalMultiplier);
    
    return {
        macronutrients,
        micronutrients,
        calculationDetails: {
            nihDRI,
            ageMultiplier,
            diseaseActivityMultiplier,
            diseaseTypeMultiplier,
            totalMultiplier,
            diseaseActivity
        }
    };
}

/**
 * Get NIH DRI baseline values (evidence-based)
 */
function getNIHDRIBaseline(age, gender) {
    const isMale = gender?.toLowerCase() === 'male';
    
    // NIH DRI baseline values for adults (19-50 years)
    const baseValues = {
        // Macronutrients
        calories: isMale ? 2500 : 2000,        // kcal/day
        protein: isMale ? 56 : 46,             // g/day
        fiber: isMale ? 38 : 25,               // g/day
        hydration: isMale ? 3700 : 2700,       // ml/day
        
        // Micronutrients (RDA/AI values)
        vitaminD: 600,                         // IU
        vitaminB12: 2.4,                       // mcg
        iron: isMale ? 8 : 18,                 // mg
        folate: 400,                           // mcg DFE
        calcium: 1000,                         // mg
        zinc: isMale ? 11 : 8,                 // mg
        omega3: 1100,                          // mg
        magnesium: 400,                        // mg
        vitaminC: 90,                          // mg
        vitaminA: isMale ? 900 : 700,          // mcg RAE
        vitaminE: 15,                          // mg
        vitaminK: isMale ? 120 : 90,           // mcg
        thiamin: isMale ? 1.2 : 1.1,           // mg
        riboflavin: isMale ? 1.3 : 1.1,        // mg
        niacin: isMale ? 16 : 14,              // mg NE
        vitaminB6: isMale ? 1.3 : 1.3,         // mg
        pantothenicAcid: 5,                    // mg
        biotin: 30,                            // mcg
        choline: isMale ? 550 : 425,           // mg
        phosphorus: 700,                       // mg
        potassium: isMale ? 3400 : 2600,       // mg
        sodium: 2300,                          // mg
        chloride: 2300,                        // mg
        selenium: 55,                           // mcg
        copper: 0.9,                           // mg
        manganese: 2.3,                        // mg
        fluoride: isMale ? 4 : 3,              // mg
        chromium: 35,                          // mcg
        molybdenum: 45,                        // mcg
        iodine: 150                            // mcg
    };
    
    // Age adjustments for NIH DRI
    if (age < 18) {
        // Pediatric adjustments
        baseValues.calories *= 0.8;
        baseValues.protein *= 0.7;
        baseValues.hydration *= 0.7;
    } else if (age > 50) {
        // Geriatric adjustments
        baseValues.calories *= 0.9;
        baseValues.protein *= 1.1; // Higher protein for aging
        baseValues.vitaminD *= 1.2; // Higher vitamin D for bone health
        baseValues.calcium *= 1.2; // Higher calcium for bone health
    }
    
    return baseValues;
}

/**
 * FIXED: Corrected age multipliers (resolves documentation vs code conflict)
 */
function getCorrectedAgeMultiplier(age) {
    if (age < 18) {
        return 1.2;  // 20% increase for growth
    } else if (age >= 18 && age <= 50) {
        return 1.0;  // No adjustment for adults
    } else if (age >= 51 && age <= 70) {
        return 1.1;  // 10% increase for aging
    } else {
        return 1.2;  // 20% increase for older adults
    }
}

/**
 * Disease activity multipliers
 */
function getDiseaseActivityMultiplier(diseaseActivity) {
    switch (diseaseActivity) {
        case 'remission': return 1.0;
        case 'mild': return 1.1;
        case 'moderate': return 1.2;
        case 'severe': return 1.4;
        default: return 1.0;
    }
}

/**
 * Disease type multipliers
 */
function getDiseaseTypeMultiplier(diseaseType) {
    if (!diseaseType) return 1.0;
    
    switch (diseaseType.toLowerCase()) {
        case 'crohns':
        case 'crohn':
        case 'cd':
            return 1.2; // Higher malabsorption
        case 'uc':
        case 'ulcerative colitis':
            return 1.1; // Moderate adjustments
        case 'ibs':
            return 1.05; // Minimal adjustments
        default:
            return 1.15; // General IBD
    }
}

/**
 * Calculate macronutrient targets
 */
function calculateMacronutrientTargets(userProfile, diseaseActivity, nihDRI, totalMultiplier) {
    const { age, weight, gender } = userProfile;
    
    // Base calories from NIH DRI (not weight-based)
    const baseCalories = nihDRI.calories;
    const calories = Math.round(baseCalories * totalMultiplier);
    
    // Protein from NIH DRI (not weight-based)
    const baseProtein = nihDRI.protein;
    const protein = Math.round(baseProtein * totalMultiplier);
    
    // Fiber from NIH DRI
    const baseFiber = nihDRI.fiber;
    const fiber = Math.round(baseFiber * totalMultiplier);
    
    // FIXED: Hydration targets (reduced from excessive levels)
    const baseHydration = nihDRI.hydration;
    const hydration = Math.round(baseHydration * totalMultiplier);
    
    // Fat and carbs calculated from calories
    const fat = Math.round((calories * 0.30) / 9); // 30% of calories from fat
    const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4); // Remaining calories as carbs
    
    return {
        calories,
        protein,
        fiber,
        hydration,
        fat,
        carbs,
        proteinPerKg: weight > 0 ? Math.round((protein / weight) * 10) / 10 : 0
    };
}

/**
 * Calculate micronutrient targets
 */
function calculateMicronutrientTargets(userProfile, diseaseActivity, nihDRI, totalMultiplier) {
    const { age, gender } = userProfile;
    
    // IBD-specific micronutrient adjustments
    const ibdAdjustments = getIBDMicronutrientAdjustments(age, gender, diseaseActivity);
    
    return {
        // Vitamins
        vitaminD: Math.round(nihDRI.vitaminD * totalMultiplier * ibdAdjustments.vitaminD),
        vitaminB12: Math.round(nihDRI.vitaminB12 * totalMultiplier * ibdAdjustments.vitaminB12),
        vitaminC: Math.round(nihDRI.vitaminC * totalMultiplier * ibdAdjustments.vitaminC),
        vitaminA: Math.round(nihDRI.vitaminA * totalMultiplier * ibdAdjustments.vitaminA),
        vitaminE: Math.round(nihDRI.vitaminE * totalMultiplier * ibdAdjustments.vitaminE),
        vitaminK: Math.round(nihDRI.vitaminK * totalMultiplier * ibdAdjustments.vitaminK),
        
        // B Vitamins
        thiamin: Math.round(nihDRI.thiamin * totalMultiplier * ibdAdjustments.thiamin),
        riboflavin: Math.round(nihDRI.riboflavin * totalMultiplier * ibdAdjustments.riboflavin),
        niacin: Math.round(nihDRI.niacin * totalMultiplier * ibdAdjustments.niacin),
        vitaminB6: Math.round(nihDRI.vitaminB6 * totalMultiplier * ibdAdjustments.vitaminB6),
        folate: Math.round(nihDRI.folate * totalMultiplier * ibdAdjustments.folate),
        pantothenicAcid: Math.round(nihDRI.pantothenicAcid * totalMultiplier * ibdAdjustments.pantothenicAcid),
        biotin: Math.round(nihDRI.biotin * totalMultiplier * ibdAdjustments.biotin),
        choline: Math.round(nihDRI.choline * totalMultiplier * ibdAdjustments.choline),
        
        // Minerals
        calcium: Math.round(nihDRI.calcium * totalMultiplier * ibdAdjustments.calcium),
        iron: Math.round(nihDRI.iron * totalMultiplier * ibdAdjustments.iron),
        zinc: Math.round(nihDRI.zinc * totalMultiplier * ibdAdjustments.zinc),
        magnesium: Math.round(nihDRI.magnesium * totalMultiplier * ibdAdjustments.magnesium),
        phosphorus: Math.round(nihDRI.phosphorus * totalMultiplier * ibdAdjustments.phosphorus),
        potassium: Math.round(nihDRI.potassium * totalMultiplier * ibdAdjustments.potassium),
        sodium: Math.round(nihDRI.sodium * totalMultiplier * ibdAdjustments.sodium),
        chloride: Math.round(nihDRI.chloride * totalMultiplier * ibdAdjustments.chloride),
        selenium: Math.round(nihDRI.selenium * totalMultiplier * ibdAdjustments.selenium),
        copper: Math.round(nihDRI.copper * totalMultiplier * ibdAdjustments.copper),
        manganese: Math.round(nihDRI.manganese * totalMultiplier * ibdAdjustments.manganese),
        fluoride: Math.round(nihDRI.fluoride * totalMultiplier * ibdAdjustments.fluoride),
        chromium: Math.round(nihDRI.chromium * totalMultiplier * ibdAdjustments.chromium),
        molybdenum: Math.round(nihDRI.molybdenum * totalMultiplier * ibdAdjustments.molybdenum),
        iodine: Math.round(nihDRI.iodine * totalMultiplier * ibdAdjustments.iodine),
        
        // Omega-3
        omega3: Math.round(nihDRI.omega3 * totalMultiplier * ibdAdjustments.omega3)
    };
}

/**
 * IBD-specific micronutrient adjustments
 */
function getIBDMicronutrientAdjustments(age, gender, diseaseActivity) {
    const isFemale = gender?.toLowerCase() === 'female';
    
    // Base IBD adjustments (evidence-based)
    const adjustments = {
        vitaminD: 4.0,      // 2000-4000 IU vs RDA 600-800 IU
        vitaminB12: 400,    // 1000-2000 mcg vs RDA 2.4 mcg
        vitaminC: 2.0,      // Higher for immune support
        vitaminA: 1.2,      // Moderate increase
        vitaminE: 1.5,      // Antioxidant support
        vitaminK: 1.3,      // Blood clotting
        thiamin: 1.2,       // Energy metabolism
        riboflavin: 1.2,    // Energy metabolism
        niacin: 1.2,        // Energy metabolism
        vitaminB6: 1.3,     // Protein metabolism
        folate: 1.5,        // Medication interactions
        pantothenicAcid: 1.2,
        biotin: 1.2,
        choline: 1.3,
        calcium: 1.2,       // Bone health
        iron: isFemale ? 2.5 : 3.75, // Higher for blood loss
        zinc: 1.4,          // Healing and immune function
        magnesium: 1.2,     // Muscle function
        phosphorus: 1.1,
        potassium: 1.1,
        sodium: 1.0,
        chloride: 1.0,
        selenium: 1.3,      // Antioxidant support
        copper: 1.2,
        manganese: 1.2,
        fluoride: 1.0,
        chromium: 1.2,
        molybdenum: 1.1,
        iodine: 1.1,
        omega3: 1.8         // Anti-inflammatory
    };
    
    // Disease activity adjustments
    const activityMultiplier = getDiseaseActivityMultiplier(diseaseActivity);
    
    // Apply activity multiplier to key nutrients
    const keyNutrients = ['vitaminD', 'vitaminB12', 'iron', 'zinc', 'omega3'];
    keyNutrients.forEach(nutrient => {
        adjustments[nutrient] *= activityMultiplier;
    });
    
    return adjustments;
}

module.exports = router;
