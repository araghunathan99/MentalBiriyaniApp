#!/bin/bash

# Download Git LFS files using curl from GitHub's LFS storage
# Parses LFS pointer files to get the actual download URLs

set -e

REPO_OWNER="araghunathan99"
REPO_NAME="MentalBiriyani"
BRANCH="main"

echo "📥 Downloading Git LFS files from GitHub..."
echo "Repository: ${REPO_OWNER}/${REPO_NAME}"
echo "Branch: ${BRANCH}"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
DOWNLOADED=0
FAILED=0
SKIPPED=0

# Function to extract OID from LFS pointer file
get_lfs_oid() {
  local file=$1
  grep "oid sha256:" "$file" | cut -d: -f3 | tr -d ' '
}

# Function to download a file using git-lfs endpoint
download_file() {
  local file_path=$1
  local filename=$(basename "$file_path")
  
  # Check if file already exists and is > 1000 bytes (not a pointer)
  if [ -f "$file_path" ]; then
    size=$(stat -c%s "$file_path" 2>/dev/null || stat -f%z "$file_path" 2>/dev/null)
    if [ "$size" -gt 1000 ]; then
      echo -e "${YELLOW}⊘${NC} ${filename} - already exists ($(numfmt --to=iec $size 2>/dev/null || echo ${size} bytes))"
      ((SKIPPED++))
      return 0
    fi
  fi
  
  # Get the OID from the pointer file
  local oid=$(get_lfs_oid "$file_path")
  
  if [ -z "$oid" ]; then
    echo -e "${RED}✗${NC} ${filename} - Not an LFS pointer file"
    ((FAILED++))
    return 1
  fi
  
  # Try multiple URL patterns
  local urls=(
    "https://github.com/${REPO_OWNER}/${REPO_NAME}.git/info/lfs/objects/${oid}"
    "https://media.githubusercontent.com/media/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${file_path}"
    "https://github.com/${REPO_OWNER}/${REPO_NAME}/raw/${BRANCH}/${file_path}?download=1"
  )
  
  echo -n "  Downloading ${filename}... "
  
  # Try each URL until one works
  local success=0
  for url in "${urls[@]}"; do
    if curl -f -L -s -o "$file_path" "$url" 2>/dev/null; then
      size=$(stat -c%s "$file_path" 2>/dev/null || stat -f%z "$file_path" 2>/dev/null)
      # Check if we got actual content (not another pointer)
      if [ "$size" -gt 1000 ]; then
        size_human=$(numfmt --to=iec $size 2>/dev/null || echo "${size} bytes")
        echo -e "${GREEN}✓${NC} ${size_human}"
        ((DOWNLOADED++))
        success=1
        break
      fi
    fi
  done
  
  if [ $success -eq 0 ]; then
    echo -e "${RED}✗${NC} Failed (OID: ${oid:0:8}...)"
    ((FAILED++))
  fi
}

# Download videos
echo "📹 Downloading videos..."
video_count=0
while IFS= read -r file; do
  if [ -f "$file" ]; then
    download_file "$file"
    ((video_count++))
  fi
done < <(find client/public/content -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.MP4" -o -name "*.MOV" \) 2>/dev/null)

if [ $video_count -eq 0 ]; then
  echo "  (no video files found)"
fi

echo ""
echo "🎵 Downloading audio files..."
audio_count=0
if [ -d "content/audio" ]; then
  while IFS= read -r file; do
    if [ -f "$file" ]; then
      download_file "$file"
      ((audio_count++))
    fi
  done < <(find content/audio -type f \( -name "*.mp3" -o -name "*.wav" -o -name "*.MP3" -o -name "*.WAV" \) 2>/dev/null)
fi

if [ $audio_count -eq 0 ]; then
  echo "  (no audio files found)"
fi

echo ""
echo "💬 Downloading Chat.mbox..."
if [ -f "content/Chat.mbox" ]; then
  download_file "content/Chat.mbox"
else
  echo "  (Chat.mbox not found in repo)"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Download Summary:"
echo -e "  ${GREEN}✓${NC} Downloaded: $DOWNLOADED files"
echo -e "  ${YELLOW}⊘${NC} Skipped: $SKIPPED files (already present)"
echo -e "  ${RED}✗${NC} Failed: $FAILED files"
echo ""

if [ $FAILED -gt 0 ]; then
  echo -e "${YELLOW}⚠${NC} Some files failed to download."
  echo ""
  echo "This happens because GitHub LFS requires authentication for direct downloads."
  echo ""
  echo "Alternative solutions:"
  echo "  1. Use GitHub Personal Access Token (recommended)"
  echo "  2. Upload files manually from local machine"
  echo "  3. Build and deploy from local machine where git lfs works"
  echo ""
  echo "To use a Personal Access Token:"
  echo "  export GITHUB_TOKEN='your_token_here'"
  echo "  bash scripts/download-lfs-with-token.sh"
  echo ""
  exit 1
elif [ $DOWNLOADED -eq 0 ] && [ $SKIPPED -gt 0 ]; then
  echo -e "${GREEN}✓${NC} All LFS files are already present!"
  echo "You can proceed with building the app."
elif [ $DOWNLOADED -gt 0 ]; then
  echo -e "${GREEN}✓${NC} Successfully downloaded LFS files!"
  echo ""
  echo "Next steps:"
  echo "  1. Verify downloads: bash scripts/check-lfs-status.sh"
  echo "  2. Generate content lists: python3 scripts/generate-media-lists.py"
  echo "  3. Convert videos: bash scripts/convert-videos.sh"
  echo "  4. Build app: ./build-github-pages.sh"
fi
echo ""
