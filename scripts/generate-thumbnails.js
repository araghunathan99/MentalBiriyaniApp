#!/usr/bin/env node

/**
 * Generate thumbnails for all media files (videos and images)
 * Thumbnails are saved to content/thumbnails/ directory
 * - Videos: Extract frame at 3 seconds using FFmpeg
 * - Images: Resize to 400x400 using Sharp
 * - Skips Git LFS pointer files automatically
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../client/public/content');
const THUMBNAILS_DIR = path.join(CONTENT_DIR, 'thumbnails');

// MIME type mapping
const MIME_TYPES = {
  // Images
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  // Videos
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
};

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function isVideoFile(filename) {
  const mimeType = getMimeType(filename);
  return mimeType.startsWith('video/');
}

function isImageFile(filename) {
  const mimeType = getMimeType(filename);
  return mimeType.startsWith('image/');
}

/**
 * Check if a file is a Git LFS pointer file
 */
function isLFSPointer(filePath) {
  try {
    const stats = fs.statSync(filePath);
    // LFS pointers are typically very small (< 200 bytes)
    if (stats.size < 200) {
      const content = fs.readFileSync(filePath, 'utf8');
      // Check if it contains LFS pointer markers
      if (content.includes('version https://git-lfs.github.com/spec/v1')) {
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Generate thumbnail for a video file using FFmpeg
 */
async function generateVideoThumbnail(inputPath, outputPath) {
  // Extract frame at 3 seconds with 400x400 size
  const command = `ffmpeg -ss 00:00:01 -i "${inputPath}" -vf "scale=400:400:force_original_aspect_ratio=decrease,pad=400:400:(ow-iw)/2:(oh-ih)/2" -frames:v 1 -q:v 2 -y "${outputPath}"`;
  
  try {
    await execAsync(command);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to generate thumbnail for ${path.basename(inputPath)}:`, error.message);
    return false;
  }
}

/**
 * Generate thumbnail for an image file using Sharp
 */
async function generateImageThumbnail(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to generate thumbnail for ${path.basename(inputPath)}:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Generating thumbnails for all media files...\n');
  
  // Create thumbnails directory if it doesn't exist
  if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
    console.log(`📁 Created thumbnails directory: ${THUMBNAILS_DIR}\n`);
  }

  // Get all media files
  const files = fs.readdirSync(CONTENT_DIR);
  const mediaFiles = files.filter(file => {
    const filePath = path.join(CONTENT_DIR, file);
    return fs.statSync(filePath).isFile() && (isVideoFile(file) || isImageFile(file));
  });

  if (mediaFiles.length === 0) {
    console.log('⚠️  No media files found in content directory');
    return;
  }

  console.log(`📊 Found ${mediaFiles.length} media files to process\n`);

  let successCount = 0;
  let failCount = 0;
  let lfsSkipCount = 0;

  for (const file of mediaFiles) {
    const inputPath = path.join(CONTENT_DIR, file);
    const baseName = path.basename(file, path.extname(file));
    const outputPath = path.join(THUMBNAILS_DIR, `${baseName}_thumb.jpg`);

    // Check if file is a Git LFS pointer
    if (isLFSPointer(inputPath)) {
      console.log(`   ⏭️  Skipping ${file} (Git LFS pointer - download required)`);
      lfsSkipCount++;
      continue;
    }

    // Skip if thumbnail already exists and is newer than source
    if (fs.existsSync(outputPath)) {
      const sourceStats = fs.statSync(inputPath);
      const thumbStats = fs.statSync(outputPath);
      
      if (thumbStats.mtime > sourceStats.mtime) {
        console.log(`   ⏭️  Skipping ${file} (thumbnail already exists)`);
        successCount++;
        continue;
      }
    }

    console.log(`   🔄 Processing: ${file}`);

    let success = false;
    if (isVideoFile(file)) {
      success = await generateVideoThumbnail(inputPath, outputPath);
    } else if (isImageFile(file)) {
      success = await generateImageThumbnail(inputPath, outputPath);
    }

    if (success) {
      console.log(`   ✅ Generated thumbnail: ${baseName}_thumb.jpg`);
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n✨ Thumbnail generation complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  if (lfsSkipCount > 0) {
    console.log(`   ⏭️  Skipped (Git LFS): ${lfsSkipCount}`);
    console.log(`   💡 Tip: Run 'git lfs pull' to download LFS files for thumbnail generation`);
  }
  if (failCount > 0) {
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   ⚠️  Note: Failed items will fallback to full media in grid view`);
  }
  
  // Don't exit with error if some thumbnails succeeded
  // This allows the build to continue with partial thumbnails
  if (successCount === 0 && failCount > 0) {
    console.error('\n❌ No thumbnails were generated successfully');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
