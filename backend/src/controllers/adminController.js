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
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const watchHistoryFilter = {};
    if (startDate || endDate) {
      watchHistoryFilter.lastWatchedAt = {};
      if (startDate) watchHistoryFilter.lastWatchedAt.$gte = new Date(startDate);
      if (endDate) watchHistoryFilter.lastWatchedAt.$lte = new Date(endDate);
    }

    // 1. Fetch Key Counts
    const [
      totalUsers,
      pendingEpisodes,
      subscriptions,
      viewStats,
      totalSeries,
      publishedSeries,
      totalEpisodes,
      totalCategories,
      activeSubscribers
    ] = await Promise.all([
      User.countDocuments({ role: 'viewer', ...dateFilter }),
      Episode.countDocuments({ status: 'pending', ...dateFilter }),
      Subscription.find({ status: 'active', ...dateFilter }),
      require('../models/WatchHistory').aggregate([
        { $match: watchHistoryFilter },
        { $group: { _id: null, totalViews: { $sum: 1 } } }
      ]),
      Series.countDocuments(dateFilter),
      Series.countDocuments({ status: 'published', ...dateFilter }),
      Episode.countDocuments(dateFilter),
      require('../models/Category').countDocuments(dateFilter),
      Subscription.countDocuments({ status: 'active', ...dateFilter })
    ]);

    const totalViews = viewStats.length > 0 ? viewStats[0].totalViews : 0;

    // 2. Calculate Revenue (In Rupees)
    let monthlyRevenue = 0;
    let weeklyRevenue = 0;
    subscriptions.forEach(sub => {
      const subAmount = sub.amount || (sub.plan === 'weekly' ? 99 : 199);
      if (sub.plan === 'weekly') {
        monthlyRevenue += subAmount * 4;
        weeklyRevenue += subAmount;
      } else {
        monthlyRevenue += subAmount;
        weeklyRevenue += subAmount / 4;
      }
    });

    const revenue = monthlyRevenue;

    // 2.1 Calculate Lifetime Revenue (Filtered by date)
    const allSubs = await Subscription.find(dateFilter);
    const totalRevenue = allSubs.reduce((acc, sub) => {
      const subAmount = sub.amount || (sub.plan === 'weekly' ? 99 : 199);
      return acc + subAmount;
    }, 0);

    // 3. Urgent Items
    const urgentItems = await Episode.find({ status: 'pending' })
      .populate('series', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Top Performing Content
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
        activeSubscribers,
        totalViews,
        totalSeries,
        publishedSeries,
        totalEpisodes,
        publishedEpisodes: totalEpisodes - pendingEpisodes,
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
    const { page = 1, limit = 10, search, plan, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const query = { status: { $in: ['active', 'canceled', 'trial'] } };

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

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
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate || endDate) {
      match.lastWatchedAt = {};
      if (startDate) match.lastWatchedAt.$gte = new Date(startDate);
      if (endDate) match.lastWatchedAt.$lte = new Date(endDate);
    }

    // Aggregate genre performance from WatchHistory to see what's actually being watched in this period
    const genreStats = await require('../models/WatchHistory').aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'episodes',
          localField: 'episode',
          foreignField: '_id',
          as: 'episodeData'
        }
      },
      { $unwind: '$episodeData' },
      {
        $lookup: {
          from: 'series',
          localField: 'episodeData.series',
          foreignField: '_id',
          as: 'seriesData'
        }
      },
      { $unwind: '$seriesData' },
      {
        $group: {
          _id: "$seriesData.category",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

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

const getPeriodicAnalytics = async (req, res, next) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    const match = {};
    if (startDate || endDate) {
      match.lastWatchedAt = {};
      if (startDate) match.lastWatchedAt.$gte = new Date(startDate);
      if (endDate) match.lastWatchedAt.$lte = new Date(endDate);
    }

    let groupBy;
    if (period === 'daily') {
      groupBy = {
        year: { $year: "$lastWatchedAt" },
        month: { $month: "$lastWatchedAt" },
        day: { $dayOfMonth: "$lastWatchedAt" }
      };
    } else if (period === 'weekly') {
      groupBy = {
        year: { $year: "$lastWatchedAt" },
        week: { $week: "$lastWatchedAt" }
      };
    } else {
      groupBy = {
        year: { $year: "$lastWatchedAt" },
        month: { $month: "$lastWatchedAt" }
      };
    }

    const viewsTrend = await require('../models/WatchHistory').aggregate([
      { $match: match },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } }
    ]);

    const formattedData = viewsTrend.map(item => {
      let label = "";
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      if (period === 'daily') {
        const monthStr = monthNames[item._id.month - 1];
        label = `${monthStr} ${item._id.day}`;
      } else if (period === 'weekly') {
        // Calculate date range for the week
        // ISO week logic or simple start date calculation
        const jan1 = new Date(item._id.year, 0, 1);
        const days = (item._id.week * 7);
        const weekStart = new Date(jan1.getTime() + days * 24 * 60 * 60 * 1000);
        // Adjust back to Sunday
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const startStr = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}`;
        const endStr = `${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()}`;
        label = `${startStr} - ${endStr}, ${weekStart.getFullYear()}`;
      } else {
        const monthStr = monthNames[item._id.month - 1];
        label = `${monthStr} ${item._id.year}`;
      }

      return {
        label,
        value: item.count
      };
    });

    return sendSuccess(res, formattedData);
  } catch (err) {
    return next(err);
  }
};

const getContentAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate || endDate) {
      match.lastWatchedAt = {};
      if (startDate) match.lastWatchedAt.$gte = new Date(startDate);
      if (endDate) match.lastWatchedAt.$lte = new Date(endDate);
    }

    // Since Series model doesn't have a direct 'lastWatchedAt', we aggregate from WatchHistory to get rank by views in period
    const [topSeriesViews, topEpisodesViews] = await Promise.all([
      require('../models/WatchHistory').aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'episodes',
            localField: 'episode',
            foreignField: '_id',
            as: 'episodeData'
          }
        },
        { $unwind: '$episodeData' },
        {
          $group: {
            _id: '$episodeData.series',
            views: { $sum: 1 }
          }
        },
        { $sort: { views: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'series',
            localField: '_id',
            foreignField: '_id',
            as: 'seriesData'
          }
        },
        { $unwind: '$seriesData' }
      ]),
      require('../models/WatchHistory').aggregate([
        { $match: match },
        {
          $group: {
            _id: '$episode',
            views: { $sum: 1 }
          }
        },
        { $sort: { views: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'episodes',
            localField: '_id',
            foreignField: '_id',
            as: 'episodeData'
          }
        },
        { $unwind: '$episodeData' },
        {
          $lookup: {
            from: 'series',
            localField: 'episodeData.series',
            foreignField: '_id',
            as: 'seriesData'
          }
        },
        { $unwind: '$seriesData' }
      ])
    ]);

    return sendSuccess(res, {
      topSeries: topSeriesViews.map(s => ({
        label: s.seriesData.title,
        value: s.views,
        thumbnail: s.seriesData.coverImage,
        category: s.seriesData.category
      })),
      topEpisodes: topEpisodesViews.map(e => ({
        label: e.episodeData.title,
        seriesTitle: e.seriesData?.title || 'Unknown',
        value: e.views,
        thumbnail: e.episodeData.thumbnail || e.seriesData.coverImage,
        episodeNumber: e.episodeData.order
      }))
    });
  } catch (err) {
    return next(err);
  }
};

const getPeriodicRevenue = async (req, res, next) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    const match = { status: 'active' };
    if (startDate || endDate) {
      match.startDate = {};
      if (startDate) match.startDate.$gte = new Date(startDate);
      if (endDate) match.startDate.$lte = new Date(endDate);
    }

    let groupBy;
    if (period === 'weekly') {
      groupBy = {
        year: { $year: "$startDate" },
        week: { $week: "$startDate" }
      };
    } else {
      groupBy = {
        year: { $year: "$startDate" },
        month: { $month: "$startDate" }
      };
    }

    const revenueTrend = await Subscription.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupBy,
          total: {
            $sum: { $ifNull: ["$amount", { $cond: [{ $eq: ["$plan", "weekly"] }, 99, 199] }] }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } }
    ]);

    const formattedData = revenueTrend.map(item => {
      let label = "";
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      let monthStr;
      if (item._id.month) {
        monthStr = monthNames[item._id.month - 1];
      }

      if (period === 'weekly') {
        // Calculate date from year and week
        const jan1 = new Date(item._id.year, 0, 1);
        const days = (item._id.week * 7);
        const weekStart = new Date(jan1.getTime() + days * 24 * 60 * 60 * 1000);
        // Adjust to Sunday
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        monthStr = monthNames[weekStart.getMonth()];
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const startMonthShort = monthNames[weekStart.getMonth()].substring(0, 3);
        const endMonthShort = monthNames[weekEnd.getMonth()].substring(0, 3);

        label = `${startMonthShort} ${weekStart.getDate()} - ${endMonthShort} ${weekEnd.getDate()}`;
      } else {
        label = `${monthStr} ${item._id.year}`;
      }

      return {
        label,
        value: item.total
      };
    });

    return sendSuccess(res, formattedData);
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
  getPeriodicAnalytics,
  getContentAnalytics,
  getPeriodicRevenue,
  createAdmin,
  updateUser,
  deleteUser
};
