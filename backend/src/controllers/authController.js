const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { sendSuccess } = require('../utils/response');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const allowedSignupRoles = ['viewer', 'creator'];

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

// Helper to get user data with subscription info
const getUserWithSubscription = async (user) => {
  const sub = await Subscription.findOne({ user: user._id, status: 'active' });
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    displayName: user.displayName,
    subscriptionStatus: sub ? 'active' : 'inactive',
    plan: sub ? sub.plan : 'free'
  };
};

const register = async (req, res, next) => {
  try {
    const { email, password, displayName, role } = req.body || {};

    if (!email || !password) {
      return next({ status: 400, message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return next({ status: 409, message: 'Email already registered' });
    }

    if (role === 'admin') {
      return next({ status: 403, message: 'Admin users cannot be self-registered' });
    }

    const sanitizedRole = allowedSignupRoles.includes(role) ? role : 'viewer';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      displayName,
      role: sanitizedRole
    });

    const token = generateToken(user);
    const userData = await getUserWithSubscription(user);

    res.status(201);
    sendSuccess(res, { token, user: userData });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return next({ status: 400, message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return next({ status: 401, message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return next({ status: 403, message: 'User is not active' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next({ status: 401, message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    const userData = await getUserWithSubscription(user);

    sendSuccess(res, { token, user: userData });
  } catch (err) {
    next(err);
  }
};

// ✅ Ensure this function is defined
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { displayName, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return next({ status: 404, message: 'User not found' });

    if (displayName) user.displayName = displayName;

    if (newPassword) {
      if (!currentPassword) {
        return next({ status: 400, message: 'Current password is required' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) return next({ status: 401, message: 'Incorrect password' });
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    const userData = await getUserWithSubscription(user);

    return sendSuccess(res, userData);
  } catch (err) {
    return next(err);
  }
};

// ✅ CRITICAL: Ensure updateProfile is in the exports object
module.exports = { 
  register, 
  login, 
  updateProfile 
};