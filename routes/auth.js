const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Please enter a valid email address'),
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

    const { email, password, firstName, lastName, agreeToTerms } = req.body;

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email address already exists'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Create user with email verification
    const newUser = await db.query(
      `INSERT INTO users (
        user_id, 
        email, 
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
        $1,
        generate_pseudonymized_id(),
        'pending_verification',
        FALSE,
        $5,
        $6
      )
       RETURNING user_id, email, first_name, last_name, pseudonymized_id, created_at`,
      [email, passwordHash, firstName, lastName, verificationCode, verificationExpires]
    );

    const user = newUser.rows[0];

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(email, verificationCode, firstName);
    console.log('📧 Email service result:', emailResult);

    // Log registration attempt
    await db.query(
      `INSERT INTO login_history (user_id, success, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [user.user_id, false, req.ip, req.get('User-Agent')]
    );

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification code.',
      requiresVerification: true,
      user: {
        id: user.user_id,
        email: user.email,
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

// Verify email with code
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

// Resend verification code
router.post('/resend-verification', async (req, res) => {
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

    // Check resend rate limit (max 3 resends per hour)
    const lastResend = user.last_verification_attempt;
    if (lastResend) {
      const timeSinceLastResend = Date.now() - new Date(lastResend).getTime();
      const resendCooldown = 60 * 60 * 1000; // 1 hour

      if (timeSinceLastResend < resendCooldown) {
        const remainingTime = Math.ceil((resendCooldown - timeSinceLastResend) / 1000 / 60);
        return res.status(429).json({
          error: 'Rate limited',
          message: `Please wait ${remainingTime} minutes before requesting another verification code.`
        });
      }
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with new code
    await db.query(
      `UPDATE users 
       SET verification_code = $1, 
           verification_code_expires = $2,
           last_verification_attempt = CURRENT_TIMESTAMP
       WHERE user_id = $3`,
      [verificationCode, verificationExpires, user.user_id]
    );

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(email, verificationCode, user.first_name || 'User');
    console.log('📧 Resend email service result:', emailResult);

    res.json({
      message: 'Verification code sent successfully',
      email: email
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      error: 'Resend failed',
      message: 'Unable to send verification code. Please try again.'
    });
  }
});

module.exports = router; 