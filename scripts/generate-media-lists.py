#!/usr/bin/env python3

"""
Generate media lists (Python wrapper)
This calls the Node.js script that does the actual work
"""

import subprocess
import sys

def main():
    print("📋 Generating media lists...")
    
    try:
        # Call the Node.js script
        result = subprocess.run(['node', 'scripts/generate-content-lists.js'], 
                               capture_output=True, 
                               text=True)
        
        # Print output
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
        
        sys.exit(result.returncode)
        
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
