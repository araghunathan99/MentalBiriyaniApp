# Build Scripts

This directory contains automated scripts for building and deploying MentalBiriyani.

## Scripts Overview

### 1. `generate-content-lists.js` 📋

**NEW!** Automatically scans content folders and generates JSON manifests for dynamic content loading.

**What it does:**
1. Scans `client/public/content/` for photos and videos → creates `media-list.json`
2. Scans `client/public/content/audio/` for songs → creates `audio-list.json`
3. Extracts metadata (MIME types, dates, clean display names)

**Usage:**
```bash
# Run manually
node scripts/generate-content-lists.js

# Automatically runs during build (Step 1/9)
./build-github-pages.sh
```

**Adding New Content - No Code Changes Needed!**
1. Add files to appropriate folder:
   - Photos/Videos → `client/public/content/`
   - Songs → `client/public/content/audio/`
2. Rebuild: `./build-github-pages.sh`
3. New content automatically included! ✨

**Supported Formats:**
- **Images**: .jpg, .jpeg, .png, .gif, .webp, .bmp
- **Videos**: .mp4, .webm, .mov, .avi, .mkv
- **Audio**: .mp3, .wav, .ogg, .m4a, .flac

**Output:**
- `client/public/content/media-list.json` (Photos + Videos)
- `client/public/content/audio/audio-list.json` (Songs)

---

### 2. `parse-chat.js` 💬

**NEW!** Parses Google Chat conversations from MBOX file and extracts conversations between specific participants.

**What it does:**
1. Reads `client/public/content/Chat.mbox` (Google Chat export file)
2. Parses MBOX format to extract individual conversations
3. Filters conversations between Ashwin Raghunathan and Divya Dharshini Chandrasekaran
4. Extracts messages from HTML format in each conversation
5. Generates `client/public/content/chat-list.json`

**Usage:**
```bash
# Run manually
node scripts/parse-chat.js

# Automatically runs during build (Step 2/10)
./build-github-pages.sh
```

**Input:**
- `client/public/content/Chat.mbox` - Google Chat export in MBOX format

**Output:**
- `client/public/content/chat-list.json` - Filtered conversations with structured data

**JSON Structure:**
```json
{
  "totalConversations": 458,
  "participants": ["Ashwin Raghunathan", "Divya Dharshini Chandrasekaran"],
  "conversations": [
    {
      "fromName": "Divya Dharshini Chandrasekaran",
      "fromEmail": "divya.dharsh@gmail.com",
      "subject": "Chat with Divya Dharshini Chandrasekaran",
      "date": "2025-10-12T09:04:42.888Z",
      "messages": [
        { "sender": "me", "text": "..." },
        { "sender": "Divya", "text": "..." }
      ]
    }
  ]
}
```

**Features:**
- Parses 6,787 total conversations from MBOX
- Filters to 458 conversations with Divya
- Sorts chronologically (newest first)
- Preserves message sender and text
- Handles HTML parsing and text extraction

---

### 3. `convert-videos.js` 🎬

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

Complete automated build and deployment pipeline for GitHub Pages.

**Features:**
- **Dynamic content generation** (NEW!)
- Automated video conversion (.mov → .mp4)
- Build optimization with Vite
- Path fixing for GitHub Pages base path
- Git repository initialization and deployment
- Interactive or environment-based configuration
- Timestamped commits
- Force push to GitHub

**Build Steps (10 steps):**
1. **Content Generation** - Scans folders and creates media-list.json & audio-list.json
2. **Chat Parsing** - Extracts conversations from Chat.mbox, creates chat-list.json
3. **Video Conversion** - Converts .mov to .mp4 (720p max) [Optional: `--skip-video`]
4. **Vite Build** - Builds React app
5. **Path Fixing** - Updates paths for GitHub Pages
6. **Media Copy** - Copies content folder
7. **PWA Files** - Copies manifest and icons
8. **Cache Busting** - Adds version timestamps
9. **Documentation** - Copies deployment guides
10. **Git Deployment** - Commits and pushes to GitHub [Optional: `--deploy`]

**Usage:**
```bash
# Build only (no deployment)
./build-github-pages.sh

# Build and deploy
./build-github-pages.sh --deploy

# Skip video conversion (faster builds)
./build-github-pages.sh --skip-video

# Combine options
./build-github-pages.sh --deploy --skip-video

# Show help
./build-github-pages.sh --help
```

**Environment Variables:**
```bash
# Set GitHub repository URL
export GITHUB_PAGES_REPO=https://github.com/username/MentalBiriyani.git

# Then deploy
./build-github-pages.sh --deploy
```

**Deployment Process:**
1. Initializes git in `dist/public` (if needed)
2. Prompts for repository URL (if not set via env var)
3. Adds/updates GitHub remote
4. Stages all files
5. Creates commit with timestamp
6. Force pushes to `main` branch
7. Displays deployment status and site URL

**Output:**
- `dist/public/` - Complete deployment package
- Git repository initialized and pushed to GitHub
- Ready for GitHub Pages (enable in Settings → Pages)

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
