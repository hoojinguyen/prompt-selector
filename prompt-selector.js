#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');

// Check if prompts.json exists, if not, run the parser first
const jsonPath = path.join(__dirname, 'prompts.json');
if (!fs.existsSync(jsonPath)) {
  console.log('prompts.json not found. Running parser first...');
  require('./parse_prompts.js');
}

// Read the JSON file
const promptsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Terminal UI state
let currentView = 'categories'; // 'categories' or 'prompts'
let selectedCategoryIndex = 0;
let selectedPromptIndex = 0;
let currentCategory = null;

// Setup terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: null, // We'll handle output manually
});

// Enable raw mode to capture key presses
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

// ANSI color codes and styles
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  // Background colors
  bgBlack: '\x1b[40m',
  bgBlue: '\x1b[44m',
  // Special styles
  bold: '\x1b[1m',
  underline: '\x1b[4m',
  reversed: '\x1b[7m'
};

// Clear screen and move cursor to top
function clearScreen() {
  process.stdout.write('\x1Bc');
}

// Create a modern box border with double lines
function createBox(width) {
  const horizontal = '═'.repeat(width - 2);
  const innerHorizontal = '─'.repeat(width - 4);
  return {
    top: `╔${horizontal}╗`,
    middle: `╠${horizontal}╣`,
    bottom: `╚${horizontal}╝`,
    vertical: '║',
    innerTop: `┌${innerHorizontal}┐`,
    innerBottom: `└${innerHorizontal}┘`,
    innerVertical: '│'
  };
}

// Display categories with modern UI
function displayCategories() {
  clearScreen();
  const box = createBox(60);
  
  // Header with gradient effect
  console.log(`${colors.cyan}${colors.bgBlack}${box.top}${colors.reset}`);
  console.log(`${colors.cyan}${box.vertical}${colors.bright}${colors.yellow}${colors.bold}               PROMPT SELECTOR               ${colors.reset}${colors.cyan}${box.vertical}${colors.reset}`);
  console.log(`${colors.cyan}${box.middle}${colors.reset}`);
  
  // Category selection header
  console.log(`${colors.cyan}${box.vertical}${colors.green}${colors.bold} Select a category:${colors.reset}${' '.repeat(40)}${colors.cyan}${box.vertical}${colors.reset}`);
  console.log(`${colors.cyan}${box.vertical}${' '.repeat(58)}${box.vertical}${colors.reset}`);
  
  // Display categories with hover effect
  promptsData.forEach((category, index) => {
    const isSelected = index === selectedCategoryIndex;
    const prefix = isSelected ? `${colors.bright}${colors.yellow}${colors.bold}▶ ` : '  ';
    const categoryStyle = isSelected ? `${colors.bright}${colors.yellow}${colors.bold}` : colors.reset;
    const paddedName = `${prefix}${categoryStyle}${category.name}`;
    
    console.log(`${colors.cyan}${box.vertical}  ${paddedName}${colors.reset}${' '.repeat(Math.max(0, 56 - paddedName.length))}${colors.cyan}${box.vertical}${colors.reset}`);
    
    // Add spacing between categories
    if (index < promptsData.length - 1) {
      console.log(`${colors.cyan}${box.vertical}${' '.repeat(58)}${box.vertical}${colors.reset}`);
    }
  });
  
  // Footer with navigation hints
  console.log(`${colors.cyan}${box.middle}${colors.reset}`);
  console.log(`${colors.cyan}${box.vertical}${colors.dim} Navigation: ${colors.bright}↑↓${colors.dim} | Select: ${colors.bright}Enter${colors.reset}${' '.repeat(25)}${colors.cyan}${box.vertical}${colors.reset}`);
  console.log(`${colors.cyan}${box.vertical}${colors.dim} Exit: ${colors.bright}q${colors.dim} or ${colors.bright}Ctrl+C${colors.reset}${' '.repeat(39)}${colors.cyan}${box.vertical}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bgBlack}${box.bottom}${colors.reset}`);
}

// Word wrap function
function wordWrap(text, maxLength) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length >= maxLength) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  if (currentLine.trim()) lines.push(currentLine.trim());
  return lines;
}

// Display prompts for the selected category with modern UI
function displayPrompts() {
  clearScreen();
  const box = createBox(90);
  
  // Header with category name
  console.log(`${colors.cyan}${colors.bgBlack}${box.top}${colors.reset}`);
  console.log(`${colors.cyan}${box.vertical}${colors.bright}${colors.yellow}${colors.bold} ${currentCategory.name}${' '.repeat(Math.max(0, 87 - currentCategory.name.length))}${colors.reset}${colors.cyan}${box.vertical}${colors.reset}`);
  console.log(`${colors.cyan}${box.middle}${colors.reset}`);
  
  // Display prompts with modern styling
  currentCategory.prompts.forEach((prompt, index) => {
    const isSelected = index === selectedPromptIndex;
    const prefix = isSelected ? `${colors.bright}${colors.yellow}${colors.bold}▶ ` : '  ';
    const promptColor = isSelected ? `${colors.bright}${colors.green}${colors.bold}` : colors.reset;
    
    // Create an inner box for each prompt
    if (isSelected) {
      console.log(`${colors.cyan}${box.vertical}  ${colors.blue}${box.innerTop}${' '.repeat(Math.max(0, 84 - prompt.length))}${colors.cyan}${box.vertical}${colors.reset}`);
    }
    
    // Word wrap the prompt text
    const wrappedLines = wordWrap(prompt, 80);
    
    wrappedLines.forEach((line, lineIndex) => {
      const linePrefix = lineIndex === 0 ? prefix : '  ';
      const padding = ' '.repeat(Math.max(0, 87 - line.length - linePrefix.length));
      console.log(`${colors.cyan}${box.vertical}${colors.reset} ${linePrefix}${promptColor}${line}${colors.reset}${padding}${colors.cyan}${box.vertical}${colors.reset}`);
    });
    
    if (isSelected) {
      console.log(`${colors.cyan}${box.vertical}  ${colors.blue}${box.innerBottom}${' '.repeat(Math.max(0, 84 - prompt.length))}${colors.cyan}${box.vertical}${colors.reset}`);
    }
    
    // Add spacing between prompts
    if (index < currentCategory.prompts.length - 1) {
      console.log(`${colors.cyan}${box.vertical}${' '.repeat(88)}${box.vertical}${colors.reset}`);
    }
  });
  
  // Footer with navigation hints
  console.log(`${colors.cyan}${box.middle}${colors.reset}`);
  console.log(`${colors.cyan}${box.vertical}${colors.dim} Navigation: ${colors.bright}↑↓${colors.dim} | Copy: ${colors.bright}c${colors.dim} | Back: ${colors.bright}←${colors.reset}${' '.repeat(45)}${colors.cyan}${box.vertical}${colors.reset}`);
  console.log(`${colors.cyan}${box.vertical}${colors.dim} Exit: ${colors.bright}q${colors.dim} or ${colors.bright}Ctrl+C${colors.reset}${' '.repeat(69)}${colors.cyan}${box.vertical}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bgBlack}${box.bottom}${colors.reset}`);
}

// Copy text to clipboard
function copyToClipboard(text) {
  let command;
  if (process.platform === 'darwin') { // macOS
    command = `echo ${JSON.stringify(text)} | pbcopy`;
  } else if (process.platform === 'win32') { // Windows
    command = `echo ${JSON.stringify(text)} | clip`;
  } else { // Linux
    command = `echo ${JSON.stringify(text)} | xclip -selection clipboard`;
  }
  
  exec(command, (error) => {
    if (error) {
      const box = createBox(50);
      console.log(`${colors.cyan}${box.top}${colors.reset}`);
      console.log(`${colors.cyan}${box.vertical}${colors.red} ✗ Failed to copy: ${error.message}${' '.repeat(Math.max(0, 47 - error.message.length - 16))}${colors.reset}${colors.cyan}${box.vertical}${colors.reset}`);
      console.log(`${colors.cyan}${box.bottom}${colors.reset}`);
    } else {
      const box = createBox(50);
      console.log(`${colors.cyan}${box.top}${colors.reset}`);
      console.log(`${colors.cyan}${box.vertical}${colors.green} ✓ Prompt copied to clipboard!${' '.repeat(25)}${colors.reset}${colors.cyan}${box.vertical}${colors.reset}`);
      console.log(`${colors.cyan}${box.bottom}${colors.reset}`);
    }
    // Wait a moment before redrawing the screen
    setTimeout(() => {
      displayPrompts();
    }, 1500);
  });
}

// Handle key presses
process.stdin.on('keypress', (str, key) => {
  // Quit on Ctrl+C or q
  if ((key.ctrl && key.name === 'c') || key.name === 'q') {
    process.exit();
  }
  
  if (currentView === 'categories') {
    // Navigate categories
    if (key.name === 'up') {
      selectedCategoryIndex = Math.max(0, selectedCategoryIndex - 1);
      displayCategories();
    } else if (key.name === 'down') {
      selectedCategoryIndex = Math.min(promptsData.length - 1, selectedCategoryIndex + 1);
      displayCategories();
    } else if (key.name === 'return') {
      // Select category and show prompts
      currentCategory = promptsData[selectedCategoryIndex];
      selectedPromptIndex = 0;
      currentView = 'prompts';
      displayPrompts();
    }
  } else if (currentView === 'prompts') {
    // Navigate prompts
    if (key.name === 'up') {
      selectedPromptIndex = Math.max(0, selectedPromptIndex - 1);
      displayPrompts();
    } else if (key.name === 'down') {
      selectedPromptIndex = Math.min(currentCategory.prompts.length - 1, selectedPromptIndex + 1);
      displayPrompts();
    } else if (key.name === 'backspace') {
      // Go back to categories
      currentView = 'categories';
      displayCategories();
    } else if (key.name === 'c') {
      // Copy selected prompt
      const selectedPrompt = currentCategory.prompts[selectedPromptIndex];
      copyToClipboard(selectedPrompt);
    }
  }
});

// Start the app
displayCategories();

// Welcome message
console.log('Loading prompt selector...');