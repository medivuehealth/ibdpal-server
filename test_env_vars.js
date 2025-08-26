console.log('🧪 Testing Environment Variables');
console.log('=' .repeat(50));

// Test all relevant environment variables
const envVars = [
  'NODE_ENV',
  'SENDGRID_API_KEY',
  'FROM_EMAIL',
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Show first few characters for sensitive variables
    if (varName.includes('KEY') || varName.includes('SECRET') || varName.includes('PASSWORD')) {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('\n📋 Summary:');
console.log(`Total variables checked: ${envVars.length}`);
console.log(`Variables set: ${envVars.filter(v => process.env[v]).length}`);
console.log(`Variables missing: ${envVars.filter(v => !process.env[v]).length}`);

if (!process.env.SENDGRID_API_KEY) {
  console.log('\n🚨 CRITICAL: SENDGRID_API_KEY is not set!');
  console.log('Please check Railway environment variables.');
} else {
  console.log('\n✅ SENDGRID_API_KEY is available');
} 