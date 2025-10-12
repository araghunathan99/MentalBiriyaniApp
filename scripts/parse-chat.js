#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MBOX_PATH = path.join(__dirname, '../client/public/content/Chat.mbox');
const OUTPUT_PATH = path.join(__dirname, '../client/public/content/chat-list.json');

console.log('📬 Chat Parser - Extracting Ashwin & Divya conversations');
console.log('==================================================\n');

function parseHtmlMessages(htmlContent) {
  const messages = [];
  const regex = /<SPAN><SPAN style="font-weight:bold" dir="ltr">([^<]+)<\/SPAN>: ([^<]+)<\/SPAN>/g;
  let match;
  
  while ((match = regex.exec(htmlContent)) !== null) {
    const sender = match[1].trim();
    const text = match[2].trim();
    messages.push({ sender, text });
  }
  
  return messages;
}

function extractDate(headers) {
  const dateMatch = headers.match(/Date: (.+)/);
  if (dateMatch) {
    return new Date(dateMatch[1]).toISOString();
  }
  return new Date().toISOString();
}

function parseConversation(conversationText) {
  const lines = conversationText.split('\n');
  
  // Extract headers
  const fromMatch = conversationText.match(/From: (.+) <(.+)>/);
  const subjectMatch = conversationText.match(/Subject: (.+)/);
  const dateStr = extractDate(conversationText);
  
  if (!fromMatch) return null;
  
  const fromName = fromMatch[1].trim();
  const fromEmail = fromMatch[2].trim();
  const subject = subjectMatch ? subjectMatch[1].trim() : '';
  
  // Extract HTML section
  const htmlStartIndex = conversationText.indexOf('Content-Type: text/html');
  if (htmlStartIndex === -1) return null;
  
  const htmlSection = conversationText.substring(htmlStartIndex);
  const htmlEndIndex = htmlSection.indexOf('------=_Part_');
  const htmlContent = htmlEndIndex !== -1 ? htmlSection.substring(0, htmlEndIndex) : htmlSection;
  
  // Parse messages from HTML
  const messages = parseHtmlMessages(htmlContent);
  
  if (messages.length === 0) return null;
  
  return {
    fromName,
    fromEmail,
    subject,
    date: dateStr,
    messages
  };
}

function parseMboxFile() {
  console.log(`📖 Reading: ${MBOX_PATH}`);
  
  const content = fs.readFileSync(MBOX_PATH, 'utf-8');
  
  // Split by "From " at the beginning of lines (MBOX format)
  const conversations = content.split(/^From /m).filter(Boolean);
  
  console.log(`✓ Found ${conversations.length} total conversations\n`);
  
  const divyaEmail = 'divya.dharsh@gmail.com';
  const ashwinEmail = 'ashwin99@gmail.com';
  
  const filtered = [];
  
  for (const conv of conversations) {
    const parsed = parseConversation('From ' + conv);
    
    if (!parsed) continue;
    
    // Filter for conversations with Divya
    if (parsed.fromEmail === divyaEmail) {
      filtered.push(parsed);
    }
  }
  
  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  console.log(`✓ Filtered ${filtered.length} conversations with Divya Dharshini Chandrasekaran\n`);
  
  return filtered;
}

function main() {
  try {
    const conversations = parseMboxFile();
    
    const output = {
      totalConversations: conversations.length,
      participants: ['Ashwin Raghunathan', 'Divya Dharshini Chandrasekaran'],
      conversations: conversations
    };
    
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    
    console.log(`✅ Success!`);
    console.log(`   Created: ${OUTPUT_PATH}`);
    console.log(`   Total conversations: ${conversations.length}`);
    
    // Show sample
    if (conversations.length > 0) {
      console.log(`\n📝 Sample conversation (latest):`);
      console.log(`   Date: ${new Date(conversations[0].date).toLocaleDateString()}`);
      console.log(`   Messages: ${conversations[0].messages.length}`);
      console.log(`   First message: "${conversations[0].messages[0].text.substring(0, 50)}..."`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
