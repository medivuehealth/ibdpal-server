const axios = require('axios');

async function testStressMoodScale() {
    try {
        console.log('🔍 Testing new 1-5 scale for stress and mood...\n');
        
        // Test data with new 1-5 scale
        const testData = {
            username: 'aryan.skumar17@gmail.com',
            entry_date: '2025-08-30',
            // Stress fields with 1-5 scale
            stress_level: 4,  // High stress
            stress_source: 'Work presentation and tight deadlines',
            coping_strategies: 'Meditation and exercise',
            mood_level: 2,    // Sad mood
            // Sleep fields
            sleep_hours: 6,
            sleep_quality: 7,
            sleep_notes: 'Had trouble falling asleep due to stress',
            // Hydration fields
            water_intake: 2.0,
            other_fluids: 0.3,
            fluid_type: 'Water',
            hydration_level: 7,
            notes: 'Stressful day but managed to stay hydrated'
        };
        
        console.log('📤 Sending test data with 1-5 scale:', JSON.stringify(testData, null, 2));
        
        // Test POST endpoint
        const postResponse = await axios.post('https://ibdpal-server-production.up.railway.app/api/journal/entries', testData);
        
        console.log('✅ POST Response Status:', postResponse.status);
        console.log('📊 Entry created with ID:', postResponse.data.entry_id);
        
        // Test GET endpoint to retrieve the data
        const getResponse = await axios.get('https://ibdpal-server-production.up.railway.app/api/journal/entries/aryan.skumar17@gmail.com', {
            params: { date: '2025-08-30' }
        });
        
        console.log('\n✅ GET Response Status:', getResponse.status);
        console.log('📊 Number of entries returned:', getResponse.data.length);
        
        if (getResponse.data.length > 0) {
            const entry = getResponse.data[0];
            console.log('\n📋 Retrieved entry fields:');
            
            // Check stress fields with 1-5 scale
            console.log('😰 Stress Level (1-5):', entry.stress_level);
            console.log('😰 Stress Source:', entry.stress_source);
            console.log('😰 Coping Strategies:', entry.coping_strategies);
            console.log('😰 Mood Level (1-5):', entry.mood_level);
            
            // Check sleep fields
            console.log('😴 Sleep Hours:', entry.sleep_hours);
            console.log('😴 Sleep Quality:', entry.sleep_quality);
            console.log('😴 Sleep Notes:', entry.sleep_notes);
            
            // Check hydration fields
            console.log('💧 Water Intake:', entry.water_intake);
            console.log('💧 Other Fluids:', entry.other_fluids);
            console.log('💧 Fluid Type:', entry.fluid_type);
            console.log('💧 Hydration Level:', entry.hydration);
            
            console.log('📝 Notes:', entry.notes);
            
            // Validate the 1-5 scale
            console.log('\n✅ Scale Validation:');
            console.log(`  Stress Level (${entry.stress_level}): ${entry.stress_level >= 1 && entry.stress_level <= 5 ? '✅ Valid' : '❌ Invalid'}`);
            console.log(`  Mood Level (${entry.mood_level}): ${entry.mood_level >= 1 && entry.mood_level <= 5 ? '✅ Valid' : '❌ Invalid'}`);
        }
        
    } catch (error) {
        console.error('❌ Error testing stress and mood scale:', error.response ? error.response.data : error.message);
    }
}

testStressMoodScale(); 