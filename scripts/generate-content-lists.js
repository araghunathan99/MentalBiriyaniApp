#!/usr/bin/env node

/**
 * Generate content lists (media-list.json and audio-list.json) from content folders
 * This script scans the content directory and creates JSON manifests for the app
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../client/public/content');
const AUDIO_DIR = path.join(CONTENT_DIR, 'audio');
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
  // Audio
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.flac': 'audio/flac',
};

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function isMediaFile(filename) {
  const mimeType = getMimeType(filename);
  return mimeType.startsWith('image/') || mimeType.startsWith('video/');
}

function isAudioFile(filename) {
  const mimeType = getMimeType(filename);
  return mimeType.startsWith('audio/');
}

function getFileStats(filePath) {
  const stats = fs.statSync(filePath);
  return {
    createdTime: stats.birthtime.toISOString(),
    modifiedTime: stats.mtime.toISOString(),
  };
}

/**
 * Generate media-list.json for photos and videos
 */
function generateMediaList() {
  console.log('📸 Scanning content folder for media files...');
  
  const files = fs.readdirSync(CONTENT_DIR);
  const mediaFiles = files.filter(file => {
    const filePath = path.join(CONTENT_DIR, file);
    return fs.statSync(filePath).isFile() && isMediaFile(file);
  });

  const items = mediaFiles.map((file, index) => {
    const filePath = path.join(CONTENT_DIR, file);
    const stats = getFileStats(filePath);
    const mimeType = getMimeType(file);
    const name = path.basename(file, path.extname(file));
    
    // Check if thumbnail exists
    const thumbnailFilename = `${name}_thumb.jpg`;
    const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailFilename);
    const hasThumbnail = fs.existsSync(thumbnailPath);

    return {
      id: String(index + 1),
      name,
      file,
      thumbnail: hasThumbnail ? `thumbnails/${thumbnailFilename}` : null,
      mimeType,
      createdTime: stats.createdTime,
      modifiedTime: stats.modifiedTime,
    };
  });

  const mediaList = {
    version: '2.0.0',
    lastModified: new Date().toISOString(),
    items,
  };

  const outputPath = path.join(CONTENT_DIR, 'media-list.json');
  fs.writeFileSync(outputPath, JSON.stringify(mediaList, null, 2));
  
  console.log(`✅ Generated media-list.json with ${items.length} items`);
  console.log(`   - Photos: ${items.filter(i => i.mimeType.startsWith('image/')).length}`);
  console.log(`   - Videos: ${items.filter(i => i.mimeType.startsWith('video/')).length}`);
}

/**
 * Generate audio-list.json for songs
 */
function generateAudioList() {
  console.log('🎵 Scanning audio folder for song files...');
  
  if (!fs.existsSync(AUDIO_DIR)) {
    console.log('⚠️  Audio directory not found, skipping audio-list.json');
    return;
  }

  const files = fs.readdirSync(AUDIO_DIR);
  const audioFiles = files.filter(file => {
    const filePath = path.join(AUDIO_DIR, file);
    return fs.statSync(filePath).isFile() && isAudioFile(file);
  });

  // Sort alphabetically
  audioFiles.sort();

  const items = audioFiles.map((file, index) => {
    const filePath = path.join(AUDIO_DIR, file);
    const stats = getFileStats(filePath);
    const mimeType = getMimeType(file);
    
    // Extract display name (remove source info like "- Artist (youtube).mp3")
    let displayName = path.basename(file, path.extname(file));
    displayName = displayName
      .replace(/ - [^-]+ \(youtube\)$/i, '')
      .replace(/  /g, ' - ')
      .trim();

    return {
      id: `song-${index}`,
      filename: file,
      displayName,
      mimeType,
      createdTime: stats.createdTime,
      modifiedTime: stats.modifiedTime,
    };
  });

  const audioList = {
    version: '2.0.0',
    lastModified: new Date().toISOString(),
    items,
  };

  const outputPath = path.join(AUDIO_DIR, 'audio-list.json');
  fs.writeFileSync(outputPath, JSON.stringify(audioList, null, 2));
  
  console.log(`✅ Generated audio-list.json with ${items.length} songs`);
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Generating content lists...\n');
  
  try {
    generateMediaList();
    generateAudioList();
    
    console.log('\n✨ Content lists generated successfully!');
  } catch (error) {
    console.error('❌ Error generating content lists:', error);
    process.exit(1);
  }
}

main();
