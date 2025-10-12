#!/usr/bin/env python3

"""
Download Git LFS files
This script checks for and downloads any Git LFS pointer files
"""

import os
import subprocess
import sys

def check_git_lfs():
    """Check if git-lfs is installed"""
    try:
        subprocess.run(['git', 'lfs', 'version'], 
                      stdout=subprocess.PIPE, 
                      stderr=subprocess.PIPE, 
                      check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def download_lfs_files():
    """Download LFS files using git lfs pull"""
    try:
        print("📥 Checking for LFS files...")
        
        # Check if this is a git repository
        if not os.path.exists('.git'):
            print("⚠️  Not a git repository, skipping LFS download")
            return True
        
        # Check if git-lfs is installed
        if not check_git_lfs():
            print("⚠️  Git LFS not installed, skipping LFS download")
            print("   Install with: git lfs install")
            return True
        
        # Pull LFS files
        print("   Downloading LFS files...")
        result = subprocess.run(['git', 'lfs', 'pull'], 
                               capture_output=True, 
                               text=True)
        
        if result.returncode == 0:
            print("✓ LFS files downloaded successfully")
            return True
        else:
            print(f"⚠️  LFS download warning: {result.stderr}")
            return True  # Don't fail the build
            
    except Exception as e:
        print(f"⚠️  LFS download error: {e}")
        return True  # Don't fail the build

if __name__ == '__main__':
    success = download_lfs_files()
    sys.exit(0 if success else 1)
