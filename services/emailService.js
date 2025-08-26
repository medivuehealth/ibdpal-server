const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

// Debug environment variables (same pattern as database)
console.log('Email service config:');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL || 'NOT SET');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
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
    console.log(`📧 SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET'}`);
    console.log(`📧 FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}`);
    console.log(`📧 DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
    
    if (process.env.NODE_ENV === 'production') {
      // Check for SendGrid API key first (preferred method)
      if (process.env.SENDGRID_API_KEY) {
        console.log('📧 Configuring SendGrid email service...');
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
        console.log('📧 SendGrid email service initialized successfully');
        this.initialized = true;
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
      // Always check environment variables at runtime
      console.log('📧 Runtime environment check:');
      console.log(`   SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET'}`);
      console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}`);
      console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
      
      // If not initialized yet, try to initialize
      if (!this.initialized) {
        console.log('📧 Email service not initialized, attempting to initialize...');
        await this.initializeTransporter();
      }
      
      if (!this.transporter) {
        // Fallback to console logging if email service is not available
        console.log(`📧 Verification code for ${email}: ${verificationCode}`);
        console.log(`📧 Email would be sent to: ${email}`);
        return { success: true, message: 'Verification code logged to console' };
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || '"IBDPal" <your-gmail@gmail.com>',
        to: email,
        subject: 'Verify Your IBDPal Account',
        html: this.getVerificationEmailTemplate(verificationCode, firstName),
        text: this.getVerificationEmailText(verificationCode, firstName)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email sent:', info.messageId);
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('📧 Email sending failed:', error);
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
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .code { background: #fff; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #4CAF50; border: 2px solid #4CAF50; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
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
            
            <p>This code will expire in 15 minutes for security reasons.</p>
            
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
}

module.exports = new EmailService(); 