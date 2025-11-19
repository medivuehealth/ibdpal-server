const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Please enter a valid email address'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required').custom((value) => {
    // Basic phone number validation - accepts various formats
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/;
    if (!phoneRegex.test(value)) {
      throw new Error('Please enter a valid phone number');
    }
    return true;
  }),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('confirmPassword').notEmpty().withMessage('Password confirmation is required').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  body('firstName').notEmpty().withMessage('First name is required').trim().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('lastName').notEmpty().withMessage('Last name is required').trim().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('agreeToTerms').notEmpty().withMessage('Terms agreement is required').isBoolean().custom((value) => {
    if (!value) {
      throw new Error('You must agree to the terms of use, privacy policy, and disclaimer');
    }
    return true;
  })
];

const validateLogin = [
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

// Custom validation middleware to format error messages
const formatValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      error: 'Validation failed',
      message: firstError.msg,
      details: errors.array()
    });
  }
  next();
};

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, phoneNumber, password, firstName, lastName, agreeToTerms } = req.body;

    // Format phone number for storage
    const formattedPhone = smsService.formatPhoneNumber(phoneNumber);

    // Check if user already exists by email or phone
    const existingUser = await db.query(
      'SELECT user_id FROM users WHERE email = $1 OR phone_number = $2',
      [email, formattedPhone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email address or phone number already exists'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Create user with SMS verification
    const newUser = await db.query(
      `INSERT INTO users (
        user_id, 
        email, 
        phone_number,
        password_hash, 
        first_name, 
        last_name,
        username,
        pseudonymized_id,
        account_status,
        email_verified,
        verification_code,
        verification_code_expires
      )
       VALUES (
        gen_random_uuid()::text, 
        $1, 
        $2,
        $3, 
        $4, 
        $5,
        $1,
        generate_pseudonymized_id(),
        'pending_verification',
        FALSE,
        $6,
        $7
      )
       RETURNING user_id, email, phone_number, first_name, last_name, pseudonymized_id, created_at`,
      [email, formattedPhone, passwordHash, firstName, lastName, verificationCode, verificationExpires]
    );

    const user = newUser.rows[0];

    // Send verification SMS
    const smsResult = await smsService.sendVerificationSMS(formattedPhone, verificationCode, firstName);
    console.log('📱 SMS service result:', smsResult);

    // Log registration attempt
    await db.query(
      `INSERT INTO login_history (user_id, success, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [user.user_id, false, req.ip, req.get('User-Agent')]
    );

    res.status(201).json({
      message: 'User registered successfully. Please check your phone for verification code.',
      requiresVerification: true,
      user: {
        id: user.user_id,
        email: user.email,
        phoneNumber: user.phone_number,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    // Comprehensive error logging
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Error Code:', error.code);
    console.error('Error Detail:', error.detail);
    console.error('Error Hint:', error.hint);
    console.error('Error Where:', error.where);
    console.error('Error Constraint:', error.constraint);
    console.error('Error Table:', error.table);
    console.error('Error Column:', error.column);
    console.error('Error DataType:', error.dataType);
    console.error('Error Routine:', error.routine);
    console.error('Error Schema:', error.schema);
    console.error('Error Severity:', error.severity);
    console.error('Error File:', error.file);
    console.error('Error Line:', error.line);
    console.error('Timestamp:', new Date().toISOString());
    console.error('Request Body:', JSON.stringify(req.body, null, 2));
    console.error('Request Headers:', JSON.stringify(req.headers, null, 2));
    console.error('========================');
    
    // Determine appropriate error response based on error type
    let statusCode = 500;
    let errorMessage = 'Unable to create account. Please try again.';
    let errorDetails = null;
    
    if (process.env.NODE_ENV === 'development') {
      errorDetails = {
        type: error.constructor.name,
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        where: error.where,
        constraint: error.constraint,
        table: error.table,
        column: error.column
      };
    }
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique violation
      statusCode = 400;
      errorMessage = 'An account with this email or username already exists.';
    } else if (error.code === '23502') { // Not null violation
      statusCode = 400;
      errorMessage = 'Required fields are missing.';
    } else if (error.code === '23503') { // Foreign key violation
      statusCode = 400;
      errorMessage = 'Invalid reference data provided.';
    } else if (error.code === '42P01') { // Undefined table
      statusCode = 500;
      errorMessage = 'Database table not found. Please contact support.';
    } else if (error.code === '42P02') { // Undefined column
      statusCode = 500;
      errorMessage = 'Database column not found. Please contact support.';
    } else if (error.code === 'ECONNREFUSED') { // Database connection refused
      statusCode = 503;
      errorMessage = 'Database service unavailable. Please try again later.';
    } else if (error.code === 'ENOTFOUND') { // Host not found
      statusCode = 503;
      errorMessage = 'Database host not found. Please try again later.';
    } else if (error.code === 'ETIMEDOUT') { // Connection timeout
      statusCode = 503;
      errorMessage = 'Database connection timeout. Please try again later.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') { // Access denied
      statusCode = 500;
      errorMessage = 'Database access denied. Please contact support.';
    } else if (error.code === 'ER_BAD_DB_ERROR') { // Database doesn't exist
      statusCode = 500;
      errorMessage = 'Database not found. Please contact support.';
    }
    
    res.status(statusCode).json({
      error: 'Registration failed',
      message: errorMessage,
      details: errorDetails
    });
  }
});

// Login user
router.post('/login', validateLogin, formatValidationErrors, async (req, res) => {
  try {

    const { email, password } = req.body;

    // Find user by email
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't log failed login attempts for non-existent users
      // Just return the error response
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Email address not found. Please check your email or create a new account.'
      });
    }

    const user = userResult.rows[0];

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(401).json({
        error: 'Email not verified',
        message: 'Please verify your email address before logging in. Check your email for the verification code.',
        requiresVerification: true
      });
    }

    // Check account status and reactivate if inactive
    if (user.account_status === 'inactive') {
      // Reactivate the account
      await db.query(
        `UPDATE users 
         SET account_status = 'active', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [user.user_id]
      );
      console.log(`Account reactivated for user: ${user.email}`);
    }

    // Check if account is locked
    if (user.account_locked) {
      return res.status(423).json({
        error: 'Account locked',
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
          // Increment login attempts
    const newLoginAttempts = (user.failed_login_attempts || 0) + 1;
      let lockedUntil = null;

      // Lock account after 5 failed attempts for 15 minutes
      if (newLoginAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await db.query(
        `UPDATE users SET failed_login_attempts = $1, account_locked = $2 WHERE user_id = $3`,
        [newLoginAttempts, lockedUntil ? true : false, user.user_id]
      );

      // Log failed login attempt
      await db.query(
        `INSERT INTO login_history (user_id, success, failure_reason, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.user_id, false, 'Invalid password', req.ip, req.get('User-Agent')]
      );

      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Incorrect password. Please try again or reset your password.'
      });
    }

    // Reset login attempts on successful login
    await db.query(
      `UPDATE users SET failed_login_attempts = 0, account_locked = FALSE, password_last_changed = CURRENT_TIMESTAMP WHERE user_id = $1`,
      [user.user_id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
      }
    );

    // Log successful login
    await db.query(
      `INSERT INTO login_history (user_id, success, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [user.user_id, true, req.ip, req.get('User-Agent')]
    );

    res.json({
      message: 'Login successful',
      user: {
        username: user.email, // Use email as username
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        lastLogin: user.password_last_changed
      },
      token
    });

  } catch (error) {
    // Comprehensive error logging for login
    console.error('=== LOGIN ERROR ===');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Error Code:', error.code);
    console.error('Error Detail:', error.detail);
    console.error('Timestamp:', new Date().toISOString());
    console.error('Request Body:', JSON.stringify(req.body, null, 2));
    console.error('========================');
    res.status(500).json({
      error: 'Login failed',
      message: 'Unable to authenticate. Please try again.'
    });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Log logout
    await db.query(
      `UPDATE login_history 
       SET logout_timestamp = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND logout_timestamp IS NULL 
       ORDER BY login_timestamp DESC 
       LIMIT 1`,
      [userId]
    );

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Unable to logout. Please try again.'
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await db.query(
      `SELECT user_id, email, first_name, last_name, created_at, password_last_changed
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        lastLogin: user.password_last_changed
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      error: 'Unable to fetch user profile',
      message: 'Please try again.'
    });
  }
});

// Verify phone number with code (for new user sign up)
router.post('/verify-phone', async (req, res) => {
  try {
    const { phoneNumber, verificationCode } = req.body;

    if (!phoneNumber || !verificationCode) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Phone number and verification code are required.'
      });
    }

    // Format phone number
    const formattedPhone = smsService.formatPhoneNumber(phoneNumber);

    // Find user by phone number
    const userResult = await db.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [formattedPhone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No account found with this phone number.'
      });
    }

    const user = userResult.rows[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        error: 'Already verified',
        message: 'Phone number is already verified.'
      });
    }

    // Check verification attempts
    if (user.verification_attempts >= 5) {
      const lastAttempt = new Date(user.last_verification_attempt);
      const timeSinceLastAttempt = Date.now() - lastAttempt.getTime();
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes

      if (timeSinceLastAttempt < lockoutDuration) {
        return res.status(429).json({
          error: 'Too many attempts',
          message: 'Too many verification attempts. Please try again in 15 minutes.'
        });
      } else {
        // Reset attempts after lockout period
        await db.query(
          'UPDATE users SET verification_attempts = 0 WHERE user_id = $1',
          [user.user_id]
        );
      }
    }

    // Check if code matches and is not expired
    if (user.verification_code !== verificationCode) {
      // Increment failed attempts
      await db.query(
        `UPDATE users 
         SET verification_attempts = verification_attempts + 1, 
             last_verification_attempt = CURRENT_TIMESTAMP 
         WHERE user_id = $1`,
        [user.user_id]
      );

      return res.status(400).json({
        error: 'Invalid code',
        message: 'Invalid verification code. Please check your phone and try again.'
      });
    }

    if (new Date() > new Date(user.verification_code_expires)) {
      return res.status(400).json({
        error: 'Code expired',
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    // Verify phone and clear verification data
    await db.query(
      `UPDATE users 
       SET email_verified = TRUE, 
           account_status = 'active',
           verification_code = NULL, 
           verification_code_expires = NULL,
           verification_attempts = 0,
           last_verification_attempt = NULL
       WHERE user_id = $1`,
      [user.user_id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
      }
    );

    // Log successful verification
    await db.query(
      `INSERT INTO login_history (user_id, success, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [user.user_id, true, req.ip, req.get('User-Agent')]
    );

    res.json({
      message: 'Phone number verified successfully',
      user: {
        id: user.user_id,
        email: user.email,
        phoneNumber: user.phone_number,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'Unable to verify phone number. Please try again.'
    });
  }
});

// Verify email with code (kept for backward compatibility)
router.post('/verify-email', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and verification code are required.'
      });
    }

    // Find user by email
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No account found with this email address.'
      });
    }

    const user = userResult.rows[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        error: 'Already verified',
        message: 'Email address is already verified.'
      });
    }

    // Check verification attempts
    if (user.verification_attempts >= 5) {
      const lastAttempt = new Date(user.last_verification_attempt);
      const timeSinceLastAttempt = Date.now() - lastAttempt.getTime();
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes

      if (timeSinceLastAttempt < lockoutDuration) {
        return res.status(429).json({
          error: 'Too many attempts',
          message: 'Too many verification attempts. Please try again in 15 minutes.'
        });
      } else {
        // Reset attempts after lockout period
        await db.query(
          'UPDATE users SET verification_attempts = 0 WHERE user_id = $1',
          [user.user_id]
        );
      }
    }

    // Check if code matches and is not expired
    if (user.verification_code !== verificationCode) {
      // Increment failed attempts
      await db.query(
        `UPDATE users 
         SET verification_attempts = verification_attempts + 1, 
             last_verification_attempt = CURRENT_TIMESTAMP 
         WHERE user_id = $1`,
        [user.user_id]
      );

      return res.status(400).json({
        error: 'Invalid code',
        message: 'Invalid verification code. Please check your email and try again.'
      });
    }

    if (new Date() > new Date(user.verification_code_expires)) {
      return res.status(400).json({
        error: 'Code expired',
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    // Verify email and clear verification data
    await db.query(
      `UPDATE users 
       SET email_verified = TRUE, 
           account_status = 'active',
           verification_code = NULL, 
           verification_code_expires = NULL,
           verification_attempts = 0,
           last_verification_attempt = NULL
       WHERE user_id = $1`,
      [user.user_id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
      }
    );

    // Log successful verification
    await db.query(
      `INSERT INTO login_history (user_id, success, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [user.user_id, true, req.ip, req.get('User-Agent')]
    );

    res.json({
      message: 'Email verified successfully',
      user: {
        id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'Unable to verify email. Please try again.'
    });
  }
});

// Update user profile
router.put('/users/profile', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, phone_number } = req.body;
    const userId = req.user.user_id;

    // Validate input
    if (!first_name || !last_name) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'First name and last name are required.'
      });
    }

    if (first_name.trim().length === 0 || last_name.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'First name and last name cannot be empty.'
      });
    }

    // Validate phone number if provided
    if (phone_number && phone_number.trim().length > 0) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/;
      if (!phoneRegex.test(phone_number.trim())) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Please enter a valid phone number.'
        });
      }
    }

    // Update user profile
    const result = await db.query(
      `UPDATE users 
       SET first_name = $1, 
           last_name = $2,
           phone_number = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4
       RETURNING user_id, email, first_name, last_name, phone_number`,
      [first_name.trim(), last_name.trim(), phone_number?.trim() || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found.'
      });
    }

    const updatedUser = result.rows[0];

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.user_id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phoneNumber: updatedUser.phone_number
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'Unable to update profile. Please try again.'
    });
  }
});

// Change password
router.put('/users/password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.user_id;

    // Validate input
    if (!current_password || !new_password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Current password and new password are required.'
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'New password must be at least 8 characters long.'
      });
    }

    // Get current user to verify current password
    const userResult = await db.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found.'
      });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Current password is incorrect.'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await db.query(
      `UPDATE users 
       SET password_hash = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [newPasswordHash, userId]
    );

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'Unable to change password. Please try again.'
    });
  }
});

// Forgot password - request reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email required',
        message: 'Email address is required.'
      });
    }

    // Find user by email
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if user exists or not (security best practice)
      return res.json({
        message: 'If an account exists with this email, a password reset code has been sent.'
      });
    }

    const user = userResult.rows[0];

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(400).json({
        error: 'Email not verified',
        message: 'Please verify your email address before resetting your password.'
      });
    }

    // Rate limiting removed for app store release (scaling handled by Railway)
    // const lastResetRequest = user.last_verification_attempt;
    // if (lastResetRequest) {
    //   const timeSinceLastRequest = Date.now() - new Date(lastResetRequest).getTime();
    //   const resetCooldown = 60 * 60 * 1000; // 1 hour
    //
    //   if (timeSinceLastRequest < resetCooldown) {
    //     const remainingTime = Math.ceil((resetCooldown - timeSinceLastRequest) / 1000 / 60);
    //     return res.status(429).json({
    //       error: 'Rate limited',
    //       message: `Please wait ${remainingTime} minutes before requesting another reset code.`
    //     });
    //   }
    // }

    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset code in verification_code field (reusing existing infrastructure)
    await db.query(
      `UPDATE users 
       SET verification_code = $1, 
           verification_code_expires = $2,
           last_verification_attempt = CURRENT_TIMESTAMP
       WHERE user_id = $3`,
      [resetCode, resetCodeExpires, user.user_id]
    );

    // Send password reset email
    await emailService.sendPasswordResetEmail(email, resetCode, user.first_name || 'User');

    res.json({
      message: 'If an account exists with this email, a password reset code has been sent.',
      email: email
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Request failed',
      message: 'Unable to process password reset request. Please try again.'
    });
  }
});

// Reset password with code
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, reset code, and new password are required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'Password must be at least 8 characters long.'
      });
    }

    // Find user by email
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No account found with this email address.'
      });
    }

    const user = userResult.rows[0];

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(400).json({
        error: 'Email not verified',
        message: 'Please verify your email address before resetting your password.'
      });
    }

    // Check if code matches and is not expired
    if (user.verification_code !== resetCode) {
      return res.status(400).json({
        error: 'Invalid code',
        message: 'Invalid reset code. Please check your email and try again.'
      });
    }

    if (new Date() > new Date(user.verification_code_expires)) {
      return res.status(400).json({
        error: 'Code expired',
        message: 'Reset code has expired. Please request a new code.'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset code
    await db.query(
      `UPDATE users 
       SET password_hash = $1,
           verification_code = NULL,
           verification_code_expires = NULL,
           last_verification_attempt = NULL,
           password_last_changed = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [newPasswordHash, user.user_id]
    );

    res.json({
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Reset failed',
      message: 'Unable to reset password. Please try again.'
    });
  }
});

// Resend verification code (supports both email and phone)
router.post('/resend-verification', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: 'Identifier required',
        message: 'Email address or phone number is required.'
      });
    }

    let user;
    let identifier;

    // Find user by email or phone
    if (email) {
      identifier = email;
      const userResult = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: 'User not found',
          message: 'No account found with this email address.'
        });
      }
      user = userResult.rows[0];
    } else if (phoneNumber) {
      const formattedPhone = smsService.formatPhoneNumber(phoneNumber);
      identifier = formattedPhone;
      const userResult = await db.query(
        'SELECT * FROM users WHERE phone_number = $1',
        [formattedPhone]
      );
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          error: 'User not found',
          message: 'No account found with this phone number.'
        });
      }
      user = userResult.rows[0];
    }

    if (user.email_verified) {
      return res.status(400).json({
        error: 'Already verified',
        message: 'Account is already verified.'
      });
    }

    // Rate limiting removed for app store release (scaling handled by Railway)
    // const lastResend = user.last_verification_attempt;
    // if (lastResend) {
    //   const timeSinceLastResend = Date.now() - new Date(lastResend).getTime();
    //   const resendCooldown = 60 * 60 * 1000; // 1 hour
    //
    //   if (timeSinceLastResend < resendCooldown) {
    //     const remainingTime = Math.ceil((resendCooldown - timeSinceLastResend) / 1000 / 60);
    //     return res.status(429).json({
    //       error: 'Rate limited',
    //       message: `Please wait ${remainingTime} minutes before requesting another verification code.`
    //     });
    //   }
    // }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with new code
    await db.query(
      `UPDATE users 
       SET verification_code = $1, 
           verification_code_expires = $2,
           verification_attempts = 0,
           last_verification_attempt = CURRENT_TIMESTAMP
       WHERE user_id = $3`,
      [verificationCode, verificationExpires, user.user_id]
    );

    // Send verification code via SMS if phone number is provided, otherwise email
    if (phoneNumber && user.phone_number) {
      const smsResult = await smsService.sendVerificationSMS(user.phone_number, verificationCode, user.first_name || 'User');
      console.log('📱 Resend SMS service result:', smsResult);
      res.json({
        message: 'Verification code has been resent. Please check your phone.',
        phoneNumber: user.phone_number
      });
    } else if (email && user.email) {
      const emailResult = await emailService.sendVerificationEmail(user.email, verificationCode, user.first_name || 'User');
      console.log('📧 Resend email service result:', emailResult);
      res.json({
        message: 'Verification code has been resent. Please check your email.',
        email: user.email
      });
    } else {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Unable to determine verification method.'
      });
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      error: 'Resend failed',
      message: 'Unable to resend verification code. Please try again.'
    });
  }
});

module.exports = router; 