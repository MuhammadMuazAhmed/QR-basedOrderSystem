const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(mongoUri);
    console.log(`[db] connected -> ${mongoUri}`);
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    console.error('[db] Is MongoDB running? Check MONGO_URI in your .env file.');
    process.exit(1);
  }
}

module.exports = connectDB;
