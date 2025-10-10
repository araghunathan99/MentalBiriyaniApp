#!/bin/bash

# Manual Video Conversion Script
# Converts .mov videos to .mp4 format with 720p max resolution

echo "🎬 Manual Video Conversion for MentalBiriyani"
echo "=============================================="
echo ""

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: FFmpeg is not installed!"
    echo ""
    echo "Please install FFmpeg first:"
    echo "  macOS:   brew install ffmpeg"
    echo "  Ubuntu:  sudo apt install ffmpeg"
    echo "  Windows: Download from https://ffmpeg.org/download.html"
    echo ""
    exit 1
fi

echo "✓ FFmpeg is installed"
echo ""

# Navigate to content directory
cd client/public/content

# Check for .mov files
mov_count=$(ls -1 *.mov 2>/dev/null | wc -l)

if [ $mov_count -eq 0 ]; then
    echo "✓ No .mov files found to convert"
    exit 0
fi

echo "Found $mov_count .mov file(s) to convert"
echo ""

# Convert each video
for file in *.mov; do
    if [ -f "$file" ]; then
        output="${file%.mov}.mp4"
        
        # Skip if already converted
        if [ -f "$output" ]; then
            echo "✓ $output already exists, skipping"
            continue
        fi
        
        echo "Converting: $file"
        
        # Get video resolution
        resolution=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$file" 2>/dev/null)
        width=$(echo $resolution | cut -d',' -f1)
        height=$(echo $resolution | cut -d',' -f2)
        
        # Determine scale filter
        scale_filter=""
        if [ ! -z "$width" ] && [ ! -z "$height" ]; then
            max_dim=$((width > height ? width : height))
            
            if [ $max_dim -gt 1280 ]; then
                if [ $width -gt $height ]; then
                    # Landscape
                    scale_filter="-vf scale=1280:-2"
                    echo "  Downscaling from ${width}x${height} to 720p landscape"
                else
                    # Portrait/Square
                    scale_filter="-vf scale=-2:1280"
                    echo "  Downscaling from ${width}x${height} to 720p portrait"
                fi
            else
                echo "  Keeping original resolution (${width}x${height})"
            fi
        fi
        
        # Convert with progress
        ffmpeg -i "$file" $scale_filter \
               -c:v libx264 -preset fast -crf 23 \
               -c:a aac -b:a 128k \
               -movflags +faststart \
               "$output" -y \
               -loglevel error -stats
        
        if [ $? -eq 0 ]; then
            echo "  ✓ Created: $output"
        else
            echo "  ✗ Error converting $file"
        fi
        echo ""
    fi
done

echo "=============================================="
echo ""
echo "✅ Conversion complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Update media-list.json:"
echo "   - Change all .mov extensions to .mp4"
echo "   - Change mimeType from 'video/quicktime' to 'video/mp4'"
echo ""
echo "2. Delete old .mov files:"
echo "   rm *.mov"
echo ""
echo "3. Rebuild the app:"
echo "   cd ../../.."
echo "   npm run build"
echo ""
echo "Or simply run the automated build:"
echo "   ./build-github-pages.sh"
echo ""
