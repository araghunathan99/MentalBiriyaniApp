#!/bin/bash

# Video conversion wrapper script
# Calls the Node.js conversion script

echo "🎬 Starting video conversion..."

# Run the Node.js conversion script
node scripts/convert-videos.js 2>&1 | tee video-conversion.log

# Check exit code
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "✓ Video conversion completed successfully"
    exit 0
else
    echo "⚠️  Video conversion had errors (see video-conversion.log)"
    exit 1
fi
