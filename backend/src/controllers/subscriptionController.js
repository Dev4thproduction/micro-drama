const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendSuccess } = require('../utils/response');

// Get current user's subscription
const getMySubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });
    // If no subscription, return null rather than 404, or handle on frontend
    return sendSuccess(res, subscription || null);
  } catch (err) {
    return next(err);
  }
};

// Subscribe (Mock Payment)
const subscribe = async (req, res, next) => {
  try {
    const { plan } = req.body; 
    const userId = req.user.id;

    // ✅ UPDATE: Validate against new plan types
    if (!['weekly', 'monthly'].includes(plan)) {
      return next({ status: 400, message: 'Invalid plan. Must be weekly or monthly.' });
    }

    let subscription = await Subscription.findOne({ user: userId });

    // Update existing if active
    if (subscription) {
        subscription.plan = plan;
        subscription.status = 'active';
        subscription.renewsAt = new Date(Date.now() + (plan === 'weekly' ? 7 : 30) * 24 * 60 * 60 * 1000);
        await subscription.save();
        return sendSuccess(res, { message: 'Plan updated', subscription });
    }

    // Create new
    const renewsAt = new Date();
    renewsAt.setDate(renewsAt.getDate() + (plan === 'weekly' ? 7 : 30));

    subscription = new Subscription({ 
        user: userId,
        plan,
        status: 'active',
        startDate: new Date(),
        renewsAt
    });

    await subscription.save();

    return sendSuccess(res, { message: 'Subscribed successfully', subscription });
  } catch (err) {
    return next(err);
  }
};

// Cancel Subscription
const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id });
    if (!subscription) return next({ status: 404, message: 'No active subscription found' });

    subscription.status = 'canceled';
    await subscription.save();

    return sendSuccess(res, { message: 'Subscription canceled', subscription });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getMySubscription,
  subscribe,
  cancelSubscription
};