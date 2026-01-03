const mongoose = require('mongoose');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
const WatchHistory = require('./src/models/WatchHistory');
const Episode = require('./src/models/Episode');

async function seedTestData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/micro-drama');
        console.log("Connected to DB");

        const user = await User.findOne({ role: 'admin' }) || await User.findOne();
        if (!user) {
            console.log("No user found. Please run test-create.js first.");
            process.exit(1);
        }

        const episode = await Episode.findOne();
        if (!episode) {
            console.log("No episode found. Please seed content first.");
            process.exit(1);
        }

        console.log("Seeding WatchHistory and Subscriptions with historical dates...");

        // Dates for last 3 months
        const dates = [
            new Date(), // This month
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last month
            new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
            new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        ];

        for (const date of dates) {
            // Create some watch history entries
            await WatchHistory.create({
                user: user._id,
                episode: episode._id,
                lastWatchedAt: date
            });

            // Create some subscriptions
            await Subscription.create({
                user: user._id,
                plan: Math.random() > 0.5 ? 'weekly' : 'monthly',
                status: 'active',
                startDate: date,
                amount: Math.random() > 0.5 ? 99 : 199
            });
        }

        console.log("✅ Seeded 5 watch entries and 5 subscriptions across different dates.");

        // Test the output labels (simulation)
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        console.log("\nSample labels that will be generated:");
        dates.forEach(d => {
            const monthStr = monthNames[d.getMonth()];
            const weekOfYear = Math.floor((d.getDate() + 6) / 7) + (d.getMonth() * 4); // Very rough week of year
            const weekOfMonth = Math.ceil((d.getDate()) / 7);
            console.log(`Date: ${d.toLocaleDateString()} -> Monthly: ${monthStr} ${d.getFullYear()} | Weekly: ${monthStr} - Week ${weekOfMonth}`);
        });

    } catch (err) {
        console.error("Seed failed:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedTestData();
