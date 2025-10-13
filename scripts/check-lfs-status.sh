#!/bin/bash

# Check Git LFS file status and report which files are pointers vs actual content

echo "🔍 Checking Git LFS file status..."
echo ""

LFS_POINTERS=0
ACTUAL_FILES=0

# Function to check file size
check_file() {
  local file=$1
  local category=$2
  
  if [ -f "$file" ]; then
    size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null)
    
    if [ "$size" -lt 1000 ]; then
      echo "  ⚠️  $(basename $file) - ${size} bytes (LFS pointer)"
      ((LFS_POINTERS++))
    else
      size_human=$(numfmt --to=iec $size 2>/dev/null || echo "${size} bytes")
      echo "  ✅ $(basename $file) - $size_human"
      ((ACTUAL_FILES++))
    fi
  fi
}

# Check videos
echo "📹 Videos in client/public/content/:"
video_count=0
shopt -s nullglob
for file in client/public/content/*.{mp4,mov,MP4,MOV}; do
  check_file "$file" "video"
  ((video_count++))
done
shopt -u nullglob
[ $video_count -eq 0 ] && echo "  (no video files found)"

echo ""
echo "🎵 Audio files in content/audio/:"
audio_count=0
shopt -s nullglob
for file in content/audio/*.{mp3,wav,MP3,WAV}; do
  check_file "$file" "audio"
  ((audio_count++))
done
shopt -u nullglob
[ $audio_count -eq 0 ] && echo "  (no audio files found)"

echo ""
echo "💬 Chat file:"
if [ -f "content/Chat.mbox" ]; then
  check_file "content/Chat.mbox" "chat"
else
  echo "  (Chat.mbox not found)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary:"
echo "  ✅ Actual files: $ACTUAL_FILES"
echo "  ⚠️  LFS pointers: $LFS_POINTERS"
echo ""

if [ $LFS_POINTERS -gt 0 ]; then
  echo "❌ Git LFS files not downloaded properly!"
  echo ""
  echo "The files showing as LFS pointers (132 bytes) are placeholder files."
  echo "You need to download the actual content to build and deploy the app."
  echo ""
  echo "See GIT_LFS_WORKAROUND.md for solutions:"
  echo "  1. Upload files manually from local machine (recommended)"
  echo "  2. Build and deploy locally where Git LFS works"
  echo "  3. Use file transfer service to get files into Replit"
  echo ""
else
  echo "✅ All LFS files downloaded successfully!"
  echo "You can proceed with building and deploying the app."
  echo ""
fi
