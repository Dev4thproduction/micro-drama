const Series = require('../models/Series');
const Episode = require('../models/Episode');
const Category = require('../models/Category');
const WatchHistory = require('../models/WatchHistory');
const Subscription = require('../models/Subscription');
const { sendSuccess } = require('../utils/response');

const getHome = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        // 1. Continue Watching
        let continueWatching = [];
        if (userId) {
            continueWatching = await WatchHistory.find({ user: userId })
                .sort({ lastWatched: -1 })
                .limit(5)
                .populate('series', 'title posterUrl')
                .populate('episode', 'title order thumbnailUrl duration');
        }

        // 2. Featured Series
        const featured = await Series.aggregate([
            { $match: { status: 'published' } }, 
            { $sample: { size: 1 } }
        ]);

        // 3. Trending
        const trending = await Series.find({ status: 'published' }) 
            .sort({ views: -1 })
            .limit(6)
            // Note: Since category is a String in Series, populate won't work unless changed to ObjectId.
            // For Home, we return it as is.
            .select('title posterUrl category rating seasonCount views');

        // 4. New Episodes
        const newEpisodes = await Episode.find({ status: 'published' }) 
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('series', 'title posterUrl')
            .select('title thumbnailUrl order duration createdAt series');

        // 5. Genres
        const categories = await Category.find({})
            .select('name slug color')
            .sort({ name: 1 });

        return sendSuccess(res, {
            featured: featured[0] || null,
            continueWatching,
            trending,
            newEpisodes,
            categories
        });
    } catch (err) {
        return next(err);
    }
};

// ✅ REWRITTEN: Handles Search, Category Filter, and Episode Counts correctly
const getDiscover = async (req, res, next) => {
    try {
        const { search, q, category, sort } = req.query;
        const searchTerm = search || q;

        // 1. Build Match Stage
        // Ensure we only show published series
        let matchStage = { status: 'published' }; 

        if (searchTerm) {
            matchStage.title = { $regex: searchTerm, $options: 'i' };
        }

        if (category && category !== 'all' && category !== 'All') {
            // Fix: Series.category is a String, so we match it directly (case-insensitive)
            matchStage.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }

        // 2. Sort Stage
        let sortStage = { createdAt: -1 }; // Default newest
        if (sort === 'popular') {
            sortStage = { views: -1 };
        }

        // 3. Aggregation Pipeline
        const results = await Series.aggregate([
            { $match: matchStage },
            // Lookup Episodes to calculate count
            {
                $lookup: {
                    from: 'episodes',
                    localField: '_id',
                    foreignField: 'series',
                    as: 'episodeData'
                }
            },
            {
                $addFields: {
                    // Calculate count
                    episodeCount: { $size: '$episodeData' },
                    // Fix: Map string category to object structure for frontend { category: { name: "Drama" } }
                    category: { name: '$category' }
                }
            },
            { $sort: sortStage },
            {
                $project: {
                    title: 1,
                    posterUrl: 1,
                    coverImage: 1,
                    category: 1, 
                    views: 1,
                    seasonCount: 1,
                    tags: 1,
                    episodeCount: 1,
                    createdAt: 1
                }
            }
        ]);

        return sendSuccess(res, results);
    } catch (err) {
        return next(err);
    }
};

const getSeriesEpisodes = async (req, res, next) => {
    try {
        const { seriesId } = req.params;
        const userId = req.user?.id;

        const series = await Series.findById(seriesId).select('title posterUrl description category');
        if (!series) {
            return next({ status: 404, message: 'Series not found' });
        }

        let isSubscribed = false;
        if (userId) {
            const subscription = await Subscription.findOne({ 
                user: userId, 
                status: 'active' 
            });
            if (subscription) isSubscribed = true;
        }

        const episodes = await Episode.find({
            series: seriesId,
            status: 'published'
        })
            .sort({ order: 1 })
            .select('title synopsis order video thumbnail duration isFree'); 

        const episodesWithLock = episodes.map(ep => {
            const epObj = ep.toObject();
            epObj.isLocked = !isSubscribed && ep.order > 2;
            return epObj;
        });

        return sendSuccess(res, {
            series,
            episodes: episodesWithLock 
        });
    } catch (err) {
        return next(err);
    }
};

module.exports = { getHome, getSeriesEpisodes, getDiscover };