import '../config/loadEnv';
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI as string;
    const options: mongoose.ConnectOptions = {};

    // authSource admin is for local Docker Mongo only, not Atlas
    if (uri && !uri.startsWith('mongodb+srv://')) {
      options.authSource = 'admin';
    }

    await mongoose.connect(uri, options);

    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log('✓ MongoDB disconnected');
};