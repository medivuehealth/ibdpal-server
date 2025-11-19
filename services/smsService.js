const https = require('https');

// SMS Service for sending verification codes via Twilio
// Supports Twilio API for sending SMS messages

class SMSService {
  constructor() {
    this.initialized = false;
    this.hasTwilioCredentials = false;
    this.accountSid = null;
    this.authToken = null;
    this.fromNumber = null;
    this.initializeService();
  }

  initializeService() {
    console.log('📱 Initializing SMS service...');
    console.log(`📱 NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Check for Twilio credentials
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.SMS_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN || process.env.SMS_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.SMS_FROM_NUMBER;
    
    console.log(`📱 TWILIO_ACCOUNT_SID: ${this.accountSid ? 'SET' : 'NOT SET'}`);
    console.log(`📱 TWILIO_AUTH_TOKEN: ${this.authToken ? 'SET' : 'NOT SET'}`);
    console.log(`📱 TWILIO_PHONE_NUMBER: ${this.fromNumber || 'NOT SET'}`);
    
    if (this.accountSid && this.authToken && this.fromNumber) {
      this.hasTwilioCredentials = true;
      this.initialized = true;
      console.log('✅ Twilio SMS service configured successfully');
    } else {
      console.log('📱 No SMS credentials provided, using console logging fallback');
      this.initialized = true; // Mark as initialized even without credentials
    }
  }

  /**
   * Format phone number to E.164 format (required by Twilio)
   * @param {string} phoneNumber - Phone number in any format
   * @returns {string} - Formatted phone number in E.164 format
   */
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 1 and has 11 digits, it's already US format
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    // If it has 10 digits, assume US number and add +1
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    // If it already starts with +, return as is (assuming it's already formatted)
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // Otherwise, try to add + if missing
    if (cleaned.length >= 10) {
      return `+${cleaned}`;
    }
    
    return phoneNumber; // Return original if we can't format it
  }

  /**
   * Send verification code via SMS
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} verificationCode - 6-digit verification code
   * @param {string} firstName - User's first name
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  async sendVerificationSMS(phoneNumber, verificationCode, firstName = 'User') {
    try {
      console.log('📱 SMS verification requested');
      console.log('   Method: sendVerificationSMS');
      console.log('   Parameters:', { phoneNumber, verificationCode, firstName });
      
      if (!this.initialized) {
        this.initializeService();
      }
      
      if (!this.hasTwilioCredentials) {
        console.log(`📱 Verification code for ${phoneNumber}: ${verificationCode}`);
        console.log(`📱 SMS would be sent to: ${phoneNumber}`);
        return { 
          success: true, 
          message: 'Verification code logged to console',
          code: verificationCode // Return code for testing
        };
      }

      // Validate phone number
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      console.log(`📱 Formatted phone number: ${formattedPhone}`);

      // Create SMS message
      const message = `Your IBDPal verification code is: ${verificationCode}\n\nThis code will expire in 15 minutes.\n\nIf you didn't create an account, please ignore this message.`;

      // Send via Twilio API
      const result = await this.sendViaTwilioAPI(formattedPhone, message);
      
      console.log('✅ SMS sent successfully');
      return result;
    } catch (error) {
      console.error('📱 SMS sending failed:', error);
      console.log(`📱 Verification code for ${phoneNumber}: ${verificationCode}`);
      return { 
        success: false, 
        error: error.message,
        code: verificationCode // Return code for fallback
      };
    }
  }

  /**
   * Send SMS via Twilio API
   * @param {string} to - Recipient phone number (E.164 format)
   * @param {string} message - Message text
   * @returns {Promise<{success: boolean, messageId?: string}>}
   */
  async sendViaTwilioAPI(to, message) {
    return new Promise((resolve, reject) => {
      // Validate required parameters
      if (!this.accountSid || !this.authToken || !this.fromNumber) {
        reject(new Error('Twilio credentials are not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER'));
        return;
      }

      if (!to) {
        reject(new Error('Recipient phone number is required'));
        return;
      }

      // Create basic auth header
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      // Create request body
      const params = new URLSearchParams({
        To: to,
        From: this.fromNumber,
        Body: message
      });

      const postData = params.toString();
      
      const options = {
        hostname: 'api.twilio.com',
        port: 443,
        path: `/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const response = JSON.parse(data);
              console.log('✅ Twilio API SMS sent successfully');
              console.log(`📱 Message SID: ${response.sid}`);
              resolve({ 
                success: true, 
                messageId: response.sid 
              });
            } catch (parseError) {
              console.error('❌ Failed to parse Twilio response:', parseError);
              reject(new Error('Failed to parse Twilio API response'));
            }
          } else {
            console.error('❌ Twilio API error:', res.statusCode, data);
            try {
              const errorResponse = JSON.parse(data);
              reject(new Error(`Twilio API error: ${res.statusCode} - ${errorResponse.message || data}`));
            } catch (parseError) {
              reject(new Error(`Twilio API error: ${res.statusCode} - ${data}`));
            }
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Twilio API request error:', error.message);
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        console.log('❌ Twilio API timeout');
        req.destroy();
        reject(new Error('Twilio API timeout'));
      });
      
      req.write(postData);
      req.end();
    });
  }
}

module.exports = new SMSService();

