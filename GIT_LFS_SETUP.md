# Git LFS Setup Guide for MentalBiriyani

## Why Git LFS?

This project contains large media files:
- **163 MB** - Chat.mbox (Google Chat export)
- **110 MB** - Audio folder (23 songs)
- **87 MB** - Video files
- **1.2 MB** - chat-list.json (parsed conversations)

Git LFS (Large File Storage) is essential for:
- ✅ Faster cloning and fetching
- ✅ Reduced repository size
- ✅ Better version control for binary files
- ✅ Improved Git performance

## Setup Instructions

### 1. Install Git LFS

**On macOS:**
```bash
brew install git-lfs
```

**On Ubuntu/Debian:**
```bash
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
sudo apt-get install git-lfs
```

**On Windows:**
Download from: https://git-lfs.github.com/

### 2. Initialize Git LFS

```bash
# Initialize Git LFS in your user account (one-time setup)
git lfs install

# Navigate to your project directory
cd /path/to/MentalBiriyani

# Initialize LFS for this repository
git lfs install --local
```

### 3. Track Large Files

The `.gitattributes` file is already configured to track:

✅ **Video files:** .mp4, .mov, .avi, .mkv, .webm  
✅ **Audio files:** .mp3, .wav, .flac, .m4a, .ogg  
✅ **Archive files:** .mbox  
✅ **Large JSON:** chat-list.json  

**Optional:** To also track large images, uncomment the image lines in `.gitattributes`.

### 4. Migrate Existing Files to LFS

If you already committed large files to Git, migrate them:

```bash
# See what will be migrated
git lfs migrate info --include="*.mp4,*.mp3,*.mbox,client/public/content/chat-list.json"

# Migrate files from all branches
git lfs migrate import --include="*.mp4,*.mp3,*.mbox,client/public/content/chat-list.json" --everything
```

### 5. Verify LFS Tracking

```bash
# List files tracked by LFS
git lfs ls-files

# Check LFS status
git lfs status
```

### 6. Commit and Push

```bash
# Add the .gitattributes file
git add .gitattributes

# Commit your changes
git commit -m "Configure Git LFS for large media files"

# Push to remote (LFS files will be uploaded to LFS server)
git push origin main
```

## Current Large Files

Here's what will be tracked by LFS:

```
163 MB  client/public/content/Chat.mbox
110 MB  client/public/content/audio/ (23 .mp3 files)
 87 MB  client/public/content/WhatsApp Video 2025-10-08 at 07.28.39.mp4
  1.2 MB client/public/content/chat-list.json
```

## GitHub LFS Limits

**Free GitHub accounts:**
- 1 GB storage
- 1 GB/month bandwidth

**Paid accounts:**
- 50 GB storage (GitHub Pro/Team)
- 50 GB/month bandwidth
- Additional packs available

Your current total: **~361 MB** (well within free limits!)

## Troubleshooting

### "This exceeds GitHub's file size limit"
Run: `git lfs migrate import --include="*.mp4,*.mp3,*.mbox" --everything`

### "Git LFS is not supported"
Make sure you've installed Git LFS: `git lfs install`

### Files not tracked
Check `.gitattributes` and run: `git add .gitattributes && git commit`

### Remove file from LFS
```bash
git lfs untrack "*.extension"
git rm --cached file.extension
git add file.extension
git commit -m "Remove file from LFS tracking"
```

## Automated Build Process

Git LFS works seamlessly with the build script:

```bash
# Build and deploy (LFS files are automatically fetched)
./build-github-pages.sh --deploy
```

The deployment script handles:
1. Fetching LFS files automatically
2. Processing media files
3. Deploying to GitHub Pages

## Verifying LFS in CI/CD

If using GitHub Actions or other CI/CD:

```yaml
# Add to your workflow
- name: Checkout code with LFS
  uses: actions/checkout@v3
  with:
    lfs: true
```

## Additional Resources

- [Git LFS Official Docs](https://git-lfs.github.com/)
- [GitHub LFS Guide](https://docs.github.com/en/repositories/working-with-files/managing-large-files)
- [Git LFS Tutorial](https://www.atlassian.com/git/tutorials/git-lfs)

---

**Need Help?** If you encounter issues, check the [Git LFS FAQ](https://github.com/git-lfs/git-lfs/wiki/FAQ)
