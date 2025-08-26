const nodemailer = require('nodemailer');

async function testSendGridDirect() {
  console.log('🧪 Direct SendGrid Test');
  console.log('=' .repeat(50));
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET'}`);
  console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}`);
  
  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SENDGRID_API_KEY not found in environment variables');
    return;
  }
  
  try {
    console.log('\n📧 Creating SendGrid transporter...');
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
    
    console.log('✅ SendGrid transporter created');
    
    // Test the connection
    console.log('\n🔗 Testing SendGrid connection...');
    await transporter.verify();
    console.log('✅ SendGrid connection verified');
    
    // Send a test email
    console.log('\n📧 Sending test email...');
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'kumar2507@gmail.com',
      to: 'kumar2507@gmail.com',
      subject: 'SendGrid Test Email',
      text: 'This is a test email from SendGrid to verify the configuration is working.',
      html: '<h1>SendGrid Test</h1><p>This is a test email from SendGrid to verify the configuration is working.</p>'
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Response: ${info.response}`);
    
  } catch (error) {
    console.error('❌ SendGrid test failed:', error.message);
    console.error('Error details:', error);
  }
}

testSendGridDirect(); 