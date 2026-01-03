const mongoose = require('mongoose');
const Series = require('./backend/src/models/Series');
const Episode = require('./backend/src/models/Episode');

async function testAnalytics() {
    try {
        await mongoose.connect('mongodb://localhost:27017/micro-drama'); // Adjust connection string if needed
        console.log("Connected to DB");

        const series = await Series.findOne();
        if (!series) {
            console.log("No series found to test");
            return;
        }

        const initialViews = series.views || 0;
        console.log(`Initial views for "${series.title}": ${initialViews}`);

        await Series.findByIdAndUpdate(series._id, { $inc: { views: 1 } });

        const updatedSeries = await Series.findById(series._id);
        console.log(`Updated views for "${series.title}": ${updatedSeries.views}`);

        if (updatedSeries.views === initialViews + 1) {
            console.log("✅ View increment verified!");
        } else {
            console.log("❌ View increment failed!");
        }

    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

testAnalytics();
