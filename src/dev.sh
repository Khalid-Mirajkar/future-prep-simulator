
#!/bin/bash
# This script runs the development server using local node_modules

# Ensure the script exits if any command fails
set -e

# Navigate to the project root directory
cd ..

# Run Vite using the local configuration
node_modules/.bin/vite --config src/vite.config.local.ts
