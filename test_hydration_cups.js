const axios = require('axios');

async function testHydrationCups() {
    try {
        console.log('🔍 Testing hydration with cups input and liters storage...\n');
        
        // Test data with cups input (will be converted to liters)
        const testData = {
            username: 'aryan.skumar17@gmail.com',
            entry_date: '2025-08-31',
            // Water intake in cups (will be converted to liters)
            water_intake: 8 * 0.236588,  // 8 cups = ~1.89 liters
            other_fluids: 0.5,
            fluid_type: 'Water',
            hydration_level: 8,
            notes: 'Drank 8 cups of water today, feeling well hydrated'
        };
        
        console.log('📤 Sending test data:');
        console.log('  Water intake (cups): 8');
        console.log('  Water intake (liters):', testData.water_intake.toFixed(3));
        console.log('  Other fluids (liters):', testData.other_fluids);
        console.log('  Fluid type:', testData.fluid_type);
        console.log('  Hydration level:', testData.hydration_level);
        
        // Test POST endpoint
        const postResponse = await axios.post('https://ibdpal-server-production.up.railway.app/api/journal/entries', testData);
        
        console.log('\n✅ POST Response Status:', postResponse.status);
        console.log('📊 Entry created with ID:', postResponse.data.entry_id);
        
        // Test GET endpoint to retrieve the data
        const getResponse = await axios.get('https://ibdpal-server-production.up.railway.app/api/journal/entries/aryan.skumar17@gmail.com', {
            params: { date: '2025-08-31' }
        });
        
        console.log('\n✅ GET Response Status:', getResponse.status);
        console.log('📊 Number of entries returned:', getResponse.data.length);
        
        if (getResponse.data.length > 0) {
            const entry = getResponse.data[0];
            console.log('\n📋 Retrieved entry fields:');
            
            // Check hydration fields
            console.log('💧 Water Intake (liters):', entry.water_intake);
            console.log('💧 Water Intake (cups):', Math.round(entry.water_intake * 4.22675));
            console.log('💧 Other Fluids (liters):', entry.other_fluids);
            console.log('💧 Fluid Type:', entry.fluid_type);
            console.log('💧 Hydration Level:', entry.hydration);
            console.log('📝 Notes:', entry.notes);
            
            // Validate conversion
            const expectedCups = 8;
            const actualCups = Math.round(entry.water_intake * 4.22675);
            const conversionAccuracy = Math.abs(expectedCups - actualCups) <= 1; // Allow 1 cup tolerance
            
            console.log('\n✅ Conversion Validation:');
            console.log(`  Expected cups: ${expectedCups}`);
            console.log(`  Actual cups (converted): ${actualCups}`);
            console.log(`  Conversion accurate: ${conversionAccuracy ? '✅ Yes' : '❌ No'}`);
            
            // Show conversion factors
            console.log('\n📊 Conversion Factors:');
            console.log('  1 cup = 0.236588 liters');
            console.log('  1 liter = 4.22675 cups');
        }
        
    } catch (error) {
        console.error('❌ Error testing hydration cups:', error.response ? error.response.data : error.message);
    }
}

testHydrationCups(); 