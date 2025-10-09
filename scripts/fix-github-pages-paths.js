#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.join(__dirname, '../dist/public/index.html');

console.log('Fixing GitHub Pages paths in index.html...');

// Read the index.html file
let content = fs.readFileSync(indexPath, 'utf8');

// Replace absolute asset paths with base path
content = content.replace(/src="\/assets\//g, 'src="/MentalBiriyani/assets/');
content = content.replace(/href="\/assets\//g, 'href="/MentalBiriyani/assets/');

// Write the updated content back
fs.writeFileSync(indexPath, content, 'utf8');

console.log('✓ Fixed asset paths to use /MentalBiriyani/ base path');
console.log('  - Script tags: /MentalBiriyani/assets/...');
console.log('  - Link tags: /MentalBiriyani/assets/...');
