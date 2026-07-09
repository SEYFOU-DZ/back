const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('⏳ Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:');
    console.error(`   ${error.message}`);
    console.error('\n💡 Please check your MONGODB_URI in .env file');
    process.exit(1);
  }
};

module.exports = connectDB;
