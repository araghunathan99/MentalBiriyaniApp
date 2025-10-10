# Build Scripts

This directory contains automated scripts for building and deploying MentalBiriyani.

## Scripts Overview

### 1. `convert-videos.js` 🎬

Automatically converts `.mov` videos to `.mp4` format with optimal web settings.

**Features:**
- Converts QuickTime (.mov) to MP4 (H.264 + AAC)
- Downscales to 720p max (keeps smaller videos as-is)
- Optimizes for web streaming (`-movflags +faststart`)
- Auto-updates `media-list.json`
- Removes old `.mov` files after conversion

**Requirements:**
- FFmpeg must be installed

**Usage:**
```bash
# Automatic (runs during build)
./build-github-pages.sh

# Manual
node scripts/convert-videos.js
```

**What it does:**
1. Checks if FFmpeg is installed
2. Scans `client/public/content/media-list.json` for `.mov` files
3. For each video:
   - Checks current resolution
   - Downscales to 720p if height > 720px
   - Converts to MP4 with H.264 codec
   - Optimizes for web streaming
4. Updates `media-list.json` (changes `.mov` → `.mp4`)
5. Deletes old `.mov` files

**FFmpeg Settings:**
- Video codec: H.264 (`libx264`)
- Video quality: CRF 23 (balanced quality/size)
- Preset: medium (good compression/speed balance)
- Audio codec: AAC
- Audio bitrate: 128kbps
- Scale: Max 720p height (preserves aspect ratio)
- Web optimization: `faststart` flag

**Example output:**
```
🎬 Video Conversion Script
==================================================
✓ FFmpeg is installed

Found 5 .mov file(s) to convert:

  Converting: mentalbiriyani - 1 of 5.mov
    Downscaling from 1920x1080 to 720p
    ✓ Created: mentalbiriyani - 1 of 5.mp4
  
  Converting: mentalbiriyani - 2 of 5.mov
    Keeping original resolution (640x360)
    ✓ Created: mentalbiriyani - 2 of 5.mp4

📝 Updating media-list.json...
  Updated: mentalbiriyani - 1 of 5.mov → mentalbiriyani - 1 of 5.mp4
  Updated: mentalbiriyani - 2 of 5.mov → mentalbiriyani - 2 of 5.mp4
✓ Updated client/public/content/media-list.json

🗑️  Cleaning up old .mov files...
  ✓ Deleted: mentalbiriyani - 1 of 5.mov
  ✓ Deleted: mentalbiriyani - 2 of 5.mov

✅ Video conversion complete!

Summary:
  - Converted: 5 video(s)
  - Format: MP4 (H.264 + AAC)
  - Max resolution: 720p
  - Optimized for web streaming
```

### 2. `fix-github-pages-paths.js` 🔧

Fixes asset paths in the built HTML to work with GitHub Pages base path.

**What it does:**
- Reads `dist/public/index.html`
- Prepends `/MentalBiriyani/` to all asset paths
- Required for GitHub Pages deployment at custom path

**Usage:**
```bash
# Runs automatically during build
node scripts/fix-github-pages-paths.js
```

### 3. `build-github-pages.sh` 🚀

Complete automated build pipeline for GitHub Pages deployment.

**Build steps:**
1. **Video Conversion** - Converts .mov to .mp4 (720p max)
2. **Vite Build** - Builds React app
3. **Path Fixing** - Updates paths for GitHub Pages
4. **Media Copy** - Copies content folder
5. **PWA Files** - Copies manifest and icons
6. **Documentation** - Copies deployment guides

**Usage:**
```bash
./build-github-pages.sh
```

**Output:**
- `dist/public/` - Complete deployment package
- Ready to upload to GitHub Pages

## Installing FFmpeg

Video conversion requires FFmpeg.

### macOS (Homebrew)
```bash
brew install ffmpeg
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

### Windows
1. Download from: https://ffmpeg.org/download.html
2. Extract and add to PATH
3. Or use Chocolatey: `choco install ffmpeg`

### Verify Installation
```bash
ffmpeg -version
```

## Manual Video Conversion

If you want to convert videos manually without the script:

```bash
# Single file
ffmpeg -i input.mov -vf scale=-2:720 -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart output.mp4

# All .mov files in directory
cd client/public/content
for file in *.mov; do
  ffmpeg -i "$file" -vf scale=-2:720 -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart "${file%.mov}.mp4" -y
done
```

**Then manually update `media-list.json`:**
1. Change file extensions: `.mov` → `.mp4`
2. Change MIME types: `video/quicktime` → `video/mp4`

## Troubleshooting

### "FFmpeg not found"
- Install FFmpeg (see above)
- Verify with: `ffmpeg -version`
- On Windows, ensure FFmpeg is in PATH

### "Permission denied"
```bash
chmod +x scripts/*.js
chmod +x build-github-pages.sh
```

### "Video already exists, skipping"
- Delete existing `.mp4` files if you want to reconvert
- Or manually run FFmpeg with different settings

### Conversion fails
- Check video file is valid: `ffmpeg -i video.mov`
- Check disk space
- Try with different FFmpeg preset: `-preset fast` or `-preset slow`

## File Size Expectations

**Before (QuickTime .mov):**
- Average: ~33 MB per video
- Total: ~164 MB for 5 videos

**After (MP4 .mp4 @ 720p):**
- Average: ~20 MB per video
- Total: ~100 MB for 5 videos
- **~40% size reduction**

## Browser Compatibility

**Before conversion (.mov):**
- ✅ Safari, iOS, macOS
- ❌ Chrome (Windows/Android)
- ❌ Firefox
- ❌ Edge

**After conversion (.mp4):**
- ✅ Safari (all platforms)
- ✅ Chrome (all platforms)
- ✅ Firefox (all platforms)
- ✅ Edge (all platforms)
- ✅ All mobile browsers

## Development Workflow

### First Time Setup
1. Place videos in `client/public/content/`
2. Create/update `media-list.json`
3. Run: `./build-github-pages.sh`

### Updating Content
1. Add new media to `client/public/content/`
2. Update `media-list.json`
3. Run: `./build-github-pages.sh`
4. Videos will auto-convert on build

### Local Development
```bash
npm run dev
```
Videos will be used as-is (no conversion needed for local dev)

## Notes

- Video conversion only runs during **production builds**
- `.mov` files are preserved in source, deleted from `dist/`
- Conversion is **idempotent** - safe to run multiple times
- Already-converted `.mp4` files are skipped
- Resolution is only reduced if > 720p (smaller videos unchanged)
