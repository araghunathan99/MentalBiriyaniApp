# Git LFS Files in Replit - Workaround Guide

## ⚠️ The Problem

Git LFS files cannot be downloaded directly in Replit due to environment restrictions. When you clone a repository with LFS files in Replit, you get 132-byte placeholder files instead of the actual content.

**Affected files in your project:**
- Videos: `.mp4`, `.mov` files (~87MB)
- Audio: `.mp3`, `.wav` files (~110MB)  
- Chat: `Chat.mbox` file (~163MB)
- Total LFS content: ~361MB

## ✅ Solution Options

### Option 1: Download Using GitHub Token (Automated) ⭐

I've created a script that downloads LFS files using GitHub's API with authentication.

**Steps:**

1. **Create a GitHub Personal Access Token:**
   - Go to: https://github.com/settings/tokens/new
   - Name it: "Replit LFS Download"
   - Select scope: `repo` (Full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Set the token in Replit:**
   ```bash
   export GITHUB_TOKEN='your_token_here'
   ```

3. **Run the download script:**
   ```bash
   bash scripts/download-lfs-with-token.sh
   ```

This will automatically download all 102 videos, 24 audio files, and the Chat.mbox file!

### Option 2: Upload Files Manually to Replit

1. **On your local machine**, clone the repository with LFS:
   ```bash
   git clone https://github.com/araghunathan99/MentalBiriyani.git
   cd MentalBiriyani
   git lfs pull  # This downloads all LFS files
   ```

2. **Compress the LFS content folders:**
   ```bash
   # Create archives of the content folders
   tar -czf content.tar.gz client/public/content/
   tar -czf audio.tar.gz content/audio/
   tar -czf chat.tar.gz content/Chat.mbox
   ```

3. **Upload to Replit:**
   - In Replit, use the Files panel
   - Upload `content.tar.gz`, `audio.tar.gz`, and `chat.tar.gz`
   
4. **Extract in Replit:**
   ```bash
   tar -xzf content.tar.gz
   tar -xzf audio.tar.gz
   tar -xzf chat.tar.gz
   rm *.tar.gz  # Clean up archives
   ```

### Option 3: Use a Transfer Service

1. Upload LFS files to a file transfer service (WeTransfer, Dropbox, Google Drive)
2. Download to Replit using `wget` or `curl`
3. Place files in correct directories

### Option 4: Build and Deploy Locally

Instead of building in Replit, build on your local machine where LFS works:

```bash
# On your local machine with LFS files
git clone https://github.com/araghunathan99/MentalBiriyani.git
cd MentalBiriyani
git lfs pull

# Run the build script
./build-github-pages.sh

# Deploy directly
cd dist/public
git init
git add -A
git commit -m "Deploy to GitHub Pages"
git remote add origin https://github.com/araghunathan99/MentalBiriyani.git
git push -f origin main
```

## 🔍 Verify LFS Files

Check if files are actual content or LFS pointers:

```bash
# Check file sizes
ls -lh client/public/content/*.mp4
ls -lh content/audio/*.mp3

# LFS pointer files are ~132 bytes
# Actual files will be much larger (MB range)
```

## 📋 Quick Fix Script

Here's a script to check and report LFS file status:

```bash
#!/bin/bash

echo "Checking Git LFS file status..."
echo ""

# Check videos
echo "Videos in client/public/content/:"
for file in client/public/content/*.{mp4,mov} 2>/dev/null; do
  if [ -f "$file" ]; then
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    if [ "$size" -lt 1000 ]; then
      echo "  ⚠️  $(basename $file) - ${size} bytes (LFS pointer)"
    else
      echo "  ✅ $(basename $file) - $(numfmt --to=iec $size 2>/dev/null || echo ${size})"
    fi
  fi
done

echo ""
echo "Audio files in content/audio/:"
for file in content/audio/*.{mp3,wav} 2>/dev/null; do
  if [ -f "$file" ]; then
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    if [ "$size" -lt 1000 ]; then
      echo "  ⚠️  $(basename $file) - ${size} bytes (LFS pointer)"
    else
      echo "  ✅ $(basename $file) - $(numfmt --to=iec $size 2>/dev/null || echo ${size})"
    fi
  fi
done

echo ""
if [ -f "content/Chat.mbox" ]; then
  size=$(stat -f%z "content/Chat.mbox" 2>/dev/null || stat -c%s "content/Chat.mbox" 2>/dev/null)
  if [ "$size" -lt 1000 ]; then
    echo "Chat.mbox: ⚠️  ${size} bytes (LFS pointer)"
  else
    echo "Chat.mbox: ✅ $(numfmt --to=iec $size 2>/dev/null || echo ${size})"
  fi
fi
```

## 🚀 After Getting Files

Once you have the actual LFS files in Replit:

1. **Regenerate content lists:**
   ```bash
   python3 scripts/generate-media-lists.py
   ```

2. **Convert videos to web format:**
   ```bash
   bash scripts/convert-videos.sh
   ```

3. **Rebuild the app:**
   ```bash
   ./build-github-pages.sh
   ```

4. **Deploy:**
   ```bash
   bash scripts/deploy-github-pages.sh
   ```

## 💡 Why This Happens

- Replit's environment has restricted git permissions
- `git lfs pull` requires specific LFS credentials and hooks
- The LFS smudge filter doesn't run automatically in Replit
- This is a known limitation, not a bug in your code

## 📚 Alternative: Skip LFS in Replit

If you only want to develop in Replit without the full media:

1. Use mock/sample media for development
2. Build and deploy from your local machine where LFS works
3. Or upload just a few sample files for testing

---

**Recommended workflow:**
1. Develop and test in Replit with sample files
2. Build and deploy from local machine with full LFS content
3. Or upload LFS files to Replit using Option 1 above
