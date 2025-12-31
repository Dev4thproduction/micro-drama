const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // ✅ UPDATE: Change enums to match frontend
  plan: { type: String, enum: ['weekly', 'monthly'], required: true },
  status: { 
    type: String, 
    enum: ['active', 'canceled', 'trial', 'expired'], 
    default: 'active' 
  },
  startDate: { type: Date, default: Date.now },
  renewsAt: { type: Date },
  amount: { type: Number } // Store price (99 or 199)
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);