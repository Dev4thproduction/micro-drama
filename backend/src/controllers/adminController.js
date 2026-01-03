const { Types } = require('mongoose');
const bcrypt = require('bcrypt');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { sendSuccess } = require('../utils/response');
const { parsePagination, buildMeta } = require('../utils/pagination');

// --- 1. DASHBOARD OVERVIEW ---
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Fetch Key Counts
    const [
      totalUsers,
      pendingEpisodes,
      subscriptions,
      viewStats,
      totalSeries,
      publishedSeries,
      totalEpisodes,
      totalCategories
    ] = await Promise.all([
      User.countDocuments({ role: 'viewer' }),
      Episode.countDocuments({ status: 'pending' }),
      Subscription.find({ status: 'active' }),
      Series.aggregate([{ $group: { _id: null, totalViews: { $sum: "$views" } } }]),
      Series.countDocuments(),
      Series.countDocuments({ status: 'published' }),
      Episode.countDocuments(),
      require('../models/Category').countDocuments()
    ]);

    const totalViews = viewStats.length > 0 ? viewStats[0].totalViews : 0;

    // 2. Calculate Revenue (In Rupees)
    let monthlyRevenue = 0;
    let weeklyRevenue = 0;
    subscriptions.forEach(sub => {
      if (sub.plan === 'weekly') {
        monthlyRevenue += 396; // 99 * 4
        weeklyRevenue += 99;
      } else {
        monthlyRevenue += 199;
        weeklyRevenue += 50; // 199 / 4 ≈ 50
      }
    });

    const revenue = monthlyRevenue; // Default to monthly for backward compatibility


    // 2.1 Calculate Lifetime Revenue
    const allSubs = await Subscription.find();
    const totalRevenue = allSubs.reduce((acc, sub) => {
      const subAmount = sub.amount || (sub.plan === 'weekly' ? 99 : 199);
      return acc + subAmount;
    }, 0);

    // 3. Urgent Items (Pending Episodes)
    const urgentItems = await Episode.find({ status: 'pending' })
      .populate('series', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Top Performing Content (by views)
    const topContent = await Series.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title views coverImage createdAt');

    return sendSuccess(res, {
      stats: {
        totalUsers,
        pendingEpisodes,
        revenue,
        monthlyRevenue,
        weeklyRevenue,
        totalRevenue,
        activeSubscribers: subscriptions.length,

        totalViews,
        totalSeries,
        publishedSeries,
        totalEpisodes,
        publishedEpisodes: totalEpisodes - pendingEpisodes, // Estimation
        totalCategories,
        episodesPerSeries: totalSeries > 0 ? (totalEpisodes / totalSeries).toFixed(1) : 0
      },
      urgentItems,
      topContent
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

    // Filter by Role (Only Admin or Viewer)
    if (role && role !== 'all') {
      filter.role = role;
    } else {
      // By default, do not show 'creator' if they exist in DB, unless explicitly asked
      filter.role = { $in: ['admin', 'viewer'] };
    }

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

    // Default to 'monthly' (₹199) if creating new
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
    const { page = 1, limit = 10, search, plan } = req.query;
    const skip = (page - 1) * limit;

    const query = { status: { $in: ['active', 'canceled', 'trial'] } };

    if (plan && ['monthly', 'weekly'].includes(plan)) {
      query.plan = plan;
    }

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

// --- 5. ANALYTICS ---
const getAnalytics = async (req, res, next) => {
  try {
    const genreStats = await Series.aggregate([
      { $group: { _id: "$category", count: { $sum: "$views" } } },
      { $sort: { count: -1 } }
    ]);

    // Convert _id to genre names
    const stats = genreStats.map(item => ({
      _id: item._id || 'Uncategorized',
      count: item.count
    }));

    return sendSuccess(res, { genreStats: stats });
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

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { displayName, email, role } = req.body;

    const user = await User.findById(userId);
    if (!user) return next({ status: 404, message: 'User not found' });

    if (displayName) user.displayName = displayName;
    if (email) user.email = email;
    if (role) {
      if (!['admin', 'viewer', 'creator'].includes(role)) {
        return next({ status: 400, message: 'Invalid role' });
      }
      user.role = role;
    }

    await user.save();
    return sendSuccess(res, user);
  } catch (err) {
    return next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) return next({ status: 404, message: 'User not found' });

    return sendSuccess(res, { message: 'User deleted successfully' });
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
  getAnalytics,
  createAdmin,
  updateUser,
  deleteUser
};
