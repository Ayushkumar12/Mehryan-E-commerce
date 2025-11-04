import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post(
  '/signup',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, password, role } = req.body;

      // Check if user exists
      const existingUser = await req.db
        .collection('users')
        .findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = {
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await req.db
        .collection('users')
        .insertOne(user);

      const token = generateToken(result.insertedId.toString(), user.role);

      // Create session
      req.session.userId = result.insertedId.toString();
      req.session.userRole = user.role;
      req.session.userEmail = user.email;
      req.session.userName = user.name;

      res.status(201).json({
        success: true,
        token,
        sessionId: req.sessionID,
        user: {
          id: result.insertedId,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Check for user
      const user = await req.db
        .collection('users')
        .findOne({ email });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = generateToken(user._id.toString(), user.role);

      // Create session
      req.session.userId = user._id.toString();
      req.session.userRole = user.role;
      req.session.userEmail = user.email;
      req.session.userName = user.name;

      res.status(200).json({
        success: true,
        token,
        sessionId: req.sessionID,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          pincode: user.pincode
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const userId = new ObjectId(req.user.id);
    const user = await req.db
      .collection('users')
      .findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    delete user.password;

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/auth/profile-with-orders
// @desc    Get user profile with all orders populated
// @access  Private
router.get('/profile-with-orders', protect, async (req, res) => {
  try {
    const userId = new ObjectId(req.user.id);
    
    // Get user profile
    const user = await req.db
      .collection('users')
      .findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all orders for the user
    const orders = await req.db
      .collection('orders')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    // Remove password from response
    delete user.password;

    res.status(200).json({
      success: true,
      user: {
        ...user,
        orders,
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + (order.orderSummary?.total || 0), 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/auth/updateprofile
// @desc    Update user profile
// @access  Private
router.put('/updateprofile', protect, async (req, res) => {
  try {
    const userId = new ObjectId(req.user.id);

    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      updatedAt: new Date()
    };

    await req.db
      .collection('users')
      .updateOne({ _id: userId }, { $set: fieldsToUpdate });

    const updatedUser = await req.db
      .collection('users')
      .findOne({ _id: userId });

    // Remove password from response
    delete updatedUser.password;

    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user and destroy session
// @access  Private
router.post('/logout', (req, res) => {
  if (!req.session) {
    return res.status(400).json({
      success: false,
      message: 'No active session'
    });
  }

  const sessionId = req.sessionID;
  
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to logout'
      });
    }

    // Clear session cookie
    res.clearCookie('connect.sid');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      sessionId: sessionId
    });
  });
});

// @route   GET /api/auth/session
// @desc    Get current session information
// @access  Private
router.get('/session', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'No active session'
    });
  }

  res.status(200).json({
    success: true,
    session: {
      sessionId: req.sessionID,
      userId: req.session.userId,
      userEmail: req.session.userEmail,
      userName: req.session.userName,
      userRole: req.session.userRole,
      createdAt: req.session.cookie._expires,
      maxAge: req.session.cookie.maxAge
    }
  });
});

// @route   POST /api/auth/check-session
// @desc    Check if user has an active session
// @access  Public
router.post('/check-session', (req, res) => {
  if (req.session && req.session.userId) {
    return res.status(200).json({
      success: true,
      hasSession: true,
      session: {
        userId: req.session.userId,
        userEmail: req.session.userEmail,
        userName: req.session.userName,
        userRole: req.session.userRole
      }
    });
  }

  res.status(200).json({
    success: true,
    hasSession: false
  });
});

export default router;