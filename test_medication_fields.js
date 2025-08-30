const axios = require('axios');

async function testMedicationFields() {
    try {
        console.log('🔍 Testing medication fields in journal entries API...\n');
        
        // Test the journal entries API for August 28
        const response = await axios.get('https://ibdpal-server-production.up.railway.app/api/journal/entries/aryan.skumar17@gmail.com', {
            params: {
                date: '2025-08-28'
            }
        });
        
        console.log('✅ API Response Status:', response.status);
        console.log('📊 Number of entries returned:', response.data.length);
        
        if (response.data.length > 0) {
            console.log('\n📋 Sample entry fields:');
            const sampleEntry = response.data[0];
            
            // Check all medication-related fields
            const medicationFields = [
                'medication_taken',
                'medication_type', 
                'dosage_level',
                'last_taken_date'
            ];
            
            medicationFields.forEach(field => {
                console.log(`  ${field}: ${sampleEntry[field] ?? 'undefined'}`);
            });
            
            // Check all entry fields
            console.log('\n📋 All entry fields:');
            Object.keys(sampleEntry).forEach(key => {
                console.log(`  ${key}: ${sampleEntry[key]}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error testing medication fields:', error.response ? error.response.data : error.message);
    }
}

testMedicationFields(); 