const mongoose = require('mongoose');
const Series = require('./src/models/Series');
const User = require('./src/models/User');
const config = require('./src/config/env');

async function test() {
    try {
        console.log('Connecting to:', config.mongoUri);
        await mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB');

        // Find any user to be the creator
        const user = await User.findOne();
        if (!user) {
            console.error('No user found in DB. Please create one first.');
            process.exit(1);
        }

        console.log('Testing Series creation for user:', user._id, 'Role:', user.role);

        const seriesData = {
            title: 'Test Series ' + Date.now(),
            description: 'Test description',
            category: 'Drama',
            coverImage: 'http://example.com/image.jpg',
            type: 'series',
            creator: user._id,
            status: 'published'
        };

        const newSeries = await Series.create(seriesData);
        console.log('Successfully created series:', newSeries._id);

        await mongoose.disconnect();
    } catch (err) {
        console.error('ERROR DURING SERIES CREATION:', err);
        process.exit(1);
    }
}

test();
