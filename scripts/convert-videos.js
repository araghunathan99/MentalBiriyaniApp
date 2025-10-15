#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';

const CONTENT_DIR = 'client/public/content';
const MEDIA_LIST_PATH = join(CONTENT_DIR, 'media-list.json');
const MAX_FILE_SIZE_MB = 50;

// Video formats to convert to MP4
const VIDEO_FORMATS = ['.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.m4v', '.mpeg', '.mpg', '.3gp', '.ogv'];

// Resolution tiers to try (largest to smallest)
const RESOLUTION_TIERS = [
  { name: '720p', maxDimension: 1280 },
  { name: '540p', maxDimension: 960 },
  { name: '480p', maxDimension: 854 },
  { name: '360p', maxDimension: 640 },
  { name: '240p', maxDimension: 426 }
];

// Check if FFmpeg is installed
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Get file size in MB
function getFileSizeMB(filePath) {
  try {
    const stats = statSync(filePath);
    return stats.size / (1024 * 1024); // Convert bytes to MB
  } catch (error) {
    console.error(`Error getting file size for ${filePath}:`, error.message);
    return 0;
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

// Convert video with specific resolution
function convertVideoAtResolution(inputPath, outputPath, maxDimension, resolutionName) {
  try {
    const resolution = getVideoResolution(inputPath);
    
    let scaleFilter = '';
    if (resolution) {
      const currentMaxDimension = Math.max(resolution.width, resolution.height);
      
      if (currentMaxDimension > maxDimension) {
        // Scale down if current dimension > target
        if (resolution.width > resolution.height) {
          // Landscape: limit width
          scaleFilter = `-vf scale=${maxDimension}:-2`;
        } else {
          // Portrait/Square: limit height
          scaleFilter = `-vf scale=-2:${maxDimension}`;
        }
        console.log(`    Scaling from ${resolution.width}x${resolution.height} to ${resolutionName}`);
      } else {
        console.log(`    Using ${resolutionName} (${resolution.width}x${resolution.height})`);
      }
    } else {
      // If we can't get resolution, still apply the scale filter
      scaleFilter = `-vf scale='min(${maxDimension},iw)':-2`;
    }
    
    // Convert with H.264 codec, AAC audio, optimized for web
    const command = `ffmpeg -i "${inputPath}" ${scaleFilter} -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart "${outputPath}" -y`;
    
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`    ✗ Error converting at ${resolutionName}:`, error.message);
    return false;
  }
}

// Convert video and reduce resolution if over 100MB
function convertVideo(inputPath, outputPath) {
  try {
    console.log(`  Converting: ${inputPath}`);
    
    // Try each resolution tier until file is under 100MB
    for (let i = 0; i < RESOLUTION_TIERS.length; i++) {
      const tier = RESOLUTION_TIERS[i];
      const isLastTier = i === RESOLUTION_TIERS.length - 1;
      
      console.log(`    Attempting ${tier.name}...`);
      
      const success = convertVideoAtResolution(inputPath, outputPath, tier.maxDimension, tier.name);
      
      if (!success) {
        console.log(`    ✗ Failed at ${tier.name}`);
        continue;
      }
      
      // Check file size
      const fileSizeMB = getFileSizeMB(outputPath);
      console.log(`    File size: ${fileSizeMB.toFixed(2)} MB`);
      
      if (fileSizeMB <= MAX_FILE_SIZE_MB) {
        console.log(`    ✓ Created: ${outputPath} (${tier.name}, ${fileSizeMB.toFixed(2)} MB)`);
        return true;
      } else if (isLastTier) {
        // Last tier and still over 100MB - keep it anyway with warning
        console.log(`    ⚠️  Warning: File is ${fileSizeMB.toFixed(2)} MB (over ${MAX_FILE_SIZE_MB} MB limit)`);
        console.log(`    ✓ Created: ${outputPath} (${tier.name}, lowest resolution)`);
        return true;
      } else {
        console.log(`    File too large (${fileSizeMB.toFixed(2)} MB > ${MAX_FILE_SIZE_MB} MB), trying lower resolution...`);
        // Continue to next tier
      }
    }
    
    return false;
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
  console.log(`📏 Max file size: ${MAX_FILE_SIZE_MB} MB`);
  console.log(`📊 Resolution tiers: ${RESOLUTION_TIERS.map(t => t.name).join(' → ')}`);
  console.log('='.repeat(50) + '\n');
  
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
  
  // Find all video files
  const allVideoFiles = items.filter(item => {
    if (!item.file) return false;
    const lowerFile = item.file.toLowerCase();
    // Include MP4s and other video formats
    return lowerFile.endsWith('.mp4') || VIDEO_FORMATS.some(ext => lowerFile.endsWith(ext));
  });
  
  if (allVideoFiles.length === 0) {
    console.log('✓ No video files found, skipping conversion\n');
    process.exit(0);
  }
  
  // Separate into videos needing conversion
  const videosToConvert = [];
  const largeMp4s = [];
  
  for (const item of allVideoFiles) {
    const filePath = join(CONTENT_DIR, item.file);
    const lowerFile = item.file.toLowerCase();
    
    if (!existsSync(filePath)) continue;
    
    if (lowerFile.endsWith('.mp4')) {
      // Check if MP4 is over 100MB
      const sizeMB = getFileSizeMB(filePath);
      if (sizeMB > MAX_FILE_SIZE_MB) {
        largeMp4s.push({ item, sizeMB });
      }
    } else {
      // Non-MP4 video formats
      videosToConvert.push(item);
    }
  }
  
  const totalToProcess = videosToConvert.length + largeMp4s.length;
  
  if (totalToProcess === 0) {
    console.log('✓ All videos are already optimized (MP4 under 100MB)\n');
    process.exit(0);
  }
  
  console.log(`Found ${totalToProcess} video file(s) to process:\n`);
  if (videosToConvert.length > 0) {
    const formats = [...new Set(videosToConvert.map(v => v.file.split('.').pop().toUpperCase()))].join(', ');
    console.log(`  - ${videosToConvert.length} non-MP4 videos to convert (${formats})`);
  }
  if (largeMp4s.length > 0) {
    console.log(`  - ${largeMp4s.length} MP4 videos over 100MB to optimize`);
  }
  console.log('');
  
  const conversions = [];
  
  // Convert non-MP4 videos
  for (const item of videosToConvert) {
    const inputPath = join(CONTENT_DIR, item.file);
    const outputFile = item.file.replace(/\.(mov|avi|mkv|webm|flv|wmv|m4v|mpeg|mpg|3gp|ogv)$/i, '.mp4');
    const outputPath = join(CONTENT_DIR, outputFile);
    
    if (!existsSync(inputPath)) {
      console.log(`  ⚠️  Skipping ${item.file} (file not found)`);
      continue;
    }
    
    const success = convertVideo(inputPath, outputPath);
    if (success) {
      conversions.push({ oldFile: item.file, newFile: outputFile });
    }
  }
  
  // Optimize large MP4 files
  for (const { item, sizeMB } of largeMp4s) {
    const inputPath = join(CONTENT_DIR, item.file);
    const tempOutputPath = join(CONTENT_DIR, `temp_optimized_${item.file}`);
    
    console.log(`  Optimizing: ${item.file} (${sizeMB.toFixed(2)} MB)`);
    
    const success = convertVideo(inputPath, tempOutputPath);
    if (success) {
      // Replace original with optimized version
      try {
        unlinkSync(inputPath);
        execSync(`mv "${tempOutputPath}" "${inputPath}"`);
        console.log(`    ✓ Replaced with optimized version`);
        conversions.push({ oldFile: item.file, newFile: item.file }); // Same filename
      } catch (error) {
        console.error(`    ✗ Error replacing file:`, error.message);
        // Clean up temp file
        if (existsSync(tempOutputPath)) {
          unlinkSync(tempOutputPath);
        }
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📝 Updating media-list.json...\n');
  
  // Update media-list.json
  updateMediaList(conversions);
  
  // Delete old non-MP4 video files (don't delete MP4s that were just optimized)
  console.log('\n🗑️  Cleaning up original video files...\n');
  conversions.forEach(({ oldFile, newFile }) => {
    // Only delete if old and new filenames are different (non-MP4 conversions)
    if (oldFile !== newFile) {
      const oldPath = join(CONTENT_DIR, oldFile);
      if (existsSync(oldPath)) {
        try {
          unlinkSync(oldPath);
          console.log(`  ✓ Deleted: ${oldFile}`);
        } catch (error) {
          console.log(`  ⚠️  Could not delete: ${oldFile}`);
        }
      }
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Video conversion complete!\n');
  
  if (conversions.length > 0) {
    console.log('Summary:');
    console.log(`  - Converted: ${conversions.length} video(s)`);
    console.log(`  - Format: MP4 (H.264 + AAC)`);
    console.log(`  - Max file size: ${MAX_FILE_SIZE_MB} MB`);
    console.log(`  - Optimized for web streaming\n`);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
