const axios = require('axios');

async function testLatestMedicationAPI() {
    try {
        console.log('🔍 Testing latest medication API for aryan.skumar17@gmail.com...\n');
        
        // Test the latest medication API
        const response = await axios.get('https://ibdpal-server-production.up.railway.app/api/journal/latest-medication/aryan.skumar17@gmail.com');
        
        console.log('✅ API Response Status:', response.status);
        console.log('📊 Response data:', response.data);
        
        if (response.data.medication_type && response.data.medication_type !== 'None') {
            console.log('\n💊 Found previous medication data:');
            console.log(`  Medication Type: ${response.data.medication_type}`);
            console.log(`  Dosage Level: ${response.data.dosage_level}`);
            console.log(`  Last Taken Date: ${response.data.last_taken_date}`);
            console.log(`  Created At: ${response.data.created_at}`);
        } else {
            console.log('\n💊 No previous medication data found');
        }
        
    } catch (error) {
        console.error('❌ Error testing latest medication API:', error.response ? error.response.data : error.message);
    }
}

testLatestMedicationAPI(); 