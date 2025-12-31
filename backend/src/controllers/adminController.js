const { Types } = require('mongoose');
const bcrypt = require('bcrypt');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const WatchHistory = require('../models/WatchHistory'); 
const { sendSuccess } = require('../utils/response');
const { parsePagination, buildMeta } = require('../utils/pagination');

// --- 1. DASHBOARD OVERVIEW ---
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, activeCreators, pendingEpisodes, subscriptions] = await Promise.all([
      User.countDocuments({ role: 'viewer' }),
      User.countDocuments({ role: 'creator', status: 'active' }),
      Episode.countDocuments({ status: 'pending' }),
      Subscription.find({ status: 'active' })
    ]);

    // Updated Revenue Calculation for Weekly (99) & Monthly (199)
    let revenue = 0;
    subscriptions.forEach(sub => {
        if (sub.plan === 'weekly') {
            revenue += (99 * 4); // Approx monthly revenue from weekly users
        } else {
            revenue += 199; // Monthly users
        }
    });

    const urgentItems = await Episode.find({ status: 'pending' })
      .populate('series', 'title') 
      .sort({ createdAt: -1 })
      .limit(5);

    return sendSuccess(res, {
      stats: { totalUsers, activeCreators, pendingEpisodes, revenue },
      urgentItems
    });
  } catch (err) {
    return next(err);
  }
};

// --- 2. USER MANAGEMENT ---
const getUsers = async (req, res, next) => {
  try {
    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt', 'email', 'status', 'role'],
      defaultSort: { createdAt: -1 }
    });

    const { search, role, status } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') filter.role = role;
    if (status && status !== 'all') filter.status = status;

    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort(sort).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    return sendSuccess(res, users, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'banned'].includes(status)) {
       return next({ status: 400, message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
    if (!user) return next({ status: 404, message: 'User not found' });

    return sendSuccess(res, user);
  } catch (err) {
    return next(err);
  }
};

// --- 3. MODERATION ---
const listPendingSeries = async (req, res, next) => {
  try {
    const { limit, skip, sort, page } = parsePagination(req.query);
    const filter = { status: 'pending' };
    const [items, total] = await Promise.all([
      Series.find(filter).sort(sort).skip(skip).limit(limit),
      Series.countDocuments(filter)
    ]);
    return sendSuccess(res, items, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

const listPendingEpisodes = async (req, res, next) => {
  try {
    const { limit, skip, sort, page } = parsePagination(req.query);
    const filter = { status: 'pending' };
    const [items, total] = await Promise.all([
      Episode.find(filter).populate('series', 'title').sort(sort).skip(skip).limit(limit),
      Episode.countDocuments(filter)
    ]);
    return sendSuccess(res, items, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

const approveEpisode = async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    const episode = await Episode.findById(episodeId);
    if (!episode) return next({ status: 404, message: 'Episode not found' });

    episode.status = 'published';
    await episode.save();

    const series = await Series.findById(episode.series);
    if (series && (series.status === 'pending' || series.status === 'draft')) {
      series.status = 'published';
      await series.save();
    }

    return sendSuccess(res, episode);
  } catch (err) {
    return next(err);
  }
};

const rejectEpisode = async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    // const { reason } = req.body; // Logic available if model supports reason

    const episode = await Episode.findById(episodeId);
    if (!episode) return next({ status: 404, message: 'Episode not found' });

    episode.status = 'draft';
    await episode.save();

    return sendSuccess(res, { message: 'Episode rejected', episodeId });
  } catch (err) {
    return next(err);
  }
};

// --- 4. SUBSCRIPTIONS MANAGEMENT ---
const toggleSubscription = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isSubscribed } = req.body;

    const user = await User.findById(userId);
    if (!user) return next({ status: 404, message: 'User not found' });

    let subscription = await Subscription.findOne({ user: userId });
    
    // Updated default to 'monthly' to match enum ['weekly', 'monthly']
    if (!subscription) {
      subscription = new Subscription({ user: userId, plan: 'monthly', status: 'trial' });
    }

    if (isSubscribed) {
      subscription.status = 'active';
      subscription.startDate = new Date();
    } else {
      subscription.status = 'canceled';
    }
    await subscription.save();

    return sendSuccess(res, subscription);
  } catch (err) {
    return next(err);
  }
};

const getSubscribers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const query = { status: { $in: ['active', 'canceled', 'trial'] } };
    
    if (search) {
      const users = await User.find({ 
        $or: [{ email: { $regex: search, $options: 'i' } }, { displayName: { $regex: search, $options: 'i' } }] 
      }).select('_id');
      query.user = { $in: users.map(u => u._id) };
    }

    const [subs, total] = await Promise.all([
      Subscription.find(query)
        .populate('user', 'displayName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Subscription.countDocuments(query)
    ]);

    return sendSuccess(res, subs, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

// --- NEW: SUBSCRIPTION ANALYTICS ---
const getSubscriptionStats = async (req, res, next) => {
  try {
    // 1. Count Active Subscribers by Plan
    const stats = await Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);

    // 2. Count Canceled/Expired
    const inactiveCount = await Subscription.countDocuments({ status: { $in: ['canceled', 'expired'] } });
    
    // 3. Calculate Estimated Monthly Revenue (MRR)
    const weeklyCount = stats.find(s => s._id === 'weekly')?.count || 0;
    const monthlyCount = stats.find(s => s._id === 'monthly')?.count || 0;
    
    // Revenue: (Weekly users * 99 * 4 weeks) + (Monthly users * 199)
    const estimatedRevenue = (weeklyCount * 99 * 4) + (monthlyCount * 199);

    return sendSuccess(res, {
      weekly: weeklyCount,
      monthly: monthlyCount,
      inactive: inactiveCount,
      revenue: estimatedRevenue
    });
  } catch (err) {
    return next(err);
  }
};

// --- 5. ANALYTICS ---
const getAnalytics = async (req, res, next) => {
  try {
    // Mock data connected to future WatchHistory aggregation
    const genreStats = [
       { _id: 'Sci-Fi', count: 450 },
       { _id: 'Romance', count: 320 },
       { _id: 'Thriller', count: 210 }
    ];
    return sendSuccess(res, { genreStats });
  } catch (err) {
    return next(err);
  }
};

// --- 6. CREATE ADMIN ---
const createAdmin = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next({ status: 400, message: 'User already exists' });
    }

    const user = await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 10),
      displayName,
      role: 'admin',
      status: 'active'
    });

    return sendSuccess(res, {
      message: 'Admin created successfully',
      adminId: user._id
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  listPendingSeries,
  listPendingEpisodes,
  approveEpisode,
  rejectEpisode,
  toggleSubscription,
  getSubscribers,
  getSubscriptionStats, // Exported new function
  getAnalytics,
  createAdmin
};