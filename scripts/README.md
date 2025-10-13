# Build Scripts

This directory contains automated scripts for building and deploying MentalBiriyani to GitHub Pages.

## Core Scripts

### 1. `generate-content-lists.js` 📋

Automatically scans content folders and generates JSON manifests for dynamic content loading.

**What it does:**
1. Scans `client/public/content/` for photos and videos → creates `media-list.json`
2. Scans `client/public/content/audio/` for songs → creates `audio-list.json`
3. Extracts metadata (MIME types, dates, clean display names)

**Usage:**
```bash
# Run manually
node scripts/generate-content-lists.js

# Automatically runs during build (Step 3/8)
./build-github-pages.sh
```

**Supported Formats:**
- **Images**: .jpg, .jpeg, .png, .gif, .webp, .bmp
- **Videos**: .mp4, .webm, .mov, .avi, .mkv
- **Audio**: .mp3, .wav, .ogg, .m4a, .flac

**Output:**
- `client/public/content/media-list.json` (Photos + Videos)
- `client/public/content/audio/audio-list.json` (Songs)

---

### 2. `parse-chat.js` 💬

Parses Google Chat conversations from MBOX file and extracts conversations between specific participants.

**What it does:**
1. Reads `client/public/content/Chat.mbox` (Google Chat export file)
2. Parses MBOX format to extract individual conversations
3. Filters conversations between Ashwin Raghunathan and Divya Dharshini Chandrasekaran
4. Generates `client/public/content/chat-list.json`

**Usage:**
```bash
# Run manually
node scripts/parse-chat.js

# Automatically runs during build (Step 4/8)
./build-github-pages.sh
```

**Output:**
- `client/public/content/chat-list.json` - Filtered conversations with structured data

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

# Skip during build
./build-github-pages.sh --skip-video
```

---

### 4. `fix-github-pages-paths.js` 🔧

Fixes asset paths in the built HTML to work with GitHub Pages base path.

**What it does:**
- Reads `dist/public/index.html`
- Prepends `/MentalBiriyani/` to all asset paths
- Required for GitHub Pages deployment at custom path

**Usage:**
```bash
# Runs automatically during build (Step 6/8)
node scripts/fix-github-pages-paths.js
```

---

### 5. `add-cache-busting.js` 🔄

Adds version timestamps to assets for cache busting.

**What it does:**
- Adds timestamp query parameters to asset URLs
- Updates service worker cache name with version
- Ensures fresh assets on deployment

**Usage:**
```bash
# Runs automatically during build (Step 8/8)
node scripts/add-cache-busting.js
```

---

### 6. `deploy-github-pages.sh` 🚀

Deploys the built app to GitHub Pages using Git CLI.

**What it does:**
1. Initializes git in `dist/public` (if needed)
2. Adds/updates GitHub remote
3. Stages all files
4. Creates commit with timestamp
5. Force pushes to `main` branch

**Usage:**
```bash
# Deploy after building
bash scripts/deploy-github-pages.sh

# Or use build script with --deploy flag
./build-github-pages.sh --deploy
```

**Environment Variables:**
```bash
export GITHUB_PAGES_REPO=https://github.com/username/MentalBiriyani.git
bash scripts/deploy-github-pages.sh
```

---

## Main Build Script

### `build-github-pages.sh` 🏗️

Complete automated build and deployment pipeline for GitHub Pages.

**Build Steps (8 steps):**
1. **Download LFS Files** - Downloads Git LFS media files
2. **Video Conversion** - Converts .mov to .mp4 (720p max) [Optional: `--skip-video`]
3. **Generate Content Lists** - Creates media-list.json & audio-list.json
4. **Parse Chat** - Extracts conversations from Chat.mbox
5. **Vite Build** - Builds React app
6. **Fix Paths** - Updates paths for GitHub Pages
7. **Copy Assets** - Copies content, manifest, icons
8. **Cache Busting** - Adds version timestamps

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

**Output:**
- `dist/public/` - Complete deployment package
- Ready for GitHub Pages deployment

---

## Git LFS Scripts

### `download-lfs-files.py` 📥

Downloads Git LFS files using Python.

**Usage:**
```bash
python3 scripts/download-lfs-files.py
```

### `download-lfs-with-token.sh` 🔐

Downloads Git LFS files using GitHub Personal Access Token.

**Usage:**
```bash
bash scripts/download-lfs-with-token.sh
```

### `download-lfs-via-curl.sh` 📡

Alternative LFS download method using curl.

**Usage:**
```bash
bash scripts/download-lfs-via-curl.sh
```

### `check-lfs-status.sh` ✅

Verifies LFS file status.

**Usage:**
```bash
bash scripts/check-lfs-status.sh
```

---

## Development Workflow

### First Time Setup
1. Download LFS files: `python3 scripts/download-lfs-files.py`
2. Run build: `./build-github-pages.sh`
3. Deploy: `bash scripts/deploy-github-pages.sh`

### Updating Content
1. Add new media to `client/public/content/`
2. Run: `./build-github-pages.sh`
3. Content lists are auto-generated
4. Videos auto-convert if needed

### Local Development
```bash
npm run dev
```

---

## Troubleshooting

### "FFmpeg not found"
Install FFmpeg:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Verify
ffmpeg -version
```

### "Permission denied"
```bash
chmod +x build-github-pages.sh
chmod +x scripts/*.sh
```

### Skip video conversion for faster builds
```bash
./build-github-pages.sh --skip-video
```
