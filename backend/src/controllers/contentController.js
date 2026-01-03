const { Types } = require('mongoose');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const Season = require('../models/Season'); // ✅ Ensure Season model is imported
const Category = require('../models/Category');
const Subscription = require('../models/Subscription');
const { sendSuccess } = require('../utils/response');

// --- HELPER: Map DB fields to Frontend fields ---
const formatEpisode = (episode) => {
  if (!episode) return null;
  const ep = episode.toObject ? episode.toObject() : episode;
  return {
    ...ep,
    // Frontend expects 'videoUrl' and 'thumbnailUrl', DB has 'video' and 'thumbnail'
    videoUrl: ep.video || ep.videoUrl,
    thumbnailUrl: ep.thumbnail || ep.thumbnailUrl,
    // Ensure legacy support if needed
    video: ep.video,
    thumbnail: ep.thumbnail
  };
};

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
      {
        $lookup: {
          from: 'episodes',
          localField: '_id',
          foreignField: 'series',
          as: 'episodeData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creatorData'
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          coverImage: 1,
          tags: 1,
          status: 1,
          createdAt: 1,
          episodeCount: { $size: '$episodeData' },
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
    const userId = req.user?.id;

    if (!Types.ObjectId.isValid(seriesId)) return next({ status: 400, message: 'Invalid ID' });

    const series = await Series.findOne({ _id: seriesId, status: 'published' }).populate('creator', 'displayName');
    if (!series) return next({ status: 404, message: 'Series not found' });

    let isSubscribed = false;
    if (userId) {
      const subscription = await Subscription.findOne({
        user: userId,
        status: { $in: ['active', 'trial'] }
      });
      if (subscription) isSubscribed = true;
    }

    const episodes = await Episode.find({ series: seriesId, status: 'published' }).sort({ order: 1 });

    // ✅ Map DB fields to Frontend fields AND apply locks
    const episodesWithLock = episodes.map(ep => {
      const formatted = formatEpisode(ep);
      formatted.isLocked = !isSubscribed && formatted.order > 2;
      return formatted;
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

    if (episode.order > 2) {
      if (!userId) return next({ status: 403, message: 'Sign in required' });

      const sub = await Subscription.findOne({
        user: userId,
        status: { $in: ['active', 'trial'] }
      });

      if (!sub) return next({ status: 403, message: 'Premium subscription required' });
    }

    // ✅ Return formatted episode
    return sendSuccess(res, formatEpisode(episode));
  } catch (err) { return next(err); }
};

// --- 5. ADMIN: GET ALL SERIES ---
const getAllSeries = async (req, res, next) => {
  try {
    const series = await Series.find().sort({ createdAt: -1 });
    return sendSuccess(res, series);
  } catch (err) {
    return next(err);
  }
};

// --- 6. ADMIN: GET SEASONS ---
const getSeasons = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    const seasons = await Season.find({ series: seriesId }).sort({ number: 1 });
    return sendSuccess(res, seasons);
  } catch (err) {
    return next(err);
  }
};

// --- 7. ADMIN: CREATE SEASON ---
const createSeason = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    const { title, number } = req.body;

    let seasonNumber = number;
    if (!seasonNumber) {
      const lastSeason = await Season.findOne({ series: seriesId }).sort({ number: -1 });
      seasonNumber = (lastSeason?.number || 0) + 1;
    }

    const season = await Season.create({
      series: seriesId,
      title: title || `Season ${seasonNumber}`,
      number: seasonNumber,
      status: 'draft'
    });

    return sendSuccess(res, season);
  } catch (err) {
    return next(err);
  }
};

// --- 8. ADMIN: GET EPISODES (ALL STATUSES) ---
const getAdminEpisodes = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    const episodes = await Episode.find({ series: seriesId }).sort({ order: 1 });
    // ✅ Map for frontend
    const formattedEpisodes = episodes.map(formatEpisode);
    return sendSuccess(res, formattedEpisodes);
  } catch (err) {
    return next(err);
  }
};

// --- 9. ADMIN: CREATE EPISODE ---
const createEpisode = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    // ✅ Map Frontend 'videoUrl' -> DB 'video', 'thumbnailUrl' -> 'thumbnail'
    const { videoUrl, thumbnailUrl, ...rest } = req.body;

    const episodeData = {
      ...rest,
      series: seriesId,
      video: videoUrl || rest.video,
      thumbnail: thumbnailUrl || rest.thumbnail
    };

    const episode = await Episode.create(episodeData);
    return sendSuccess(res, formatEpisode(episode));
  } catch (err) {
    return next(err);
  }
};

// --- 10. UPDATE EPISODE ---
const updateEpisode = async (req, res, next) => {
  try {
    const { id } = req.params;
    // ✅ Map Frontend 'videoUrl' -> DB 'video', 'thumbnailUrl' -> 'thumbnail'
    const { videoUrl, thumbnailUrl, ...rest } = req.body;

    const updateData = { ...rest };
    if (videoUrl) updateData.video = videoUrl;
    if (thumbnailUrl) updateData.thumbnail = thumbnailUrl;

    const updatedEpisode = await Episode.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedEpisode) {
      return next({ status: 404, message: "Episode not found" });
    }

    return sendSuccess(res, formatEpisode(updatedEpisode));
  } catch (error) {
    return next(error);
  }
};

// --- 11. DELETE EPISODE ---
const deleteEpisode = async (req, res, next) => {
  try {
    const { id } = req.params;

    const episode = await Episode.findById(id);
    if (!episode) {
      return next({ status: 404, message: "Episode not found" });
    }

    await Episode.findByIdAndDelete(id);

    return sendSuccess(res, { message: "Episode deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

const listPublishedEpisodes = (req, res, next) => getSeriesDetails(req, res, next);
const listPublishedSeries = (req, res, next) => searchContent(req, res, next);

module.exports = {
  getHomeContent,
  searchContent,
  getSeriesDetails,
  listPublishedEpisodes,
  getEpisodeDetails,
  listPublishedSeries,
  // Admin Functions
  getAllSeries,
  getSeasons,
  createSeason,
  getAdminEpisodes,
  createEpisode,
  updateEpisode,
  deleteEpisode
};