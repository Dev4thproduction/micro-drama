const { Types } = require('mongoose');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const Category = require('../models/Category'); 
const Subscription = require('../models/Subscription'); 
const { sendSuccess } = require('../utils/response');

// --- 1. HOME PAGE ---
const getHomeContent = async (req, res, next) => {
  try {
    const featured = await Series.aggregate([{ $match: { status: 'published' } }, { $sample: { size: 3 } }]);
    const trending = await Series.find({ status: 'published' }).sort({ createdAt: -1 }).limit(10).populate('creator', 'displayName');
    const categories = await Category.find().sort({ name: 1 }).select('name');
    const genres = categories.map(c => c.name);
    return sendSuccess(res, { featured, trending, genres });
  } catch (err) { return next(err); }
};

// --- 2. SEARCH ---
const searchContent = async (req, res, next) => {
  try {
    const { q, genre, sort = 'newest', page = 1, limit = 12 } = req.query;
    const query = { status: 'published' };
    if (q) query.title = { $regex: q, $options: 'i' };
    if (genre && genre !== 'All') query.category = genre; 
    
    const items = await Series.find(query).sort({ createdAt: -1 }).limit(Number(limit));
    return sendSuccess(res, items);
  } catch (err) { return next(err); }
};

// --- 3. GET SERIES (Calculates Locks) ---
const getSeriesDetails = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    const userId = req.user?.id; // ✅ User ID from optionalAuth

    if (!Types.ObjectId.isValid(seriesId)) return next({ status: 400, message: 'Invalid ID' });

    const series = await Series.findOne({ _id: seriesId, status: 'published' }).populate('creator', 'displayName');
    if (!series) return next({ status: 404, message: 'Series not found' });

    // ✅ CHECK SUBSCRIPTION
    let isSubscribed = false;
    if (userId) {
        // Check for ANY active subscription (weekly OR monthly)
        const subscription = await Subscription.findOne({ 
            user: userId, 
            status: { $in: ['active', 'trial'] } 
        });
        if (subscription) isSubscribed = true;
    }

    const episodes = await Episode.find({ series: seriesId, status: 'published' }).sort({ order: 1 });

    // ✅ APPLY LOCK LOGIC
    const episodesWithLock = episodes.map(ep => {
        const epObj = ep.toObject();
        // Lock if NOT subscribed AND Order > 2
        epObj.isLocked = !isSubscribed && ep.order > 2;
        return epObj;
    });

    return sendSuccess(res, { series, episodes: episodesWithLock });
  } catch (err) { return next(err); }
};

// --- 4. WATCH EPISODE (Enforces Security) ---
const getEpisodeDetails = async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    const userId = req.user?.id;

    const episode = await Episode.findOne({ _id: episodeId, status: 'published' }).populate('series');
    if (!episode) return next({ status: 404, message: 'Episode not found' });

    // ✅ SECURITY CHECK
    if (episode.order > 2) {
        if (!userId) return next({ status: 403, message: 'Sign in required' });
        
        const sub = await Subscription.findOne({ 
            user: userId, 
            status: { $in: ['active', 'trial'] } 
        });
        
        if (!sub) return next({ status: 403, message: 'Premium subscription required' });
    }

    return sendSuccess(res, episode);
  } catch (err) { return next(err); }
};

const listPublishedEpisodes = (req, res, next) => getSeriesDetails(req, res, next);
const listPublishedSeries = (req, res, next) => searchContent(req, res, next);

module.exports = {
  getHomeContent, searchContent, getSeriesDetails, 
  listPublishedEpisodes, getEpisodeDetails, listPublishedSeries
};