const { Types } = require('mongoose');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const Category = require('../models/Category'); 
const Subscription = require('../models/Subscription'); 
const { sendSuccess } = require('../utils/response');

// --- 1. HOME PAGE ---
const getHomeContent = async (req, res, next) => {
  try {
    // 1. Featured: Get 3 random published series
    const featured = await Series.aggregate([
        { $match: { status: 'published' } }, 
        { $sample: { size: 3 } }
    ]);

    // 2. Trending: Get top 10 newest + Calculate Episode Count using Aggregation
    const trending = await Series.aggregate([
        { $match: { status: 'published' } },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        // Join with 'episodes' collection to get the list of episodes
        {
            $lookup: {
                from: 'episodes',       // Collection name (lowercase plural of Episode model)
                localField: '_id',      // Field in Series
                foreignField: 'series', // Field in Episode
                as: 'episodeData'       // Temporary array to hold matching episodes
            }
        },
        // Join with 'users' collection to get Creator details (Replaces .populate)
        {
            $lookup: {
                from: 'users',
                localField: 'creator',
                foreignField: '_id',
                as: 'creatorData'
            }
        },
        // Shape the final result
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                coverImage: 1,
                tags: 1,
                status: 1,
                createdAt: 1,
                // ✅ Calculate the size of the episodeData array
                episodeCount: { $size: '$episodeData' },
                // ✅ Extract displayName from the creator array
                creator: { 
                    displayName: { $arrayElemAt: ['$creatorData.displayName', 0] },
                    _id: { $arrayElemAt: ['$creatorData._id', 0] }
                }
            }
        }
    ]);

    const categories = await Category.find().sort({ name: 1 }).select('name');
    const genres = categories.map(c => c.name);

    return sendSuccess(res, { featured, trending, genres });
  } catch (err) { 
      return next(err); 
  }
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