const express = require('express');
const { query } = require('../database/db');
const router = express.Router();

// MARK: - Disease Activity AI Assessment Endpoint
// Automatically calculates disease activity based on 30-day symptom data

/**
 * GET /api/disease-activity/assess/:userId
 * Assesses disease activity for a user based on their journal entries
 * Lazy loaded - only calculates when requested
 */
router.get('/assess/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { forceUpdate = false } = req.query;
        
        console.log(`🔍 Assessing disease activity for user: ${userId}`);
        
        // Get user's journal entries from last 30 days
        const journalEntries = await getLast30DaysJournalEntries(userId);
        
        // Get user diagnosis if available
        const userDiagnosis = await getUserDiagnosis(userId);
        
        // Perform AI assessment
        const assessment = await assessDiseaseActivityAI(journalEntries, userDiagnosis);
        
        // Update user's disease activity in database
        await updateUserDiseaseActivity(userId, assessment);
        
        res.json({
            success: true,
            diseaseActivity: assessment.diseaseActivity,
            confidence: assessment.confidence,
            dataQuality: assessment.dataQuality,
            daysOfData: assessment.daysOfData,
            lastAssessment: assessment.assessmentDate,
            source: assessment.source
        });
        
    } catch (error) {
        console.error('❌ Error assessing disease activity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to assess disease activity',
            message: error.message
        });
    }
});

/**
 * GET /api/disease-activity/status/:userId
 * Gets current disease activity status without triggering assessment
 */
router.get('/status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await query(`
            SELECT disease_activity, last_assessment_date, assessment_confidence
            FROM users 
            WHERE user_id = $1
        `, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const user = result.rows[0];
        
        res.json({
            success: true,
            diseaseActivity: user.disease_activity || 'remission',
            lastAssessment: user.last_assessment_date,
            confidence: user.assessment_confidence || 0.0
        });
        
    } catch (error) {
        console.error('❌ Error getting disease activity status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get disease activity status',
            message: error.message
        });
    }
});

/**
 * GET /api/disease-activity/history/:userId
 * Gets disease activity assessment history
 */
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 30 } = req.query;
        
        const result = await query(`
            SELECT disease_activity, assessment_date, confidence, data_quality, source
            FROM disease_activity_history 
            WHERE user_id = $1 
            ORDER BY assessment_date DESC 
            LIMIT $2
        `, [userId, limit]);
        
        res.json({
            success: true,
            history: result.rows
        });
        
    } catch (error) {
        console.error('❌ Error getting disease activity history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get disease activity history',
            message: error.message
        });
    }
});

// MARK: - Helper Functions

/**
 * Get journal entries from last 30 days for disease activity assessment
 */
async function getLast30DaysJournalEntries(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await query(`
        SELECT 
            entry_id, entry_date, blood_present, mucus_present,
            pain_severity, urgency_level, bowel_frequency, bristol_scale,
            stress_level, fatigue_level, sleep_quality, hydration_level,
            created_at, updated_at
        FROM journal_entries 
        WHERE user_id = $1 
        AND entry_date >= $2
        ORDER BY entry_date DESC
    `, [userId, thirtyDaysAgo]);
    
    return result.rows;
}

/**
 * Get user diagnosis information for fallback
 */
async function getUserDiagnosis(userId) {
    const result = await query(`
        SELECT disease_type, disease_severity, diagnosis_date
        FROM user_diagnosis 
        WHERE user_id = $1
        ORDER BY diagnosis_date DESC
        LIMIT 1
    `, [userId]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * AI-powered disease activity assessment
 * Based on 30-day symptom data with weighted severity scoring
 */
async function assessDiseaseActivityAI(journalEntries, userDiagnosis) {
    
    // If no journal entries, use fallback logic
    if (!journalEntries || journalEntries.length === 0) {
        return getFallbackAssessment(userDiagnosis);
    }
    
    // Calculate weighted symptom scores
    const symptomScores = calculateWeightedSymptomScores(journalEntries);
    
    // Apply AI assessment algorithm
    const diseaseActivity = applyAIAssessmentAlgorithm(symptomScores);
    
    // Calculate confidence and data quality
    const confidence = calculateAssessmentConfidence(journalEntries, symptomScores);
    const dataQuality = calculateDataQuality(journalEntries);
    
    return {
        diseaseActivity,
        confidence,
        dataQuality,
        daysOfData: journalEntries.length,
        assessmentDate: new Date(),
        source: 'ai_assessment'
    };
}

/**
 * Calculate weighted symptom scores based on severity
 */
function calculateWeightedSymptomScores(entries) {
    let totalScore = 0;
    let dayCount = 0;
    
    // Initialize severity weights (evidence-based)
    const weights = {
        criticalSymptoms: 2.0,    // Blood, severe pain
        severeSymptoms: 1.5,      // High pain, urgency
        moderateSymptoms: 1.0,   // Moderate symptoms
        mildSymptoms: 0.5,       // Mild symptoms
        stressFatigue: 0.3,      // Secondary indicators
        sleepQuality: 0.2        // Sleep impact
    };
    
    for (const entry of entries) {
        let dailyScore = 0;
        
        // CRITICAL SYMPTOMS (High weight, immediate impact)
        if (entry.blood_present) {
            dailyScore += weights.criticalSymptoms * 10.0; // Maximum weight for blood
        }
        
        if (entry.mucus_present) {
            dailyScore += weights.criticalSymptoms * 7.0;
        }
        
        // PAIN SEVERITY (Weighted by intensity)
        if (entry.pain_severity !== null) {
            const painWeight = calculatePainWeight(entry.pain_severity, weights);
            dailyScore += painWeight * entry.pain_severity;
        }
        
        // URGENCY LEVEL (Weighted by frequency and intensity)
        if (entry.urgency_level !== null) {
            const urgencyWeight = calculateUrgencyWeight(entry.urgency_level, weights);
            dailyScore += urgencyWeight * entry.urgency_level;
        }
        
        // BOWEL FREQUENCY (Weighted by deviation from normal)
        if (entry.bowel_frequency !== null) {
            const frequencyWeight = calculateBowelFrequencyWeight(entry.bowel_frequency, weights);
            dailyScore += frequencyWeight * entry.bowel_frequency;
        }
        
        // STRESS AND FATIGUE (Secondary indicators)
        if (entry.stress_level !== null) {
            dailyScore += weights.stressFatigue * entry.stress_level * 0.5;
        }
        
        if (entry.fatigue_level !== null) {
            dailyScore += weights.stressFatigue * entry.fatigue_level * 0.5;
        }
        
        // SLEEP QUALITY (Inverse relationship - poor sleep = higher score)
        if (entry.sleep_quality !== null) {
            dailyScore += weights.sleepQuality * (10 - entry.sleep_quality) * 0.3;
        }
        
        totalScore += dailyScore;
        dayCount++;
    }
    
    // Calculate average daily score
    const averageScore = dayCount > 0 ? totalScore / dayCount : 0;
    
    // Apply trend analysis
    const trend = analyzeSymptomTrend(entries);
    const trendAdjustment = calculateTrendAdjustment(trend);
    const adjustedScore = averageScore * trendAdjustment;
    
    return {
        averageDailyScore: adjustedScore,
        totalDays: dayCount,
        trend: trend
    };
}

/**
 * Calculate pain weight based on severity
 */
function calculatePainWeight(painSeverity, weights) {
    if (painSeverity <= 2) return weights.mildSymptoms * 0.5;
    if (painSeverity <= 5) return weights.moderateSymptoms * 1.0;
    if (painSeverity <= 8) return weights.severeSymptoms * 1.5;
    return weights.criticalSymptoms * 2.0;
}

/**
 * Calculate urgency weight based on level
 */
function calculateUrgencyWeight(urgencyLevel, weights) {
    if (urgencyLevel <= 2) return weights.mildSymptoms * 0.3;
    if (urgencyLevel <= 5) return weights.moderateSymptoms * 0.8;
    if (urgencyLevel <= 8) return weights.severeSymptoms * 1.2;
    return weights.criticalSymptoms * 1.8;
}

/**
 * Calculate bowel frequency weight based on deviation from normal
 */
function calculateBowelFrequencyWeight(frequency, weights) {
    const normalRange = [1, 2, 3]; // Normal bowel frequency
    const deviation = Math.abs(frequency - 2); // Deviation from normal (2)
    
    if (normalRange.includes(frequency)) {
        return weights.mildSymptoms * 0.2;
    } else if (deviation <= 2) {
        return weights.moderateSymptoms * 0.5;
    } else {
        return weights.severeSymptoms * 1.0;
    }
}

/**
 * Analyze symptom trend over time
 */
function analyzeSymptomTrend(entries) {
    if (entries.length < 7) return 'stable';
    
    const recentWeek = entries.slice(0, 7);
    const previousWeek = entries.slice(7, 14);
    
    if (previousWeek.length === 0) return 'stable';
    
    const recentAverage = calculateWeekAverage(recentWeek);
    const previousAverage = calculateWeekAverage(previousWeek);
    
    const change = recentAverage - previousAverage;
    
    if (change > 1.0) return 'worsening';
    if (change < -1.0) return 'improving';
    return 'stable';
}

/**
 * Calculate week average score
 */
function calculateWeekAverage(weekEntries) {
    if (weekEntries.length === 0) return 0;
    
    let totalScore = 0;
    const weights = {
        criticalSymptoms: 2.0,
        severeSymptoms: 1.5,
        moderateSymptoms: 1.0,
        mildSymptoms: 0.5,
        stressFatigue: 0.3,
        sleepQuality: 0.2
    };
    
    for (const entry of weekEntries) {
        let dailyScore = 0;
        
        if (entry.blood_present) dailyScore += weights.criticalSymptoms * 10.0;
        if (entry.mucus_present) dailyScore += weights.criticalSymptoms * 7.0;
        if (entry.pain_severity !== null) {
            dailyScore += calculatePainWeight(entry.pain_severity, weights) * entry.pain_severity;
        }
        if (entry.urgency_level !== null) {
            dailyScore += calculateUrgencyWeight(entry.urgency_level, weights) * entry.urgency_level;
        }
        if (entry.stress_level !== null) {
            dailyScore += weights.stressFatigue * entry.stress_level * 0.5;
        }
        if (entry.fatigue_level !== null) {
            dailyScore += weights.stressFatigue * entry.fatigue_level * 0.5;
        }
        if (entry.sleep_quality !== null) {
            dailyScore += weights.sleepQuality * (10 - entry.sleep_quality) * 0.3;
        }
        
        totalScore += dailyScore;
    }
    
    return totalScore / weekEntries.length;
}

/**
 * Calculate trend adjustment factor
 */
function calculateTrendAdjustment(trend) {
    switch (trend) {
        case 'worsening': return 1.2;  // 20% increase for worsening trend
        case 'improving': return 0.8;  // 20% decrease for improving trend
        case 'stable': return 1.0;     // No adjustment for stable trend
        default: return 1.0;
    }
}

/**
 * Apply AI assessment algorithm
 */
function applyAIAssessmentAlgorithm(scores) {
    const averageScore = scores.averageDailyScore;
    
    if (averageScore < 2.0) return 'remission';
    if (averageScore < 5.0) return 'mild';
    if (averageScore < 8.0) return 'moderate';
    return 'severe';
}

/**
 * Calculate assessment confidence
 */
function calculateAssessmentConfidence(entries, scores) {
    const dataCompleteness = calculateDataCompleteness(entries);
    const dataRecency = calculateDataRecency(entries);
    const scoreConsistency = calculateScoreConsistency(entries);
    
    return (dataCompleteness + dataRecency + scoreConsistency) / 3;
}

/**
 * Calculate data completeness score
 */
function calculateDataCompleteness(entries) {
    if (entries.length === 0) return 0;
    
    let completeEntries = 0;
    for (const entry of entries) {
        const hasKeyData = entry.pain_severity !== null || 
                          entry.urgency_level !== null || 
                          entry.bowel_frequency !== null;
        if (hasKeyData) completeEntries++;
    }
    
    return completeEntries / entries.length;
}

/**
 * Calculate data recency score
 */
function calculateDataRecency(entries) {
    if (entries.length === 0) return 0;
    
    const now = new Date();
    const lastEntry = new Date(entries[0].entry_date);
    const daysSinceLastEntry = (now - lastEntry) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastEntry <= 1) return 1.0;
    if (daysSinceLastEntry <= 3) return 0.8;
    if (daysSinceLastEntry <= 7) return 0.6;
    if (daysSinceLastEntry <= 14) return 0.4;
    return 0.2;
}

/**
 * Calculate score consistency
 */
function calculateScoreConsistency(entries) {
    if (entries.length < 3) return 0.5;
    
    const scores = entries.map(entry => {
        let score = 0;
        if (entry.blood_present) score += 10;
        if (entry.mucus_present) score += 7;
        if (entry.pain_severity !== null) score += entry.pain_severity;
        if (entry.urgency_level !== null) score += entry.urgency_level;
        return score;
    });
    
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    return Math.max(0, 1 - (standardDeviation / 10));
}

/**
 * Calculate data quality score
 */
function calculateDataQuality(entries) {
    const completeness = calculateDataCompleteness(entries);
    const recency = calculateDataRecency(entries);
    const consistency = calculateScoreConsistency(entries);
    
    return (completeness + recency + consistency) / 3;
}

/**
 * Get fallback assessment when no data available
 */
function getFallbackAssessment(userDiagnosis) {
    if (userDiagnosis && userDiagnosis.disease_severity) {
        const severity = userDiagnosis.disease_severity.toLowerCase();
        switch (severity) {
            case 'mild': return {
                diseaseActivity: 'mild',
                confidence: 0.3,
                dataQuality: 0.2,
                daysOfData: 0,
                assessmentDate: new Date(),
                source: 'diagnosis_fallback'
            };
            case 'moderate': return {
                diseaseActivity: 'moderate',
                confidence: 0.3,
                dataQuality: 0.2,
                daysOfData: 0,
                assessmentDate: new Date(),
                source: 'diagnosis_fallback'
            };
            case 'severe': return {
                diseaseActivity: 'severe',
                confidence: 0.3,
                dataQuality: 0.2,
                daysOfData: 0,
                assessmentDate: new Date(),
                source: 'diagnosis_fallback'
            };
        }
    }
    
    // Default to healthy/remission
    return {
        diseaseActivity: 'remission',
        confidence: 0.1,
        dataQuality: 0.1,
        daysOfData: 0,
        assessmentDate: new Date(),
        source: 'healthy_default'
    };
}

/**
 * Update user's disease activity in database
 */
async function updateUserDiseaseActivity(userId, assessment) {
    try {
        // Update users table
        await query(`
            UPDATE users 
            SET disease_activity = $1, 
                last_assessment_date = $2, 
                assessment_confidence = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $4
        `, [assessment.diseaseActivity, assessment.assessmentDate, assessment.confidence, userId]);
        
        // Insert into history table
        await query(`
            INSERT INTO disease_activity_history 
            (user_id, disease_activity, assessment_date, confidence, data_quality, source)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [userId, assessment.diseaseActivity, assessment.assessmentDate, assessment.confidence, assessment.dataQuality, assessment.source]);
        
        console.log(`✅ Updated disease activity for user ${userId}: ${assessment.diseaseActivity}`);
        
    } catch (error) {
        console.error('❌ Error updating disease activity:', error);
        throw error;
    }
}

module.exports = router;
