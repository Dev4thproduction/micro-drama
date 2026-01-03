const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/User');
const Episode = require('../src/models/Episode');
const Series = require('../src/models/Series');
const WatchHistory = require('../src/models/WatchHistory');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/micro_drama';
const CLOG = (msg) => console.log(`[DummyViews] ${msg}`);

function getRandomDate(daysBack) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    return date;
}

async function generateDummyViews() {
    try {
        CLOG(`Connecting to MongoDB at ${MONGO_URI}...`);
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        CLOG('Connected.');

        const users = await User.find({}).select('_id');
        const episodes = await Episode.find({}).select('_id series');

        if (users.length === 0 || episodes.length === 0) {
            CLOG('❌ No users or episodes found. Please seed basic data first.');
            process.exit(1);
        }

        const NUM_VIEWS = 1000;
        const DAYS_BACK = 30;

        CLOG(`Generating ${NUM_VIEWS} views over the last ${DAYS_BACK} days...`);

        let createdCount = 0;

        for (let i = 0; i < NUM_VIEWS; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const episode = episodes[Math.floor(Math.random() * episodes.length)];
            const watchDate = getRandomDate(DAYS_BACK);

            try {
                // Create WatchHistory
                // We use upsert-like logic implicitly by just trying to create and ignoring dupes if any
                // Or better, check first to be cleaner
                const existing = await WatchHistory.findOne({ user: user._id, episode: episode._id });

                if (!existing) {
                    await WatchHistory.create({
                        user: user._id,
                        episode: episode._id,
                        progressSeconds: Math.floor(Math.random() * 600), // Random progress
                        completed: Math.random() > 0.3, // 70% completed
                        lastWatchedAt: watchDate,
                        createdAt: watchDate, // Match analytics time
                        updatedAt: watchDate
                    });
                    createdCount++;

                    // Update View Counts (Aggregate)
                    await Episode.updateOne({ _id: episode._id }, { $inc: { views: 1 } });
                    await Series.updateOne({ _id: episode.series }, { $inc: { views: 1 } });
                } else {
                    // If exists, maybe update the date to be recent?
                    // For this dummy logic, let's just skip or update 'lastWatchedAt'
                    // verifying duplicates isn't the main goal, volume is.
                    // Let's just update timestamp to scatter it
                    existing.lastWatchedAt = watchDate;
                    await existing.save();
                }

            } catch (err) {
                if (err.code !== 11000) { // Ignore duplicate key errors if we missed the check
                    console.error('Error creating view:', err);
                }
            }

            if (i % 100 === 0) process.stdout.write('.');
        }

        console.log('');
        CLOG(`✅ Processed views. Created ${createdCount} new WatchHistory records.`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Script failed:', err);
        process.exit(1);
    }
}

generateDummyViews();
