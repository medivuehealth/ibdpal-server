const axios = require('axios');

async function testStressSleepHydration() {
    try {
        console.log('🔍 Testing stress, sleep, and hydration fields...\n');
        
        // Test data for the new fields
        const testData = {
            username: 'aryan.skumar17@gmail.com',
            entry_date: '2025-08-29',
            // Stress fields
            stress_level: 7,
            stress_source: 'Work deadlines and family responsibilities',
            coping_strategies: 'Deep breathing exercises and taking short walks',
            mood_level: 6,
            // Sleep fields
            sleep_hours: 7,  // Changed from 7.5 to 7 (integer)
            sleep_quality: 8,
            sleep_notes: 'Slept well but woke up once during the night',
            // Hydration fields
            water_intake: 2.5,
            other_fluids: 0.5,
            fluid_type: 'Water',
            hydration_level: 8,
            notes: 'Overall good day, feeling well hydrated'
        };
        
        console.log('📤 Sending test data:', JSON.stringify(testData, null, 2));
        
        // Test POST endpoint
        const postResponse = await axios.post('https://ibdpal-server-production.up.railway.app/api/journal/entries', testData);
        
        console.log('✅ POST Response Status:', postResponse.status);
        console.log('📊 Entry created with ID:', postResponse.data.entry_id);
        
        // Test GET endpoint to retrieve the data
        const getResponse = await axios.get('https://ibdpal-server-production.up.railway.app/api/journal/entries/aryan.skumar17@gmail.com', {
            params: { date: '2025-08-29' }
        });
        
        console.log('\n✅ GET Response Status:', getResponse.status);
        console.log('📊 Number of entries returned:', getResponse.data.length);
        
        if (getResponse.data.length > 0) {
            const entry = getResponse.data[0];
            console.log('\n📋 Retrieved entry fields:');
            
            // Check stress fields
            console.log('😰 Stress Level:', entry.stress_level);
            console.log('😰 Stress Source:', entry.stress_source);
            console.log('😰 Coping Strategies:', entry.coping_strategies);
            console.log('😰 Mood Level:', entry.mood_level);
            
            // Check sleep fields
            console.log('😴 Sleep Hours:', entry.sleep_hours);
            console.log('😴 Sleep Quality:', entry.sleep_quality);
            console.log('😴 Sleep Notes:', entry.sleep_notes);
            
            // Check hydration fields
            console.log('💧 Water Intake:', entry.water_intake);
            console.log('💧 Other Fluids:', entry.other_fluids);
            console.log('💧 Fluid Type:', entry.fluid_type);
            console.log('💧 Hydration Level:', entry.hydration);  // Changed from hydration_level to hydration
            
            console.log('📝 Notes:', entry.notes);
        }
        
    } catch (error) {
        console.error('❌ Error testing stress, sleep, and hydration:', error.response ? error.response.data : error.message);
    }
}

testStressSleepHydration(); 