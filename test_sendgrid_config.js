const emailService = require('./services/emailService');

async function testSendGridConfig() {
  console.log('🧪 Testing SendGrid Configuration...');
  console.log('=' .repeat(50));
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET'}`);
  console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}`);
  
  console.log('\n📧 Testing Email Service...');
  
  try {
    // Wait for transporter to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const result = await emailService.sendVerificationEmail(
      'test@example.com', 
      '123456', 
      'Test User'
    );
    
    console.log('📊 Email Service Result:', result);
    
    if (result.success) {
      if (result.messageId) {
        console.log('✅ SendGrid is working! Email sent successfully.');
        console.log(`📧 Message ID: ${result.messageId}`);
      } else {
        console.log('⚠️  Email service is using console logging fallback.');
        console.log('🔧 This means SendGrid API key is not configured.');
      }
    } else {
      console.log('❌ Email service failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSendGridConfig(); 