const { Types } = require('mongoose');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const Season = require('../models/Season');
const Video = require('../models/Video');
const Category = require('../models/Category');
const { sendSuccess } = require('../utils/response');

// --- 1. CONTENT MANAGEMENT (Movies & Series) ---

const createSeries = async (req, res, next) => {
  try {
    const { title, description, category, coverImage, videoUrl, type } = req.body;
    const creatorId = req.user.id;

    if (!title) return next({ status: 400, message: 'Title is required' });

    const content = await Series.create({
      title,
      description,
      category,
      tags: category ? [category] : [],
      coverImage,
      videoUrl: type === 'movie' ? videoUrl : undefined,
      type: type || 'series',
      creator: creatorId,
      status: 'published' // Auto-publish for CMS admin convenience
    });

    // Create Season 1 by default if it's a series
    if (content.type === 'series') {
      await Season.create({
        series: content._id,
        number: 1,
        title: 'Season 1',
        status: 'published'
      });
    }

    return sendSuccess(res, content);
  } catch (err) {
    console.error("CREATE SERIES ERROR:", err);
    return next({ status: 500, message: `DB Error: ${err.message}` });
  }
};

const listContent = async (req, res, next) => {
  try {
    const { type } = req.query;
    const creatorId = new Types.ObjectId(req.user.id);
    const matchStage = { creator: creatorId };

    if (type) matchStage.type = type;

    // Aggregate to get content + episode count
    const content = await Series.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'episodes',
          localField: '_id',
          foreignField: 'series',
          as: 'episodes'
        }
      },
      {
        $addFields: {
          episodeCount: { $size: '$episodes' }
        }
      },
      {
        $project: {
          episodes: 0, // Don't send full episode list here for performance
          __v: 0
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return sendSuccess(res, content);
  } catch (err) {
    return next(err);
  }
};

// --- 2. EPISODE MANAGEMENT ---

const createEpisode = async (req, res, next) => {
  try {
    const creatorId = req.user.id;
    const { seriesId } = req.params;
    const { title, synopsis, order, releaseDate, video, thumbnail, duration, isFree, seasonId } = req.body;

    console.log(`[CMS] Creating Episode for Series: ${seriesId}`);

    // Validation
    if (!Types.ObjectId.isValid(seriesId)) return next({ status: 400, message: 'Invalid seriesId' });
    if (!title) return next({ status: 400, message: 'Title is required' });
    if (!video) return next({ status: 400, message: 'Video URL is required' });

    // Check Series Exists & Ownership
    const series = await Series.findById(seriesId);
    if (!series) return next({ status: 404, message: 'Series not found' });
    if (series.creator.toString() !== creatorId) return next({ status: 403, message: 'Access denied' });

    // If seasonId is provided, verify it belongs to this series
    let finalSeasonId = seasonId;
    if (finalSeasonId) {
      const season = await Season.findOne({ _id: finalSeasonId, series: seriesId });
      if (!season) return next({ status: 400, message: 'Invalid season for this series' });
    } else {
      // Default to Season 1 if it exists
      const season1 = await Season.findOne({ series: seriesId, number: 1 });
      if (season1) {
        finalSeasonId = season1._id;
      }
    }

    // Create Episode
    const episode = await Episode.create({
      series: seriesId,
      season: finalSeasonId || null,
      title,
      synopsis,
      order: Number(order) || 1, // Ensure number
      releaseDate: releaseDate || Date.now(),
      video, // URL from Cloudinary
      thumbnail: thumbnail || series.coverImage, // Fallback to series cover
      duration: Number(duration) || 0,
      isFree: isFree === true || isFree === 'true',
      status: 'published'
    });

    return sendSuccess(res, episode);
  } catch (err) {
    console.error("CREATE EPISODE ERROR:", err);
    // Handle Duplicate Key Error (Unique Episode Number)
    if (err.code === 11000) {
      return next({ status: 400, message: `Episode number ${req.body.order} already exists in this season/series.` });
    }
    return next(err);
  }
};

const listEpisodes = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    // Validate ID format first
    if (!Types.ObjectId.isValid(seriesId)) return next({ status: 400, message: 'Invalid Series ID' });

    const episodes = await Episode.find({ series: seriesId }).sort({ order: 1 });
    return sendSuccess(res, episodes);
  } catch (err) {
    return next(err);
  }
};

// --- 3. CATEGORY MANAGEMENT ---

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return sendSuccess(res, categories);
  } catch (err) {
    return next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return next({ status: 400, message: 'Category name is required' });

    // Check duplicates
    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) return next({ status: 400, message: 'Category already exists' });

    const category = await Category.create({ name });
    return sendSuccess(res, category);
  } catch (err) {
    return next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    return sendSuccess(res, { message: 'Category deleted' });
  } catch (err) {
    return next(err);
  }
};

// --- 4. VIDEO ASSET MANAGEMENT (Legacy/Optional) ---

const createVideo = async (req, res, next) => {
  try {
    const { url, duration } = req.body;
    const video = await Video.create({
      owner: req.user.id,
      url,
      duration,
      status: 'ready'
    });
    return sendSuccess(res, video);
  } catch (err) {
    return next(err);
  }
};

const listVideos = async (req, res, next) => {
  try {
    const videos = await Video.find({ owner: req.user.id }).sort({ createdAt: -1 });
    return sendSuccess(res, videos);
  } catch (err) {
    return next(err);
  }
};

// ... existing imports

// --- UPDATE SERIES ---
const updateSeries = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    const { title, description, category, coverImage } = req.body;
    const creatorId = req.user.id;

    // 1. Find the Series
    const series = await Series.findById(seriesId);
    if (!series) return next({ status: 404, message: 'Series not found' });

    // 2. Check Ownership
    if (series.creator.toString() !== creatorId) {
      return next({ status: 403, message: 'Access denied' });
    }

    // 3. Update Fields
    if (title) series.title = title;
    if (description) series.description = description;
    if (category) {
      series.category = category;
      series.tags = [category]; // Update tags too to match category
    }
    if (coverImage) series.coverImage = coverImage;

    await series.save();

    return sendSuccess(res, series);
  } catch (err) {
    return next(err);
  }
};

// ... keep other functions
// ... existing imports

// --- DELETE SERIES ---
const deleteSeries = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    const creatorId = req.user.id;

    // 1. Find the Series
    const series = await Series.findById(seriesId);
    if (!series) return next({ status: 404, message: 'Series not found' });

    // 2. Check Ownership
    if (series.creator.toString() !== creatorId) {
      return next({ status: 403, message: 'Access denied' });
    }

    // 3. Delete Series
    await Series.findByIdAndDelete(seriesId);

    // Optional: Delete all episodes associated with this series
    await Episode.deleteMany({ series: seriesId });

    return sendSuccess(res, { message: 'Series deleted successfully' });
  } catch (err) {
    return next(err);
  }
};

// Export it!
module.exports = {
  createSeries,
  listContent,
  createEpisode,
  listEpisodes,
  createVideo,
  listVideos,
  getCategories,
  createCategory,
  deleteCategory,
  updateSeries,
  deleteSeries, // <--- Add this new function
};
