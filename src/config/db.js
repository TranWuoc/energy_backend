const mongoose = require('mongoose');

async function connectDB(mongoUri) {
        try {
                await mongoose.connect(mongoUri);
                console.log('[DB] MongoDB connected');
        } catch (err) {
                console.error('[DB] MongoDB connection failed', err.message);
                throw err;
        }
}

module.exports = connectDB;