#!/bin/bash

# Download Git LFS files using GitHub Personal Access Token
# This script uses GitHub's LFS API with authentication

set -e

REPO_OWNER="araghunathan99"
REPO_NAME="MentalBiriyani"
BRANCH="main"

# Check if GitHub token is provided
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Error: GITHUB_TOKEN environment variable not set"
  echo ""
  echo "To use this script, you need a GitHub Personal Access Token."
  echo ""
  echo "Steps:"
  echo "  1. Go to: https://github.com/settings/tokens/new"
  echo "  2. Create a token with 'repo' scope"
  echo "  3. Copy the token"
  echo "  4. Run: export GITHUB_TOKEN='your_token_here'"
  echo "  5. Run this script again"
  echo ""
  exit 1
fi

echo "📥 Downloading Git LFS files from GitHub (authenticated)..."
echo "Repository: ${REPO_OWNER}/${REPO_NAME}"
echo "Branch: ${BRANCH}"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
DOWNLOADED=0
FAILED=0
SKIPPED=0

# Get LFS OID and size from pointer file
get_lfs_info() {
  local file=$1
  local oid=$(grep "oid sha256:" "$file" | cut -d: -f3 | tr -d ' ')
  local size=$(grep "size" "$file" | awk '{print $2}')
  echo "${oid}:${size}"
}

# Download file using GitHub LFS API
download_file() {
  local file_path=$1
  local filename=$(basename "$file_path")
  
  # Check if already downloaded
  if [ -f "$file_path" ]; then
    local current_size=$(stat -c%s "$file_path" 2>/dev/null || stat -f%z "$file_path" 2>/dev/null)
    if [ "$current_size" -gt 1000 ]; then
      echo -e "${YELLOW}⊘${NC} ${filename} - already exists ($(numfmt --to=iec $current_size 2>/dev/null || echo ${current_size} bytes))"
      ((SKIPPED++))
      return 0
    fi
  fi
  
  # Get LFS info
  local lfs_info=$(get_lfs_info "$file_path")
  local oid=$(echo "$lfs_info" | cut -d: -f1)
  local expected_size=$(echo "$lfs_info" | cut -d: -f2)
  
  if [ -z "$oid" ]; then
    echo -e "${RED}✗${NC} ${filename} - Not an LFS file"
    ((FAILED++))
    return 1
  fi
  
  echo -n "  ${filename}... "
  
  # Request download URL from GitHub LFS API
  local lfs_url="https://github.com/${REPO_OWNER}/${REPO_NAME}.git/info/lfs/objects/batch"
  
  local response=$(curl -s -X POST "$lfs_url" \
    -H "Accept: application/vnd.git-lfs+json" \
    -H "Content-Type: application/vnd.git-lfs+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -d "{\"operation\":\"download\",\"transfers\":[\"basic\"],\"objects\":[{\"oid\":\"${oid}\",\"size\":${expected_size}}]}" 2>/dev/null)
  
  # Extract download URL from response
  local download_url=$(echo "$response" | grep -o '"href":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -z "$download_url" ]; then
    echo -e "${RED}✗${NC} No download URL (check token permissions)"
    ((FAILED++))
    return 1
  fi
  
  # Download the actual file
  if curl -f -L -s -o "$file_path" "$download_url" 2>/dev/null; then
    local actual_size=$(stat -c%s "$file_path" 2>/dev/null || stat -f%z "$file_path" 2>/dev/null)
    local size_human=$(numfmt --to=iec $actual_size 2>/dev/null || echo "${actual_size} bytes")
    echo -e "${GREEN}✓${NC} ${size_human}"
    ((DOWNLOADED++))
  else
    echo -e "${RED}✗${NC} Download failed"
    ((FAILED++))
  fi
}

# Process all LFS files
echo "📹 Downloading videos..."
while IFS= read -r file; do
  [ -f "$file" ] && download_file "$file"
done < <(find client/public/content -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.MP4" -o -name "*.MOV" \) 2>/dev/null)

echo ""
echo "🎵 Downloading audio files..."
if [ -d "content/audio" ]; then
  while IFS= read -r file; do
    [ -f "$file" ] && download_file "$file"
  done < <(find content/audio -type f \( -name "*.mp3" -o -name "*.wav" -o -name "*.MP3" -o -name "*.WAV" \) 2>/dev/null)
fi

echo ""
echo "💬 Downloading Chat.mbox..."
[ -f "content/Chat.mbox" ] && download_file "content/Chat.mbox"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Download Summary:"
echo -e "  ${GREEN}✓${NC} Downloaded: $DOWNLOADED files"
echo -e "  ${YELLOW}⊘${NC} Skipped: $SKIPPED files"
echo -e "  ${RED}✗${NC} Failed: $FAILED files"
echo ""

if [ $DOWNLOADED -gt 0 ]; then
  echo -e "${GREEN}✓${NC} Successfully downloaded ${DOWNLOADED} LFS files!"
  echo ""
  echo "Next steps:"
  echo "  1. Verify: bash scripts/check-lfs-status.sh"
  echo "  2. Generate lists: python3 scripts/generate-media-lists.py"
  echo "  3. Convert videos: bash scripts/convert-videos.sh"
  echo "  4. Build: ./build-github-pages.sh"
fi
