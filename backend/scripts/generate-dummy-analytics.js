const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Subscription = require('../src/models/Subscription');

// Load environment variables
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/micro_drama';

const CLOG = (msg) => console.log(`[DummyData] ${msg}`);

function getRandomDate(daysBack) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    return date;
}

async function generateDummyData() {
    try {
        CLOG(`Attempting to connect to MongoDB at: ${MONGO_URI}`);
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        CLOG('Connected to MongoDB...');

        // Constants
        const NUM_USERS = 50;
        const DAYS_BACK = 45; // Cover last month + a bit more
        const PLANS = ['weekly', 'monthly'];
        const STATUSES = ['active', 'active', 'active', 'canceled', 'expired']; // Weight active higher

        // Clear existing dummy data? Maybe not, let's just add to it or ensure we don't duplicate if we re-run logic.
        // For now, let's just append new users to avoid messing up existing real data if any (though likely dev env).

        CLOG(`Generating ${NUM_USERS} users and subscriptions...`);

        const passwordHash = await bcrypt.hash('password123', 10);

        let createdCount = 0;

        for (let i = 0; i < NUM_USERS; i++) {
            const timestamp = new Date().getTime();
            const email = `dummy_user_${timestamp}_${i}@example.com`;

            // Create User
            const user = await User.create({
                email: email,
                passwordHash: passwordHash,
                displayName: `Dummy User ${i}`,
                role: 'viewer',
                status: 'active'
            });

            // Determine Plan
            const plan = PLANS[Math.floor(Math.random() * PLANS.length)];
            const amount = plan === 'weekly' ? 99 : 199;

            // Random Start Date
            const startDate = getRandomDate(DAYS_BACK);

            // Calculate Renews At
            const renewsAt = new Date(startDate);
            if (plan === 'weekly') {
                renewsAt.setDate(renewsAt.getDate() + 7);
            } else {
                renewsAt.setMonth(renewsAt.getMonth() + 1);
            }

            const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];

            // Create Subscription
            await Subscription.create({
                user: user._id,
                plan: plan,
                status: status,
                autoRenew: status === 'active',
                startDate: startDate,
                renewsAt: renewsAt,
                amount: amount,
                // For analytics, we might want createdAt to match startDate to simulate historical signup
                createdAt: startDate,
                updatedAt: startDate
            });

            createdCount++;
        }

        CLOG(`Successfully created ${createdCount} users with subscriptions.`);

        process.exit(0);
    } catch (err) {
        console.error('Error generating data:', err);
        process.exit(1);
    }
}

generateDummyData();
