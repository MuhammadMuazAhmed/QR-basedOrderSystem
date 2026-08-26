import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is not set. Add it in your .env.local (dev) or Vercel project env vars (prod).');
}

// Serverless functions can be invoked many times concurrently and are
// frequently re-instantiated. Without caching the connection on the
// global object, every invocation would open a new MongoDB connection
// and quickly exhaust your database's connection limit (this is the
// standard, documented pattern for using Mongoose on Vercel).
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose
      .connect(MONGO_URI, { bufferCommands: false, maxPoolSize: 10 })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
