// Test MongoDB connection
import dbConnect from '../src/lib/mongodb.js';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await dbConnect();
    console.log('✅ MongoDB connected successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n📋 Troubleshooting steps:');
    console.log('1. Install MongoDB locally: https://www.mongodb.com/docs/manual/installation/');
    console.log('2. Start MongoDB service: mongod');
    console.log('3. Or use MongoDB Atlas: https://www.mongodb.com/atlas');
    console.log('4. Update MONGODB_URI in .env file');
    process.exit(1);
  }
}

testConnection();
