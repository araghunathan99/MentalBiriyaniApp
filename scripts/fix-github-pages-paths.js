#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../dist/public');
const indexPath = path.join(distPath, 'index.html');
const assetsPath = path.join(distPath, 'assets');

console.log('Fixing GitHub Pages paths...');

// Fix index.html
console.log('  - Fixing index.html...');
let content = fs.readFileSync(indexPath, 'utf8');
content = content.replace(/src="\/assets\//g, 'src="/MentalBiriyani/assets/');
content = content.replace(/href="\/assets\//g, 'href="/MentalBiriyani/assets/');
fs.writeFileSync(indexPath, content, 'utf8');

// Fix JavaScript bundles
if (fs.existsSync(assetsPath)) {
  const files = fs.readdirSync(assetsPath);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  
  console.log(`  - Fixing ${jsFiles.length} JavaScript bundle(s)...`);
  
  jsFiles.forEach(file => {
    const filePath = path.join(assetsPath, file);
    let jsContent = fs.readFileSync(filePath, 'utf8');
    
    // Replace /assets/ with /MentalBiriyani/assets/ in JS bundles
    // This fixes asset imports like images
    jsContent = jsContent.replace(/["']\/assets\//g, match => {
      return match.replace('/assets/', '/MentalBiriyani/assets/');
    });
    
    fs.writeFileSync(filePath, jsContent, 'utf8');
  });
}

console.log('✓ Fixed all asset paths to use /MentalBiriyani/ base path');
console.log('  - HTML: /MentalBiriyani/assets/...');
console.log('  - JS bundles: /MentalBiriyani/assets/...');
