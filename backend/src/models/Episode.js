const mongoose = require('mongoose');

const EpisodeSchema = new mongoose.Schema({
  series: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: true },
  title: { type: String, required: true, trim: true },
  synopsis: { type: String, default: '' },

  // Important fields used in your controller:
  order: { type: Number, required: true },
  video: { type: String, required: true }, // URL from Cloudinary
  thumbnail: { type: String, default: '' },
  views: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  releaseDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' }
}, { timestamps: true });

// Ensure unique episode numbers per series
EpisodeSchema.index({ series: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Episode', EpisodeSchema);