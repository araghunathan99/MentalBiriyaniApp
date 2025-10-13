#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'araghunathan99';
const REPO_NAME = 'MentalBiriyaniApp';
const FILE_PATH = 'client/public/content/Chat.mbox';
const OUTPUT_PATH = path.join(__dirname, '../client/public/content/Chat.mbox');

console.log('📥 Downloading Chat.mbox from GitHub LFS...');
console.log('==========================================\n');

function downloadFile() {
  return new Promise((resolve, reject) => {
    // First, get the download URL from GitHub Contents API
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    
    console.log(`📡 Getting LFS download URL from GitHub API...`);
    
    const apiOptions = {
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3.object'
      }
    };
    
    if (GITHUB_TOKEN) {
      apiOptions.headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
      console.log('🔑 Using GitHub token for authentication\n');
    }
    
    https.get(apiUrl, apiOptions, (apiResponse) => {
      let data = '';
      
      apiResponse.on('data', (chunk) => data += chunk);
      apiResponse.on('end', () => {
        if (apiResponse.statusCode !== 200) {
          reject(new Error(`API request failed: ${apiResponse.statusCode} - ${data}`));
          return;
        }
        
        try {
          const apiData = JSON.parse(data);
          let downloadUrl = apiData.download_url;
          
          // If no download_url, try constructing the media URL from the sha
          if (!downloadUrl && apiData.sha) {
            downloadUrl = `https://media.githubusercontent.com/media/${REPO_OWNER}/${REPO_NAME}/${apiData.sha}/${FILE_PATH}`;
          }
          
          if (!downloadUrl) {
            reject(new Error('Could not determine download URL from API response'));
            return;
          }
          
          console.log(`✓ Got download URL`);
          console.log(`📥 Downloading from LFS storage...\n`);
          
          // Now download the actual file
          const downloadOptions = {
            headers: {}
          };
          
          if (GITHUB_TOKEN) {
            downloadOptions.headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
          }
          
          https.get(downloadUrl, downloadOptions, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
              // Follow redirect
              const redirectUrl = response.headers.location;
              console.log(`↪️  Following redirect to LFS storage...\n`);
              
              https.get(redirectUrl, (redirectResponse) => {
                if (redirectResponse.statusCode !== 200) {
                  reject(new Error(`Failed to download: ${redirectResponse.statusCode}`));
                  return;
                }
                
                const fileStream = fs.createWriteStream(OUTPUT_PATH);
                let downloadedBytes = 0;
                const totalBytes = parseInt(redirectResponse.headers['content-length'] || '0');
                
                redirectResponse.on('data', (chunk) => {
                  downloadedBytes += chunk.length;
                  const percent = totalBytes ? ((downloadedBytes / totalBytes) * 100).toFixed(1) : '?';
                  process.stdout.write(`\r📦 Downloading: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB / ${(totalBytes / 1024 / 1024).toFixed(2)} MB (${percent}%)`);
                });
                
                redirectResponse.pipe(fileStream);
                
                fileStream.on('finish', () => {
                  fileStream.close();
                  console.log('\n\n✅ Download complete!');
                  console.log(`   Saved to: ${OUTPUT_PATH}`);
                  console.log(`   Size: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB\n`);
                  resolve();
                });
              }).on('error', reject);
              
            } else if (response.statusCode === 200) {
              // Direct download (no redirect)
              const fileStream = fs.createWriteStream(OUTPUT_PATH);
              let downloadedBytes = 0;
              const totalBytes = parseInt(response.headers['content-length'] || '0');
              
              response.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                const percent = totalBytes ? ((downloadedBytes / totalBytes) * 100).toFixed(1) : '?';
                process.stdout.write(`\r📦 Downloading: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB / ${(totalBytes / 1024 / 1024).toFixed(2)} MB (${percent}%)`);
              });
              
              response.pipe(fileStream);
              
              fileStream.on('finish', () => {
                fileStream.close();
                console.log('\n\n✅ Download complete!');
                console.log(`   Saved to: ${OUTPUT_PATH}`);
                console.log(`   Size: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB\n`);
                resolve();
              });
            } else {
              reject(new Error(`Failed to fetch: ${response.statusCode}`));
            }
          }).on('error', reject);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    if (!GITHUB_TOKEN) {
      console.warn('⚠️  Warning: GITHUB_TOKEN not found. Download may fail for private repos.\n');
    }
    
    await downloadFile();
    console.log('🎉 Success! MBOX file is ready for parsing.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure GITHUB_TOKEN is set');
    console.error('  2. Verify the token has "repo" access');
    console.error('  3. Check that the file exists in the repository');
    process.exit(1);
  }
}

main();
