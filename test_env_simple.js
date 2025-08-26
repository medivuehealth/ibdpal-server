console.log('🧪 Simple Environment Test');
console.log('=' .repeat(50));

// Test environment variables without exposing values
const envVars = {
  'NODE_ENV': process.env.NODE_ENV,
  'SENDGRID_API_KEY': process.env.SENDGRID_API_KEY,
  'FROM_EMAIL': process.env.FROM_EMAIL,
  'DATABASE_URL': process.env.DATABASE_URL,
  'PORT': process.env.PORT
};

console.log('📋 Environment Variables Status:');
Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    console.log(`   ✅ ${key}: SET (${value.length} characters)`);
  } else {
    console.log(`   ❌ ${key}: NOT SET`);
  }
});

console.log('\n📊 Summary:');
const setCount = Object.values(envVars).filter(v => v).length;
const totalCount = Object.keys(envVars).length;
console.log(`   Set: ${setCount}/${totalCount}`);
console.log(`   Missing: ${totalCount - setCount}/${totalCount}`);

if (!process.env.SENDGRID_API_KEY) {
  console.log('\n🚨 Issue: SENDGRID_API_KEY is not available');
  console.log('   This means Railway environment variables are not being loaded.');
} else {
  console.log('\n✅ SENDGRID_API_KEY is available');
} 