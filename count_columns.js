// Count columns in INSERT statement
const columns = [
    'user_id', 'entry_date', 'calories', 'protein', 'carbs', 'fiber',
    'has_allergens', 'meals_per_day', 'hydration_level', 'bowel_frequency',
    'bristol_scale', 'urgency_level', 'blood_present', 'pain_location',
    'pain_severity', 'pain_time', 'medication_taken', 'medication_type',
    'dosage_level', 'sleep_hours', 'stress_level', 'fatigue_level', 'notes',
    'menstruation', 'breakfast', 'lunch', 'dinner', 'snacks',
    'breakfast_calories', 'breakfast_protein', 'breakfast_carbs', 'breakfast_fiber', 'breakfast_fat',
    'lunch_calories', 'lunch_protein', 'lunch_carbs', 'lunch_fiber', 'lunch_fat',
    'dinner_calories', 'dinner_protein', 'dinner_carbs', 'dinner_fiber', 'dinner_fat',
    'snack_calories', 'snack_protein', 'snack_carbs', 'snack_fiber', 'snack_fat'
];

console.log('Number of columns:', columns.length);
console.log('Columns:', columns);

// Count values array
const values = [
    'userId', 'entry_date', 'calories', 'protein', 'carbs', 'fiber',
    'has_allergens', 'meals_per_day', 'hydration_level', 'bowel_frequency',
    'bristol_scale', 'urgency_level', 'blood_present', 'pain_location',
    'pain_severity', 'pain_time', 'medication_taken', 'medication_type',
    'dosage_level', 'sleep_hours', 'stress_level', 'fatigue_level', 'notes',
    'menstruation', 'breakfast', 'lunch', 'dinner', 'snacks',
    'breakfast_calories', 'breakfast_protein', 'breakfast_carbs', 'breakfast_fiber', 'breakfast_fat',
    'lunch_calories', 'lunch_protein', 'lunch_carbs', 'lunch_fiber', 'lunch_fat',
    'dinner_calories', 'dinner_protein', 'dinner_carbs', 'dinner_fiber', 'dinner_fat',
    'snack_calories', 'snack_protein', 'snack_carbs', 'snack_fiber', 'snack_fat'
];

console.log('\nNumber of values:', values.length);
console.log('Values:', values);

console.log('\nMatch:', columns.length === values.length ? '✅' : '❌'); 