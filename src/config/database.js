// Database Configuration - Optimized for Netlify Serverless Functions
const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If already connected, don't reconnect
  if (isConnected) {
    return;
  }

  try {
    const mongoURI = process.env.DB_CONNECT_URL || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB connection string not found in environment variables');
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoURI, options);
    
    isConnected = true;
    console.log('MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      isConnected = false;
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      isConnected = true;
    });
    
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Don't exit in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Export both the connect function and mongoose instance
module.exports = connectDB;
module.exports.mongoose = mongoose;
