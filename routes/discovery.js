const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Get user's journal entries for trend analysis
router.get('/trends/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeframe = 'week' } = req.query;
        
        // Calculate date range based on timeframe
        const now = new Date();
        let startDate;
        
        switch (timeframe) {
            case 'week':
                startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                break;
            case 'month':
                startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                break;
            case 'threeMonths':
                startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
                break;
            default:
                startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        }
        
        // Fetch journal entries
        const entriesResult = await pool.query(`
            SELECT 
                entry_date,
                calories,
                protein,
                carbs,
                fiber,
                hydration_level,
                bowel_frequency,
                bristol_scale,
                urgency_level,
                blood_present,
                pain_severity,
                stress_level,
                fatigue_level,
                medication_taken,
                breakfast,
                lunch,
                dinner,
                snacks
            FROM journal_entries 
            WHERE user_id = $1 
            AND entry_date >= $2
            ORDER BY entry_date ASC
        `, [userId, startDate.toISOString().split('T')[0]]);
        
        if (entriesResult.rows.length === 0) {
            return res.json({
                success: true,
                message: 'No data available for the selected timeframe',
                data: {
                    nutrition: [],
                    symptoms: [],
                    insights: [],
                    summary: {}
                }
            });
        }
        
        const entries = entriesResult.rows;
        
        // Process nutrition trends
        const nutritionData = processNutritionTrends(entries, timeframe);
        
        // Process symptom trends
        const symptomData = processSymptomTrends(entries, timeframe);
        
        // Generate insights
        const insights = generateInsights(entries, nutritionData, symptomData);
        
        // Generate summary statistics
        const summary = generateSummary(entries);
        
        res.json({
            success: true,
            data: {
                nutrition: nutritionData,
                symptoms: symptomData,
                insights: insights,
                summary: summary
            }
        });
        
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trends data',
            error: error.message
        });
    }
});

// Process nutrition trends
function processNutritionTrends(entries, timeframe) {
    const nutritionData = {
        calories: [],
        protein: [],
        fiber: [],
        hydration: []
    };
    
    entries.forEach(entry => {
        const date = new Date(entry.entry_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        nutritionData.calories.push({
            date: date,
            value: entry.calories || 0,
            target: 2000
        });
        
        nutritionData.protein.push({
            date: date,
            value: entry.protein || 0,
            target: 80
        });
        
        nutritionData.fiber.push({
            date: date,
            value: entry.fiber || 0,
            target: 25
        });
        
        nutritionData.hydration.push({
            date: date,
            value: entry.hydration_level || 0,
            target: 2000
        });
    });
    
    return nutritionData;
}

// Process symptom trends
function processSymptomTrends(entries, timeframe) {
    const symptomData = {
        pain: [],
        stress: [],
        fatigue: [],
        bowelFrequency: [],
        flareRisk: []
    };
    
    entries.forEach(entry => {
        const date = new Date(entry.entry_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        symptomData.pain.push({
            date: date,
            value: entry.pain_severity || 0,
            max: 10
        });
        
        symptomData.stress.push({
            date: date,
            value: entry.stress_level || 0,
            max: 10
        });
        
        symptomData.fatigue.push({
            date: date,
            value: entry.fatigue_level || 0,
            max: 10
        });
        
        symptomData.bowelFrequency.push({
            date: date,
            value: entry.bowel_frequency || 0,
            max: 10
        });
        
        // Calculate flare risk based on multiple factors
        const flareRisk = calculateFlareRisk(entry);
        symptomData.flareRisk.push({
            date: date,
            value: flareRisk,
            max: 100
        });
    });
    
    return symptomData;
}

// Calculate flare risk based on symptoms
function calculateFlareRisk(entry) {
    let risk = 0;
    
    // Pain severity (0-10) contributes 30% to risk
    risk += (entry.pain_severity || 0) * 3;
    
    // Blood presence contributes 25% to risk
    if (entry.blood_present) {
        risk += 25;
    }
    
    // High urgency (7-10) contributes 20% to risk
    if (entry.urgency_level >= 7) {
        risk += 20;
    }
    
    // High bowel frequency (4+) contributes 15% to risk
    if (entry.bowel_frequency >= 4) {
        risk += 15;
    }
    
    // Stress level contributes 10% to risk
    risk += (entry.stress_level || 0);
    
    return Math.min(risk, 100); // Cap at 100%
}

// Generate insights based on data
function generateInsights(entries, nutritionData, symptomData) {
    const insights = [];
    
    // Calculate averages
    const avgCalories = entries.reduce((sum, entry) => sum + (entry.calories || 0), 0) / entries.length;
    const avgProtein = entries.reduce((sum, entry) => sum + (entry.protein || 0), 0) / entries.length;
    const avgFiber = entries.reduce((sum, entry) => sum + (entry.fiber || 0), 0) / entries.length;
    const avgPain = entries.reduce((sum, entry) => sum + (entry.pain_severity || 0), 0) / entries.length;
    const avgStress = entries.reduce((sum, entry) => sum + (entry.stress_level || 0), 0) / entries.length;
    
    // Nutrition insights
    if (avgCalories < 1800) {
        insights.push({
            type: 'nutrition',
            category: 'calories',
            message: 'Your calorie intake is below recommended levels for IBD management. Consider increasing portion sizes or adding healthy snacks.',
            severity: 'moderate',
            action: 'Increase calorie intake through healthy foods'
        });
    } else if (avgCalories > 2500) {
        insights.push({
            type: 'nutrition',
            category: 'calories',
            message: 'Your calorie intake is above typical IBD recommendations. Monitor for weight gain and consider portion control.',
            severity: 'low',
            action: 'Monitor portion sizes and weight'
        });
    }
    
    if (avgProtein < 70) {
        insights.push({
            type: 'nutrition',
            category: 'protein',
            message: 'Protein intake is below IBD recommendations. Protein helps with healing and muscle maintenance.',
            severity: 'moderate',
            action: 'Add lean protein sources to meals'
        });
    }
    
    if (avgFiber < 15) {
        insights.push({
            type: 'nutrition',
            category: 'fiber',
            message: 'Fiber intake is very low. Consider adding soluble fiber sources that are gentler on the digestive system.',
            severity: 'high',
            action: 'Gradually increase soluble fiber intake'
        });
    } else if (avgFiber > 35) {
        insights.push({
            type: 'nutrition',
            category: 'fiber',
            message: 'Fiber intake is high. Monitor for digestive symptoms and consider reducing if causing discomfort.',
            severity: 'moderate',
            action: 'Monitor fiber tolerance and reduce if needed'
        });
    }
    
    // Symptom insights
    if (avgPain > 5) {
        insights.push({
            type: 'symptom',
            category: 'pain',
            message: 'Average pain levels are elevated. Consider discussing pain management strategies with your healthcare provider.',
            severity: 'high',
            action: 'Consult healthcare provider about pain management'
        });
    }
    
    if (avgStress > 7) {
        insights.push({
            type: 'symptom',
            category: 'stress',
            message: 'Stress levels are high, which can impact IBD symptoms. Consider stress management techniques.',
            severity: 'moderate',
            action: 'Practice stress management techniques'
        });
    }
    
    // Medication adherence
    const medicationTaken = entries.filter(entry => entry.medication_taken).length;
    const adherenceRate = (medicationTaken / entries.length) * 100;
    
    if (adherenceRate < 80) {
        insights.push({
            type: 'medication',
            category: 'adherence',
            message: `Medication adherence is ${Math.round(adherenceRate)}%. Consistent medication is crucial for IBD management.`,
            severity: 'high',
            action: 'Set medication reminders and improve adherence'
        });
    }
    
    return insights;
}

// Generate summary statistics
function generateSummary(entries) {
    const totalEntries = entries.length;
    const avgCalories = Math.round(entries.reduce((sum, entry) => sum + (entry.calories || 0), 0) / totalEntries);
    const avgPain = Math.round(entries.reduce((sum, entry) => sum + (entry.pain_severity || 0), 0) / totalEntries * 10) / 10;
    const bloodEpisodes = entries.filter(entry => entry.blood_present).length;
    const medicationAdherence = Math.round((entries.filter(entry => entry.medication_taken).length / totalEntries) * 100);
    
    return {
        totalEntries,
        avgCalories,
        avgPain,
        bloodEpisodes,
        medicationAdherence,
        dateRange: {
            start: entries[0]?.entry_date,
            end: entries[entries.length - 1]?.entry_date
        }
    };
}

module.exports = router; 