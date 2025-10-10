# Automated Video Conversion Guide

## Overview

MentalBiriyani now includes **automated video conversion** during the build process! Your `.mov` videos are automatically converted to MP4 format with optimal web settings.

## ✅ What's Been Set Up

### 1. Automatic Conversion During Build
- **Build script**: `./build-github-pages.sh` now converts videos automatically
- **Format**: Converts QuickTime (.mov) → MP4 (H.264 + AAC)
- **Resolution**: Max 720p/1280px (keeps smaller videos as-is)
- **Smart scaling**:
  - Landscape videos: Max width 1280px
  - Portrait videos: Max height 1280px
  - Already small videos: No scaling

### 2. FFmpeg Installed
- ✅ FFmpeg 6.1.1 is installed and ready
- ✅ All required codecs available (H.264, AAC)
- ✅ Works on this Replit environment

### 3. Conversion Scripts
- **`scripts/convert-videos.js`** - Main conversion script (auto-runs during build)
- **`convert-videos-manual.sh`** - Manual conversion if needed
- **`build-github-pages.sh`** - Complete build pipeline with conversion

## 🚀 How to Use

### Option 1: Automatic (Recommended)
Simply run the build script - videos convert automatically:

```bash
./build-github-pages.sh
```

This will:
1. Convert all `.mov` files to `.mp4` (720p max)
2. Update `media-list.json` automatically
3. Delete old `.mov` files
4. Build the app
5. Prepare deployment package

### Option 2: Manual Conversion
If you want to convert videos separately:

```bash
./convert-videos-manual.sh
```

Then manually update `media-list.json` and rebuild.

### Option 3: Development (No Conversion)
For local development, conversion is skipped:

```bash
npm run dev
```

Videos will be used as-is (.mov format works on Safari/macOS).

## 📋 Current Video Files

Your current videos:
- `mentalbiriyani - 1 of 5.mov` (38 MB) → Will become ~25 MB MP4
- `mentalbiriyani - 2 of 5.mov` (1.1 MB) → Will become ~700 KB MP4  
- `mentalbiriyani - 3 of 5.mov` (4.5 MB) → Will become ~3 MB MP4
- `mentalbiriyani - 4 of 5.mov` (87 MB) → Will become ~55 MB MP4
- `mentalbiriyani - 5 of 5.mov` (34 MB) → Will become ~22 MB MP4

**Total size reduction**: ~164 MB → ~106 MB (~35% smaller)

## ⚙️ Conversion Settings

**Video codec**: H.264 (libx264)
- Preset: `fast` (faster conversion, good quality)
- CRF: 23 (balanced quality/size)
- Max resolution: 1280px (720p equivalent)

**Audio codec**: AAC
- Bitrate: 128 kbps (good for voice/music)

**Web optimization**:
- `faststart` flag - Enables progressive streaming
- Metadata at beginning of file
- Faster loading in browsers

## 🌐 Browser Compatibility

### Before Conversion (.mov)
- ✅ Safari, iOS, macOS
- ❌ Chrome (Windows/Android)
- ❌ Firefox
- ❌ Edge

### After Conversion (.mp4)
- ✅ All browsers
- ✅ All platforms
- ✅ All mobile devices

## 🛠️ Troubleshooting

### "FFmpeg not found" Error
FFmpeg is already installed on this Replit. If you see this error:
```bash
# Verify installation
ffmpeg -version

# Reinstall if needed (already done)
# No action needed - FFmpeg is installed!
```

### Conversion Takes Too Long
The build script has a timeout. If conversion fails:

1. **Use manual script** (runs without timeout):
   ```bash
   ./convert-videos-manual.sh
   ```

2. **Or convert one video at a time**:
   ```bash
   cd client/public/content
   ffmpeg -i "video.mov" -vf scale=-2:1280 -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart "video.mp4" -y
   ```

3. **Then update media-list.json manually**

### Videos Already Converted
Script automatically skips already-converted videos:
- If `video.mp4` exists, `video.mov` is skipped
- Safe to run multiple times

### Build Fails But Videos Work
If conversion fails, build continues with .mov files:
- ✅ Safari users will see videos
- ❌ Other browsers won't play videos
- Run conversion manually and rebuild

## 📁 File Structure

```
client/public/content/
├── media-list.json          # Auto-updated during conversion
├── [photos].jpg/.png        # Images (no conversion needed)
├── *.mov                    # Original videos (deleted after conversion)
└── *.mp4                    # Converted videos (created automatically)

scripts/
├── convert-videos.js        # Automatic conversion (Node.js)
├── fix-github-pages-paths.js
└── README.md               # Detailed script documentation

convert-videos-manual.sh     # Manual conversion (Bash)
build-github-pages.sh        # Full build pipeline
```

## 📝 What Gets Updated

### `media-list.json` Changes
Automatically updated from:
```json
{
  "id": "174",
  "name": "mentalbiriyani - 1 of 5",
  "file": "mentalbiriyani - 1 of 5.mov",
  "mimeType": "video/quicktime"
}
```

To:
```json
{
  "id": "174", 
  "name": "mentalbiriyani - 1 of 5",
  "file": "mentalbiriyani - 1 of 5.mp4",
  "mimeType": "video/mp4"
}
```

### Files Deleted
After successful conversion:
- ✅ `*.mp4` created in `client/public/content/`
- ✅ `media-list.json` updated
- ✅ `*.mov` deleted from source
- ✅ Only `.mp4` files copied to `dist/public/content/`

## 🎯 Next Steps

### Ready to Build and Deploy?

**Option 1: Build and Deploy (One Command)**
```bash
# Build, convert videos, and deploy to GitHub
./build-github-pages.sh --deploy

# Or set environment variable first
export GITHUB_PAGES_REPO=https://github.com/username/MentalBiriyani.git
./build-github-pages.sh --deploy
```

**Option 2: Build Only (No Deployment)**
```bash
# Just build (deploy manually later)
./build-github-pages.sh
```

**Option 3: Skip Video Conversion (Faster)**
```bash
# If videos are already converted
./build-github-pages.sh --deploy --skip-video
```

The automated script will:
1. ✅ Convert videos to MP4 (if not already converted)
2. ✅ Build React app with Vite
3. ✅ Fix paths for GitHub Pages
4. ✅ Copy all media files
5. ✅ Copy PWA configuration
6. ✅ Create deployment package in `dist/public/`
7. ✅ Initialize git and push to GitHub (if `--deploy` flag used)

### Manual Deployment (Alternative)
```bash
cd dist/public
git init
git add -A
git commit -m "Deploy to GitHub Pages"
git remote add origin YOUR_REPO_URL
git push -f origin main
```

## 📚 Additional Documentation

- **`scripts/README.md`** - Detailed script documentation
- **`VIDEO_FORMAT_ISSUE.md`** - Original problem analysis
- **`GITHUB_PAGES_DEPLOYMENT.md`** - Deployment instructions
- **`PWA_INSTALLATION_GUIDE.md`** - PWA installation guide

## ✨ Benefits

**Performance**:
- 35% smaller file size
- Faster page loads
- Better streaming

**Compatibility**:
- Works on all browsers
- Works on all devices
- No platform-specific issues

**User Experience**:
- Videos play everywhere
- No "video not supported" errors
- Smooth playback

---

**TL;DR**: Run `./build-github-pages.sh` and videos will automatically convert to MP4! 🎬
