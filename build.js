const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ Error: GEMINI_API_KEY not found in your .env file.');
  process.exit(1);
}

async function build() {
  try {
    // Ensure the source directory exists
    if (!fs.existsSync(srcDir)) {
      console.error(`❌ Error: Source directory not found at ${srcDir}`);
      return;
    }

    // Copy the entire src directory to dist
    await fs.copy(srcDir, distDir);
    console.log('✅ Copied all source files to /dist.');

    // Read the background.js from the new dist directory
    const backgroundJsPath = path.join(distDir, 'background.js');
    let backgroundJsContent = await fs.readFile(backgroundJsPath, 'utf-8');

    // Replace the placeholder with the real API key
    backgroundJsContent = backgroundJsContent.replace('__GEMINI_API_KEY__', apiKey);

    // Write the modified file back to the dist directory
    await fs.writeFile(backgroundJsPath, backgroundJsContent);
    console.log('✅ Injected API key into background.js.');
    console.log('🚀 Build complete! Load the /dist folder into Chrome.');

  } catch (err) {
    console.error('❌ An error occurred during the build process:', err);
  }
}

build();