// Test the exact INSERT statement from the server
const testQuery = `
        INSERT INTO journal_entries (
            user_id, entry_date, calories, protein, carbs, fiber,
            has_allergens, meals_per_day, hydration_level, bowel_frequency,
            bristol_scale, urgency_level, blood_present, pain_location,
            pain_severity, pain_time, medication_taken, medication_type,
            dosage_level, sleep_hours, stress_level, fatigue_level, notes,
            menstruation, breakfast, lunch, dinner, snacks,
            breakfast_calories, breakfast_protein, breakfast_carbs, breakfast_fiber, breakfast_fat,
            lunch_calories, lunch_protein, lunch_carbs, lunch_fiber, lunch_fat,
            dinner_calories, dinner_protein, dinner_carbs, dinner_fiber, dinner_fat,
            snack_calories, snack_protein, snack_carbs, snack_fiber, snack_fat
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
                $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48)
        RETURNING entry_id;
    `;

// Extract column names
const columnMatch = testQuery.match(/INSERT INTO journal_entries \(([\s\S]*?)\)/);
if (columnMatch) {
    const columns = columnMatch[1].split(',').map(col => col.trim());
    console.log('📊 Column count:', columns.length);
}

// Extract parameter count
const parameterMatches = testQuery.match(/\$(\d+)/g);
const maxParameter = Math.max(...parameterMatches.map(match => parseInt(match.substring(1))));
console.log(`📊 Parameter count: ${maxParameter}`);

// Create test values array (simulating the server values array)
const testValues = [
    'test-user', '2025-07-20', 0, 0, 0, 0, false, 0, 0, 0, 4, 0, false, 'None', 0, 'None', false, 'None', '0', 0, 0, 0, '', 'not_applicable', '', '', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

console.log(`📊 Values array length: ${testValues.length}`);
console.log(`🔍 Mismatch: ${maxParameter} parameters vs ${testValues.length} values`); 