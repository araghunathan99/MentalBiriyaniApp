#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

const CONTENT_DIR = 'client/public/content';
const MEDIA_LIST_PATH = join(CONTENT_DIR, 'media-list.json');

// Check if FFmpeg is installed
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Get video resolution
function getVideoResolution(videoPath) {
  try {
    const output = execSync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${videoPath}"`,
      { encoding: 'utf-8' }
    ).trim();
    const [width, height] = output.split(',').map(Number);
    return { width, height };
  } catch (error) {
    console.error(`Error getting resolution for ${videoPath}:`, error.message);
    return null;
  }
}

// Convert video to MP4 with max 720p
function convertVideo(inputPath, outputPath) {
  try {
    console.log(`  Converting: ${inputPath}`);
    
    // Get current resolution
    const resolution = getVideoResolution(inputPath);
    
    let scaleFilter = '';
    if (resolution) {
      // Determine if we need to scale based on the larger dimension
      const maxDimension = Math.max(resolution.width, resolution.height);
      
      if (maxDimension > 1280) {
        // Scale down if any dimension > 1280 (720p equivalent)
        if (resolution.width > resolution.height) {
          // Landscape: limit width to 1280
          scaleFilter = '-vf scale=1280:-2';
          console.log(`    Downscaling from ${resolution.width}x${resolution.height} to 720p landscape`);
        } else {
          // Portrait/Square: limit height to 1280
          scaleFilter = '-vf scale=-2:1280';
          console.log(`    Downscaling from ${resolution.width}x${resolution.height} to 720p portrait`);
        }
      } else {
        console.log(`    Keeping original resolution (${resolution.width}x${resolution.height})`);
      }
    }
    
    // Convert with H.264 codec, AAC audio, optimized for web
    // Using 'fast' preset for quicker conversion (medium quality/size tradeoff)
    const command = `ffmpeg -i "${inputPath}" ${scaleFilter} -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart "${outputPath}" -y`;
    
    execSync(command, { stdio: 'pipe' });
    console.log(`    ✓ Created: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`    ✗ Error converting ${inputPath}:`, error.message);
    return false;
  }
}

// Update media-list.json
function updateMediaList(conversions) {
  if (conversions.length === 0) {
    console.log('\nNo conversions to update in media-list.json');
    return;
  }

  try {
    const mediaListContent = readFileSync(MEDIA_LIST_PATH, 'utf-8');
    let mediaList = JSON.parse(mediaListContent);
    
    // Handle both array and object formats
    const items = Array.isArray(mediaList) ? mediaList : mediaList.items || [];
    
    let updated = false;
    conversions.forEach(({ oldFile, newFile }) => {
      const item = items.find(i => i.file === oldFile);
      if (item) {
        item.file = newFile;
        item.mimeType = 'video/mp4';
        console.log(`  Updated: ${oldFile} → ${newFile}`);
        updated = true;
      }
    });
    
    if (updated) {
      // Preserve format (array vs object)
      const outputData = Array.isArray(mediaList) ? items : { ...mediaList, items };
      writeFileSync(
        MEDIA_LIST_PATH,
        JSON.stringify(outputData, null, 2),
        'utf-8'
      );
      console.log(`✓ Updated ${MEDIA_LIST_PATH}`);
    }
  } catch (error) {
    console.error('Error updating media-list.json:', error.message);
  }
}

// Main conversion process
async function main() {
  console.log('\n🎬 Video Conversion Script\n');
  console.log('='.repeat(50));
  
  // Check FFmpeg
  if (!checkFFmpeg()) {
    console.error('\n❌ Error: FFmpeg is not installed!');
    console.log('\nPlease install FFmpeg:');
    console.log('  macOS:   brew install ffmpeg');
    console.log('  Ubuntu:  sudo apt install ffmpeg');
    console.log('  Windows: Download from https://ffmpeg.org/download.html');
    console.log('\nOr skip video conversion and use existing files.');
    process.exit(1);
  }
  
  console.log('✓ FFmpeg is installed\n');
  
  // Check if media-list.json exists
  if (!existsSync(MEDIA_LIST_PATH)) {
    console.log('✓ No media-list.json found, skipping conversion');
    process.exit(0);
  }
  
  // Read media list
  const mediaListContent = readFileSync(MEDIA_LIST_PATH, 'utf-8');
  const mediaList = JSON.parse(mediaListContent);
  const items = Array.isArray(mediaList) ? mediaList : mediaList.items || [];
  
  // Find .mov files
  const movFiles = items.filter(item => 
    item.file && item.file.toLowerCase().endsWith('.mov')
  );
  
  if (movFiles.length === 0) {
    console.log('✓ No .mov files found, skipping conversion\n');
    process.exit(0);
  }
  
  console.log(`Found ${movFiles.length} .mov file(s) to convert:\n`);
  
  const conversions = [];
  
  // Convert each video
  for (const item of movFiles) {
    const inputPath = join(CONTENT_DIR, item.file);
    const outputFile = item.file.replace(/\.mov$/i, '.mp4');
    const outputPath = join(CONTENT_DIR, outputFile);
    
    if (!existsSync(inputPath)) {
      console.log(`  ⚠️  Skipping ${item.file} (file not found)`);
      continue;
    }
    
    // Skip if MP4 already exists
    if (existsSync(outputPath)) {
      console.log(`  ✓ ${outputFile} already exists, skipping conversion`);
      conversions.push({ oldFile: item.file, newFile: outputFile });
      continue;
    }
    
    const success = convertVideo(inputPath, outputPath);
    if (success) {
      conversions.push({ oldFile: item.file, newFile: outputFile });
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📝 Updating media-list.json...\n');
  
  // Update media-list.json
  updateMediaList(conversions);
  
  // Optionally delete old .mov files
  console.log('\n🗑️  Cleaning up old .mov files...\n');
  conversions.forEach(({ oldFile }) => {
    const oldPath = join(CONTENT_DIR, oldFile);
    if (existsSync(oldPath)) {
      try {
        unlinkSync(oldPath);
        console.log(`  ✓ Deleted: ${oldFile}`);
      } catch (error) {
        console.log(`  ⚠️  Could not delete: ${oldFile}`);
      }
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Video conversion complete!\n');
  
  if (conversions.length > 0) {
    console.log('Summary:');
    console.log(`  - Converted: ${conversions.length} video(s)`);
    console.log(`  - Format: MP4 (H.264 + AAC)`);
    console.log(`  - Max resolution: 720p`);
    console.log(`  - Optimized for web streaming\n`);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
