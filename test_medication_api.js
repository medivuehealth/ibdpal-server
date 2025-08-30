const axios = require('axios');

async function testMedicationAPI() {
    try {
        console.log('🔍 Testing medication API for aryan.skumar17@gmail.com...\n');
        
        // Test the journal entries API for August 28
        const response = await axios.get('https://ibdpal-server-production.up.railway.app/api/journal/entries/aryan.skumar17@gmail.com', {
            params: {
                date: '2025-08-28'
            }
        });
        
        console.log('✅ API Response Status:', response.status);
        console.log('📊 Number of entries returned:', response.data.length);
        
        if (response.data.length > 0) {
            console.log('\n📋 Sample entry structure:');
            const sampleEntry = response.data[0];
            console.log('Entry ID:', sampleEntry.entry_id);
            console.log('Entry Date:', sampleEntry.entry_date);
            
            // Check medication fields
            console.log('\n💊 Medication data:');
            console.log('  medication_taken:', sampleEntry.medication_taken);
            console.log('  medication_type:', sampleEntry.medication_type);
            console.log('  dosage_level:', sampleEntry.dosage_level);
            console.log('  last_taken_date:', sampleEntry.last_taken_date);
            
            // Check all entries for medication data
            response.data.forEach((entry, index) => {
                console.log(`\n📅 Entry ${index + 1} (${entry.entry_date}):`);
                console.log(`  Medication taken: ${entry.medication_taken}`);
                console.log(`  Medication type: ${entry.medication_type}`);
                console.log(`  Dosage level: ${entry.dosage_level}`);
                console.log(`  Last taken date: ${entry.last_taken_date}`);
                
                if (entry.medication_taken || entry.medication_type !== 'None') {
                    console.log(`  ✅ Has medication data`);
                } else {
                    console.log(`  ❌ No medication data`);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error testing medication API:', error.response ? error.response.data : error.message);
    }
}

testMedicationAPI(); 