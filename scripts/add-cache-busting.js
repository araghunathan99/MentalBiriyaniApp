#!/usr/bin/env node

/**
 * Add cache-busting version parameters to built files
 * This ensures browsers always fetch the latest assets
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const indexPath = join(__dirname, '../dist/public/index.html');
const swPath = join(__dirname, '../dist/public/sw.js');

try {
  // Generate version timestamp
  const version = Date.now();
  
  // Read the built index.html
  let html = readFileSync(indexPath, 'utf8');
  
  // Add version parameter to all asset references
  // Match: src="/MentalBiriyani/assets/..." or href="/MentalBiriyani/assets/..."
  html = html.replace(
    /((?:src|href)=["'])([^"']*\/MentalBiriyani\/assets\/[^"'?]+)(["'])/g,
    `$1$2?v=${version}$3`
  );
  
  // Also add version to manifest and service worker
  html = html.replace(
    /((?:src|href)=["'])(\.[^"'?]*\.(?:json|js))(["'])/g,
    `$1$2?v=${version}$3`
  );
  
  // Add version to service worker registration
  html = html.replace(
    /(\.register\(['"])(\.[^'"?]+\.js)(['"]\))/g,
    `$1$2?v=${version}$3`
  );
  
  // Write back
  writeFileSync(indexPath, html, 'utf8');
  
  // Update service worker cache version
  if (readFileSync(swPath, 'utf8')) {
    let sw = readFileSync(swPath, 'utf8');
    sw = sw.replace('__CACHE_VERSION__', version.toString());
    writeFileSync(swPath, sw, 'utf8');
    console.log(`✅ Added cache-busting version: ${version}`);
    console.log(`   Updated: ${indexPath}`);
    console.log(`   Updated service worker: ${swPath}`);
  } else {
    console.log(`✅ Added cache-busting version: ${version}`);
    console.log(`   Updated: ${indexPath}`);
  }
} catch (error) {
  console.error('❌ Error adding cache-busting:', error.message);
  process.exit(1);
}
