const { execSync } = require('child_process');

module.exports = async () => {
  execSync('docker-compose -f docker-compose.test.yml down', { stdio: 'inherit' });
};
