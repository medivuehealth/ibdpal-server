const axios = require('axios');

async function testMealAPI() {
    try {
        console.log('🔍 Testing meal API for aryan.skumar17@gmail.com...\n');
        
        // Test the journal entries API
        const response = await axios.get('https://ibdpal-server-production.up.railway.app/api/journal/entries/aryan.skumar17@gmail.com', {
            params: {
                startDate: '2025-08-23',
                endDate: '2025-08-29'
            }
        });
        
        console.log('✅ API Response Status:', response.status);
        console.log('📊 Number of entries returned:', response.data.length);
        
        if (response.data.length > 0) {
            console.log('\n📋 Sample entry structure:');
            const sampleEntry = response.data[0];
            console.log('Entry ID:', sampleEntry.entry_id);
            console.log('Entry Date:', sampleEntry.entry_date);
            console.log('Meals:', sampleEntry.meals ? sampleEntry.meals.length : 0, 'meals');
            
            if (sampleEntry.meals && sampleEntry.meals.length > 0) {
                console.log('\n🍽️ Meal details:');
                sampleEntry.meals.forEach((meal, index) => {
                    console.log(`  ${index + 1}. ${meal.meal_type}: ${meal.description}`);
                    console.log(`     Calories: ${meal.calories}, Protein: ${meal.protein}g, Carbs: ${meal.carbs}g, Fiber: ${meal.fiber}g, Fat: ${meal.fat}g`);
                });
            } else {
                console.log('❌ No meals found in sample entry');
            }
            
            // Check all entries for meals
            let totalMeals = 0;
            let entriesWithMeals = 0;
            
            response.data.forEach((entry, index) => {
                if (entry.meals && entry.meals.length > 0) {
                    entriesWithMeals++;
                    totalMeals += entry.meals.length;
                    console.log(`\n📅 Entry ${index + 1} (${entry.entry_date}): ${entry.meals.length} meals`);
                    entry.meals.forEach(meal => {
                        console.log(`  - ${meal.meal_type}: ${meal.description} (${meal.calories} cal)`);
                    });
                } else {
                    console.log(`\n📅 Entry ${index + 1} (${entry.entry_date}): No meals`);
                }
            });
            
            console.log(`\n📈 Summary:`);
            console.log(`  Total entries: ${response.data.length}`);
            console.log(`  Entries with meals: ${entriesWithMeals}`);
            console.log(`  Total meals: ${totalMeals}`);
        }
        
    } catch (error) {
        console.error('❌ Error testing meal API:', error.response ? error.response.data : error.message);
    }
}

testMealAPI(); 