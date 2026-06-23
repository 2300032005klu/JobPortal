import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from backend/.env');
  }

  try {
    console.log("Trying URI:");
console.log(process.env.MONGODB_URI);

const conn = await mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
});

console.log("Connected successfully");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const atlasNetworkMessage =
      'Could not connect to any servers in your MongoDB Atlas cluster';

    if (error.message.includes(atlasNetworkMessage)) {
      throw new Error(
        `${error.message}\n\n` +
          '[backend] MongoDB Atlas rejected the connection. Add your current public IP address to Atlas Network Access, or temporarily allow 0.0.0.0/0 for development only.'
      );
    }

    throw error;
  }
};

export default connectDB;
