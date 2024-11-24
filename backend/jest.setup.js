const { execSync } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.test' });

module.exports = async () => {
  execSync('docker-compose -f docker-compose.test.yml up -d', { stdio: 'inherit' });

  // Wait for MongoDB to be ready
  const uri = process.env.MONGO_URI;
  console.log(`Trying to connect to MongoDB: ${uri}`);
  let connected = false;
  while (!connected) {
    try {
      await mongoose.connect(uri, {});
      connected = true;
      await mongoose.connection.close();
    } catch (err) {
      console.log('Waiting for MongoDB to be ready...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};
