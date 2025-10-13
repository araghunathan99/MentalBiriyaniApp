#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MBOX_PATH = path.join(__dirname, '../Chat.mbox');
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

function extractFirstMessageTimestamp(htmlContent) {
  // Try to find timestamp patterns in the HTML content
  // Common formats: "Oct 12, 2023", "2023-10-12", "10/12/2023", etc.
  const patterns = [
    /(\w{3}\s+\d{1,2},\s+\d{4})/,  // Oct 12, 2023
    /(\d{1,2}\/\d{1,2}\/\d{4})/,    // 10/12/2023
    /(\d{4}-\d{2}-\d{2})/,          // 2023-10-12
    /(\w{3}\s+\d{1,2}\s+\d{4})/,    // Oct 12 2023
  ];
  
  for (const pattern of patterns) {
    const match = htmlContent.match(pattern);
    if (match) {
      const date = new Date(match[1]);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
  }
  
  return null;
}

function extractDate(headers) {
  const dateMatch = headers.match(/Date: (.+)/);
  if (dateMatch) {
    const parsedDate = new Date(dateMatch[1]);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  }
  return null;
}

function parseConversation(conversationText) {
  const lines = conversationText.split('\n');
  
  // Extract headers
  const fromMatch = conversationText.match(/From: (.+) <(.+)>/);
  const subjectMatch = conversationText.match(/Subject: (.+)/);
  
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
  
  // Extract date - priority order:
  // 1. First message timestamp from HTML content
  // 2. Email Date header
  // 3. null if no date found (will use numbering instead)
  let dateStr = extractFirstMessageTimestamp(htmlContent);
  if (!dateStr) {
    dateStr = extractDate(conversationText);
  }
  
  // Try to extract year from first message if no date found
  if (!dateStr && messages.length > 0) {
    const yearMatch = messages[0]?.text.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      dateStr = new Date(`Jan 1, ${yearMatch[0]}`).toISOString();
    }
  }
  
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
  
  // Separate conversations with dates and without dates
  const withDates = filtered.filter(conv => conv.date);
  const withoutDates = filtered.filter(conv => !conv.date);
  
  // Sort conversations with dates chronologically (oldest to newest)
  withDates.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Add fallback numbering to conversations without dates
  withoutDates.forEach((conv, index) => {
    conv.conversationNumber = index + 1;
    conv.displayDate = `Conversation ${index + 1}`;
  });
  
  // Combine: dated conversations first (chronologically), then numbered ones
  const sorted = [...withDates, ...withoutDates];
  
  console.log(`✓ Filtered ${sorted.length} conversations with Divya Dharshini Chandrasekaran`);
  console.log(`  - ${withDates.length} with dates (chronologically sorted old→new)`);
  console.log(`  - ${withoutDates.length} without dates (numbered 1, 2, 3...)\n`);
  
  return sorted;
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
      const firstConv = conversations[0];
      console.log(`\n📝 Sample conversation (oldest):`);
      if (firstConv.date) {
        console.log(`   Date: ${new Date(firstConv.date).toLocaleDateString()}`);
      } else if (firstConv.displayDate) {
        console.log(`   Date: ${firstConv.displayDate}`);
      }
      console.log(`   Messages: ${firstConv.messages.length}`);
      console.log(`   First message: "${firstConv.messages[0].text.substring(0, 50)}..."`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
