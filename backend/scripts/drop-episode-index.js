const config = require('../src/config/env');
const mongoose = require('mongoose');

const dropIndex = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('Connected to DB');

        const collection = mongoose.connection.collection('episodes');

        // Check if the index exists
        const indexes = await collection.indexes();
        const indexName = 'series_1_order_1';
        const exists = indexes.some(idx => idx.name === indexName);

        if (exists) {
            console.log(`Dropping index: ${indexName}`);
            await collection.dropIndex(indexName);
            console.log('Index dropped successfully');
        } else {
            console.log('Index not found, maybe already dropped.');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

dropIndex();
