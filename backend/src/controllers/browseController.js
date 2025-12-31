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
            { $match: {} }, 
            { $sample: { size: 1 } }
        ]);

        // 3. Trending
        const trending = await Series.find({}) 
            .sort({ views: -1 })
            .limit(6)
            .populate('category', 'name color')
            .select('title posterUrl category rating seasonCount views');

        // 4. New Episodes
        const newEpisodes = await Episode.find({}) 
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

// ✅ UPDATE: Handle 'q' parameter for search
const getDiscover = async (req, res, next) => {
    try {
        // Accept 'search' OR 'q' to match frontend
        const { search, q, category, sort } = req.query;
        const searchTerm = search || q; 

        let query = {}; 

        if (searchTerm) {
            query.title = { $regex: searchTerm, $options: 'i' };
        }

        if (category && category !== 'all' && category !== 'All') {
            const catDoc = await Category.findOne({ 
                name: { $regex: new RegExp(`^${category}$`, 'i') } 
            });
            if (catDoc) {
                query.category = catDoc._id;
            }
        }

        let sortOption = { createdAt: -1 }; // Default new
        if (sort === 'popular') {
            sortOption = { views: -1 };
        }

        const results = await Series.find(query)
            .sort(sortOption)
            .populate('category', 'name color')
            .select('title posterUrl coverImage category views seasonCount tags'); // Added coverImage and tags

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