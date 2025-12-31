const mongoose = require('mongoose');

const seriesStatuses = ['pending', 'draft', 'published', 'archived'];

const SeriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    
    // ✅ NEW FIELDS
    type: { type: String, enum: ['movie', 'series'], default: 'series' }, 
    videoUrl: { type: String }, // Stores the main video if it's a movie
    category: { type: String }, // Stores the category name directly for simplicity
    
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: seriesStatuses, default: 'pending' },
    tags: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

SeriesSchema.index({ creator: 1 });
SeriesSchema.index({ status: 1 });
SeriesSchema.index({ type: 1 }); // Index for filtering movies/series

module.exports = mongoose.model('Series', SeriesSchema);