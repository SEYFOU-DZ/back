const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@dark.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   isAdmin: ${existingAdmin.isAdmin}`);
      
      // Delete existing admin to recreate
      console.log('�️  Deleting existing admin...');
      await User.deleteOne({ email: 'admin@dark.com' });
      console.log('✅ Existing admin deleted');
    }

    console.log('🔐 Creating admin user...');
    console.log('ℹ️  Password will be hashed automatically by User model');

    // Create admin user WITHOUT manual hashing (User model will hash it)
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@dark.com',
      password: 'admin123', // Plain password - will be hashed by pre('save')
      isAdmin: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`🔑 Password: admin123`);
    console.log(`🔐 isAdmin: ${admin.isAdmin}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Please change the password after first login!');
    console.log('\n🌐 You can now login at: http://localhost:3000/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:');
    console.error(error.message);
    process.exit(1);
  }
};

createAdmin();
