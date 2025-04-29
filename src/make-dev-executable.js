
const fs = require('fs');
const path = require('path');

// Make the dev.sh script executable
const scriptPath = path.join(__dirname, 'dev.sh');
try {
  fs.chmodSync(scriptPath, '755');
  console.log('Made dev.sh executable');
} catch (error) {
  console.error('Failed to make dev.sh executable:', error);
}
