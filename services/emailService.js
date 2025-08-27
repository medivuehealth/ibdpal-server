const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

// 🔍 VERSION TRACKING
const EMAIL_SERVICE_VERSION = 'v2.1.0-fixed-fromEmail-' + Date.now();
console.log('🔍 EMAIL SERVICE VERSION:', EMAIL_SERVICE_VERSION);
console.log('🔍 EMAIL SERVICE FILE PATH:', __filename);

// Debug ALL environment variables to understand Railway's behavior
console.log('🔍 ALL Environment Variables Debug:');
console.log('=' .repeat(50));
Object.keys(process.env).forEach(key => {
  if (key.includes('EMAIL') || key.includes('MAIL') || key.includes('SENDGRID') || key.includes('DATABASE') || key.includes('NODE_ENV')) {
    const value = process.env[key];
    if (value) {
      console.log(`   ✅ ${key}: SET (${value.length} chars)`);
    } else {
      console.log(`   ❌ ${key}: NOT SET`);
    }
  }
});
console.log('=' .repeat(50));

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.hasSendGridCredentials = false;
    // Initialize transporter asynchronously to avoid blocking startup
    this.initializeTransporter().catch(error => {
      console.error('📧 Email service initialization failed:', error.message);
      console.log('📧 Email service will fall back to console logging');
    });
  }

  async initializeTransporter() {
    // For development/testing, we'll use a test account
    // In production, you should use a real email service like SendGrid, Mailgun, or AWS SES
    
    console.log('📧 Initializing email service...');
    console.log(`📧 NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`📧 EMAIL_SERVICE_KEY: ${process.env.EMAIL_SERVICE_KEY ? 'SET' : 'NOT SET'}`);
    console.log(`📧 EMAIL_SENDER: ${process.env.EMAIL_SENDER || 'NOT SET'}`);
    console.log(`📧 DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
    
    if (process.env.NODE_ENV === 'production') {
      // Check for SendGrid API key first (preferred method)
      // Try multiple possible variable names for SendGrid (non-sensitive)
      const sendgridKey = process.env.EMAIL_SERVICE_KEY || process.env.MAIL_SERVICE_KEY || process.env.EMAIL_PROVIDER_KEY || process.env.SENDGRID_API_KEY;
      const fromEmail = process.env.EMAIL_SENDER || process.env.MAIL_SENDER || process.env.SENDER_EMAIL || process.env.FROM_EMAIL;
      
                   if (sendgridKey) {
               console.log('📧 Configuring SendGrid email service...');
               this.hasSendGridCredentials = true;
               
               // Use API as default, SMTP as fallback
               console.log('📧 Using SendGrid API as primary method...');
               this.transporter = null; // No SMTP transporter needed for API
               this.initialized = true;
               console.log('✅ SendGrid API configured successfully');
             }
      // Fallback to SMTP credentials if SendGrid not configured
      else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log('📧 Configuring SMTP email service...');
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        console.log('📧 SMTP email service initialized');
        this.initialized = true;
      } else {
        console.log('📧 No email credentials provided, using console logging fallback');
      }
    } else {
      // Development: Use Ethereal Email (fake SMTP for testing)
      console.log('📧 Configuring development email service...');
      await this.createTestAccount();
    }
  }

  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📧 Test email account created:', testAccount.user);
    } catch (error) {
      console.error('Failed to create test email account:', error);
      // Fallback to console logging
      this.transporter = null;
    }
  }

  async sendVerificationEmail(email, verificationCode, firstName = 'User') {
    try {
      // 🔍 COMPREHENSIVE DEBUGGING: Track method execution
      console.log('🔍 COMPREHENSIVE DEBUGGING START');
      console.log('   Method: sendVerificationEmail');
      console.log('   File: services/emailService.js');
      console.log('   Timestamp:', new Date().toISOString());
      console.log('   Parameters:', { email, verificationCode, firstName });
      
      // Always check environment variables at runtime
      console.log('📧 Runtime environment check:');
      console.log(`   EMAIL_SERVICE_KEY: ${process.env.EMAIL_SERVICE_KEY ? 'SET' : 'NOT SET'}`);
      console.log(`   EMAIL_SENDER: ${process.env.EMAIL_SENDER || 'NOT SET'}`);
      console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
      
      // Test if Railway secret variables are accessible
      console.log('🔍 Testing Railway secret variables:');
      const testVars = ['EMAIL_SERVICE_KEY', 'EMAIL_SENDER', 'DATABASE_URL', 'JWT_SECRET'];
      testVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
          console.log(`   ✅ ${varName}: Available (${value.length} chars)`);
        } else {
          console.log(`   ❌ ${varName}: Not available`);
        }
      });
      
      // If not initialized yet, try to initialize
      if (!this.initialized) {
        console.log('📧 Email service not initialized, attempting to initialize...');
        await this.initializeTransporter();
      }
      
      if (!this.transporter && !this.hasSendGridCredentials) {
        // Only fallback to console logging if no SendGrid credentials
        console.log(`📧 Verification code for ${email}: ${verificationCode}`);
        console.log(`📧 Email would be sent to: ${email}`);
        return { success: true, message: 'Verification code logged to console' };
      }

      // 🔍 COMPREHENSIVE DEBUGGING: Track fromEmail variable
      console.log('🔍 DEBUGGING fromEmail variable:');
      console.log('   Step 1: Checking environment variables...');
      console.log(`   EMAIL_SENDER: ${process.env.EMAIL_SENDER || 'NOT SET'}`);
      console.log(`   MAIL_SENDER: ${process.env.MAIL_SENDER || 'NOT SET'}`);
      console.log(`   SENDER_EMAIL: ${process.env.SENDER_EMAIL || 'NOT SET'}`);
      console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}`);
      
      console.log('   Step 2: Defining fromEmail variable...');
      const fromEmail = process.env.EMAIL_SENDER || process.env.MAIL_SENDER || process.env.SENDER_EMAIL || process.env.FROM_EMAIL;
      console.log(`   fromEmail value: ${fromEmail || 'UNDEFINED'}`);
      console.log(`   fromEmail type: ${typeof fromEmail}`);
      console.log(`   fromEmail length: ${fromEmail ? fromEmail.length : 'N/A'}`);
      
      console.log('   Step 3: Creating mailOptions...');
      const mailOptions = {
        from: fromEmail || '"IBDPal" <your-gmail@gmail.com>',
        to: email,
        subject: 'Verify Your IBDPal Account',
        html: this.getVerificationEmailTemplate(verificationCode, firstName),
        text: this.getVerificationEmailText(verificationCode, firstName)
      };
      console.log(`   mailOptions.from: ${mailOptions.from}`);
      console.log('   Step 4: MailOptions created successfully');
      
      console.log('   Step 5: About to send email via transporter...');
      console.log(`   Transporter exists: ${this.transporter ? 'YES' : 'NO'}`);
      console.log(`   Transporter type: ${this.transporter ? typeof this.transporter : 'N/A'}`);
      
      console.log('   Step 5.5: Attempting to send email...');
      
      // Use API as default, SMTP as fallback
      if (this.hasSendGridCredentials) {
        console.log('   Step 5.6: Using SendGrid API as primary method...');
        try {
          const result = await this.sendViaSendGridAPI(email, verificationCode, firstName, fromEmail);
          console.log('   Step 6: Email sent successfully via API!');
          return result;
        } catch (apiError) {
          console.error('   Step 5.6 ERROR: API failed, trying SMTP fallback...');
          console.error('   API Error:', apiError.message);
          
          // Try SMTP as fallback
          if (this.transporter) {
            console.log('   Step 5.7: Using SMTP fallback...');
            try {
              const sendPromise = this.transporter.sendMail(mailOptions);
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('SendGrid SMTP timeout after 10 seconds')), 10000);
              });
              
              console.log('   Step 5.8: Waiting for SMTP response...');
              const info = await Promise.race([sendPromise, timeoutPromise]);
              
              console.log('   Step 6: Email sent successfully via SMTP fallback!');
              console.log(`   Message ID: ${info.messageId}`);
              return { success: true, messageId: info.messageId };
            } catch (smtpError) {
              console.error('   Step 5.7 ERROR: SMTP fallback also failed');
              console.error('   SMTP Error:', smtpError.message);
              throw smtpError;
            }
          } else {
            throw apiError; // No SMTP fallback available
          }
        }
      } else {
        // No SendGrid credentials, use console logging
        console.log(`📧 Verification code for ${email}: ${verificationCode}`);
        console.log(`📧 Email would be sent to: ${email}`);
        return { success: true, message: 'Verification code logged to console' };
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email sent:', info.messageId);
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      console.log('🔍 COMPREHENSIVE DEBUGGING END: Success');
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('🔍 COMPREHENSIVE DEBUGGING END: Error');
      console.error('📧 Email sending failed:', error);
      console.error('📧 Error stack:', error.stack);
      // Fallback to console logging
      console.log(`📧 Verification code for ${email}: ${verificationCode}`);
      return { success: false, error: error.message };
    }
  }

  getVerificationEmailTemplate(verificationCode, firstName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your IBDPal Account</title>
        <meta name="description" content="Complete your IBDPal account verification">
        <meta name="author" content="IBDPal Team">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .code { background: #fff; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #4CAF50; border: 2px solid #4CAF50; border-radius: 5px; margin: 20px 0; letter-spacing: 2px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f5f5f5; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .code { font-size: 20px !important; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>IBDPal Account Verification</h1>
          </div>
          <div class="content">
            <p>Hello ${firstName},</p>
            <p>Thank you for registering with IBDPal! To complete your registration, please use the verification code below:</p>
            
            <div class="code">${verificationCode}</div>
            
            <p><strong>This code will expire in 15 minutes for security reasons.</strong></p>
            
            <p>If you're having trouble with the code, you can also:</p>
            <ul>
              <li>Copy and paste the code directly</li>
              <li>Request a new code if this one expires</li>
              <li>Check your spam folder if you don't see this email</li>
            </ul>
            
            <div class="warning">
              <strong>Important:</strong> This app is for educational purposes only and should not be used as medical advice. 
              The developers are not liable for any medical decisions made based on this app.
            </div>
            
            <p>If you didn't create an account with IBDPal, please ignore this email.</p>
            
            <p>Best regards,<br>The IBDPal Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>IBDPal - Educational IBD Management Tool</p>
            <p>© 2025 IBDPal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getVerificationEmailText(verificationCode, firstName) {
    return `
IBDPal Account Verification

Hello ${firstName},

Thank you for registering with IBDPal! To complete your registration, please use the verification code below:

${verificationCode}

This code will expire in 15 minutes for security reasons.

Important: This app is for educational purposes only and should not be used as medical advice. The developers are not liable for any medical decisions made based on this app.

If you didn't create an account with IBDPal, please ignore this email.

Best regards,
The IBDPal Team

---
This is an automated message. Please do not reply to this email.
IBDPal - Educational IBD Management Tool
    `;
  }

  async sendViaSendGridAPI(email, verificationCode, firstName, fromEmail) {
    const https = require('https');
    const sendgridKey = process.env.EMAIL_SERVICE_KEY || process.env.SENDGRID_API_KEY;
    
    const emailData = {
      personalizations: [{
        to: [{ email: email }],
        subject: 'Verify Your IBDPal Account'
      }],
      from: { email: fromEmail, name: 'IBDPal' },
      content: [{
        type: 'text/html',
        value: this.getVerificationEmailTemplate(verificationCode, firstName)
      }],
      // Add headers to improve deliverability and reduce spam
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'IBDPal/1.0',
        'List-Unsubscribe': '<mailto:unsubscribe@ibdpal.com>',
        'Precedence': 'bulk'
      },
      // Add categories for better tracking
      categories: ['verification', 'account-creation'],
      // Add custom arguments
      customArgs: {
        'email_type': 'verification',
        'user_type': 'new_user'
      }
    };

    const postData = JSON.stringify(emailData);
    
    const options = {
      hostname: 'api.sendgrid.com',
      port: 443,
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 202) {
            console.log('✅ SendGrid API email sent successfully');
            resolve({ success: true, messageId: `api-${Date.now()}` });
          } else {
            console.error('❌ SendGrid API error:', res.statusCode, data);
            reject(new Error(`SendGrid API error: ${res.statusCode} - ${data}`));
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ SendGrid API request error:', error.message);
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        console.log('❌ SendGrid API timeout');
        req.destroy();
        reject(new Error('SendGrid API timeout'));
      });
      
      req.write(postData);
      req.end();
    });
  }
}

module.exports = new EmailService(); 