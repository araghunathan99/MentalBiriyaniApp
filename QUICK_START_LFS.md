# Quick Start: Download LFS Files with curl + GitHub Token

## 🎯 The Problem

Your Git LFS files (videos, audio, Chat.mbox) are showing as 132-byte placeholders instead of actual content. This prevents the app from building properly.

**Total missing content: ~361MB**
- 102 videos (~87MB)
- 24 audio files (~110MB)
- 1 Chat.mbox file (~163MB)

## ✅ The Solution (5 Minutes)

### Step 1: Create GitHub Token

1. Go to: **https://github.com/settings/tokens/new**
2. Token name: `Replit LFS Download`
3. Expiration: `7 days` (or longer)
4. Select scope: ✅ **repo** (Full control of private repositories)
5. Click **"Generate token"**
6. **📋 Copy the token** (you won't see it again!)

### Step 2: Set Token in Replit

In the Replit Shell, run:

```bash
export GITHUB_TOKEN='paste_your_token_here'
```

### Step 3: Download LFS Files

```bash
bash scripts/download-lfs-with-token.sh
```

This will download all LFS files automatically! ⏱️ Takes ~5-10 minutes depending on connection.

### Step 4: Verify Downloads

```bash
bash scripts/check-lfs-status.sh
```

You should see "✅ All LFS files downloaded successfully!"

### Step 5: Build the App

Once files are downloaded:

```bash
./build-github-pages.sh
```

## 🔧 Troubleshooting

### Token permission error
- Make sure you selected the **repo** scope when creating the token
- Try regenerating the token

### Download fails
- Check your internet connection
- Verify the repository URL is correct: `araghunathan99/MentalBiriyani`
- Make sure your GitHub token hasn't expired

### Files still showing as 132 bytes
- The token might not have the right permissions
- Try Option 2 (manual upload) from GIT_LFS_WORKAROUND.md

## 📚 Alternative Options

If the GitHub token method doesn't work, see **GIT_LFS_WORKAROUND.md** for:
- Manual file upload from local machine
- Building/deploying locally
- Using file transfer services

## 🚀 After Download

Once LFS files are downloaded:

1. ✅ Check status: `bash scripts/check-lfs-status.sh`
2. 📝 Generate lists: `python3 scripts/generate-media-lists.py`
3. 🎬 Convert videos: `bash scripts/convert-videos.sh`
4. 📦 Build app: `./build-github-pages.sh`
5. 🌐 Deploy: `bash scripts/deploy-github-pages.sh`

---

**Quick Reference:**
```bash
# Complete workflow
export GITHUB_TOKEN='your_token'
bash scripts/download-lfs-with-token.sh
bash scripts/check-lfs-status.sh
./build-github-pages.sh
bash scripts/deploy-github-pages.sh
```
