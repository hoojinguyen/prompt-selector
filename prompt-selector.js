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
  white: '\x1b[37m',
  // Background colors
  bgBlack: '\x1b[40m',
  bgBlue: '\x1b[44m',
  bgCyan: '\x1b[46m',
  bgMagenta: '\x1b[45m',
  // Special styles
  bold: '\x1b[1m',
  underline: '\x1b[4m',
  reversed: '\x1b[7m',
  // Gradient effect
  gradient: (text) => {
    const gradientColors = [colors.cyan, colors.blue, colors.magenta];
    return text.split('').map((char, i) => 
      gradientColors[i % gradientColors.length] + char
    ).join('');
  }
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
    innerVertical: '│',
    // Add consistent corner characters
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    middleLeft: '╠',
    middleRight: '╣'
  };
}

// Display categories with modern UI
function displayCategories() {
  clearScreen();
  const width = 70;
  const box = createBox(width);
  const contentWidth = width - 2; // Account for left and right borders
  
  // Header with gradient effect
  console.log(`${colors.cyan}${box.top}${colors.reset}`); // Remove bgBlack for consistency
  const title = '✨ PROMPT SELECTOR ✨';
  const gradientTitle = colors.gradient(title);
  const titlePadding = ' '.repeat(Math.floor((contentWidth - title.length) / 2));
  const rightPadding = ' '.repeat(contentWidth - title.length - titlePadding.length);
  console.log(`${colors.cyan}${box.vertical}${titlePadding}${gradientTitle}${rightPadding}${colors.cyan}${box.vertical}${colors.reset}`);
  console.log(`${colors.cyan}${box.middle}${colors.reset}`);
  
  // Category selection header with improved styling
  const categoryHeaderText = ' 📚 Select a category:';
  const categoryHeaderPadding = ' '.repeat(contentWidth - categoryHeaderText.length);
  console.log(`${colors.cyan}${box.vertical}${colors.bright}${colors.white}${colors.bold}${categoryHeaderText}${colors.reset}${categoryHeaderPadding}${colors.cyan}${box.vertical}${colors.reset}`);
  console.log(`${colors.cyan}${box.vertical}${' '.repeat(contentWidth)}${box.vertical}${colors.reset}`);
  
  // Display categories with hover effect
  promptsData.forEach((category, index) => {
    const isSelected = index === selectedCategoryIndex;
    const prefix = isSelected ? `${colors.bright}${colors.yellow}${colors.bold}▶ ` : '  ';
    const categoryStyle = isSelected ? `${colors.bright}${colors.yellow}${colors.bold}` : colors.reset;
    const paddedName = `${prefix}${categoryStyle}${category.name}`;
    
    // Calculate visible length without ANSI codes
    const visibleLength = (isSelected ? '▶ ' : '  ') + category.name;
    const rightPadding = ' '.repeat(Math.max(0, contentWidth - visibleLength.length - 2)); // -2 for the initial spacing
    
    console.log(`${colors.cyan}${box.vertical}  ${paddedName}${colors.reset}${rightPadding}${colors.cyan}${box.vertical}${colors.reset}`);
    
    // Add spacing between categories
    if (index < promptsData.length - 1) {
      console.log(`${colors.cyan}${box.vertical}${' '.repeat(contentWidth)}${box.vertical}${colors.reset}`);
    }
  });
  
  // Footer with navigation hints
  console.log(`${colors.cyan}${box.middle}${colors.reset}`);
  
  // Calculate padding with ANSI color code length compensation
  const navText = `${colors.dim} Navigation: ${colors.bright}↑↓${colors.dim} | Select: ${colors.bright}Enter${colors.reset}`;
  const navVisibleLength = " Navigation: ↑↓ | Select: Enter".length;
  const navPadding = ' '.repeat(contentWidth - navVisibleLength);
  console.log(`${colors.cyan}${box.vertical}${navText}${navPadding}${colors.cyan}${box.vertical}${colors.reset}`);
  
  const exitText = `${colors.dim} Exit: ${colors.bright}q${colors.dim} or ${colors.bright}Ctrl+C${colors.reset}`;
  const exitVisibleLength = " Exit: q or Ctrl+C".length;
  const exitPadding = ' '.repeat(contentWidth - exitVisibleLength);
  console.log(`${colors.cyan}${box.vertical}${exitText}${exitPadding}${colors.cyan}${box.vertical}${colors.reset}`);
  
  console.log(`${colors.cyan}${box.bottom}${colors.reset}`); // Use box.bottom without bgBlack for consistency
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
  const width = 100;
  const box = createBox(width);
  const contentWidth = width - 2; // Account for left and right borders
  const cardWidth = contentWidth - 6; // Account for spacing and card borders
  
  // Header with gradient effect
  console.log(`${colors.cyan}${box.top}${colors.reset}`);
  const categoryTitle = `🔍 ${currentCategory.name}`;
  const gradientCategoryTitle = colors.gradient(categoryTitle);
  const titleRightPadding = ' '.repeat(Math.max(0, contentWidth - categoryTitle.length - 1)); // -1 for the initial space
  console.log(`${colors.cyan}${box.vertical}${colors.bright}${colors.bold} ${gradientCategoryTitle}${colors.reset}${titleRightPadding}${colors.cyan}${box.vertical}${colors.reset}`);
  console.log(`${colors.cyan}${box.middle}${colors.reset}`);
  
  // Display prompts with modern card-based styling
  currentCategory.prompts.forEach((prompt, index) => {
    const isSelected = index === selectedPromptIndex;
    const prefix = isSelected ? `${colors.bright}${colors.yellow}${colors.bold}▶ ` : '  ';
    const promptColor = isSelected ? `${colors.bright}${colors.green}${colors.bold}` : colors.reset;
    
    // Create a modern card-like box for each prompt
    const cardBorder = isSelected ? colors.magenta : colors.blue;
    const cardBg = isSelected ? colors.bgMagenta : '';
    
    // Top border of the card
    console.log(`${colors.cyan}${box.vertical}  ${cardBorder}╭${'─'.repeat(cardWidth)}╮${colors.cyan}${box.vertical}${colors.reset}`);
    
    // Word wrap the prompt text with improved spacing
    const wrappedLines = wordWrap(prompt, cardWidth - 7); // Account for prefix and padding
    
    wrappedLines.forEach((line, lineIndex) => {
      const linePrefix = lineIndex === 0 ? `${prefix}` : '   ';
      const linePadding = ' '.repeat(Math.max(0, cardWidth - line.length - linePrefix.length));
      console.log(`${colors.cyan}${box.vertical} ${cardBorder}│${cardBg}${colors.reset} ${linePrefix}${promptColor}${line}${colors.reset}${linePadding}${cardBorder}│${colors.cyan}${box.vertical}${colors.reset}`);
    });
    
    // Bottom border of the card with prompt number
    const promptNumber = `#${index + 1}/${currentCategory.prompts.length}`;
    console.log(`${colors.cyan}${box.vertical}  ${cardBorder}╰${'─'.repeat(cardWidth - promptNumber.length - 1)}${colors.dim}${promptNumber}${cardBorder}╯${colors.cyan}${box.vertical}${colors.reset}`);
    
    // Add spacing between cards
    if (index < currentCategory.prompts.length - 1) {
      console.log(`${colors.cyan}${box.vertical}${' '.repeat(contentWidth)}${box.vertical}${colors.reset}`);
    }
  });
  
  // Footer with navigation hints
  console.log(`${colors.cyan}${box.middle}${colors.reset}`);
  
  // Navigation line
  const navText = `${colors.dim} Navigation: ${colors.bright}↑↓${colors.dim} | Copy: ${colors.bright}c${colors.dim} | Back: ${colors.bright}←${colors.reset}`;
  const navVisibleLength = " Navigation: ↑↓ | Copy: c | Back: ←".length;
  const navPadding = ' '.repeat(contentWidth - navVisibleLength);
  console.log(`${colors.cyan}${box.vertical}${navText}${navPadding}${colors.cyan}${box.vertical}${colors.reset}`);
  
  // Exit line
  const exitText = `${colors.dim} Exit: ${colors.bright}q${colors.dim} or ${colors.bright}Ctrl+C${colors.reset}`;
  const exitVisibleLength = " Exit: q or Ctrl+C".length;
  const exitPadding = ' '.repeat(contentWidth - exitVisibleLength);
  console.log(`${colors.cyan}${box.vertical}${exitText}${exitPadding}${colors.cyan}${box.vertical}${colors.reset}`);
  
  // Bottom border
  console.log(`${colors.cyan}${box.bottom}${colors.reset}`);
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
      const width = 50;
      const box = createBox(width);
      const contentWidth = width - 2;
      console.log(`${colors.cyan}${box.top}${colors.reset}`);
      const errorMsg = `${colors.red} ✗ Failed to copy: ${error.message}${colors.reset}`;
      const errorVisibleLength = ` ✗ Failed to copy: ${error.message}`.length;
      const errorPadding = ' '.repeat(Math.max(0, contentWidth - errorVisibleLength));
      console.log(`${colors.cyan}${box.vertical}${errorMsg}${errorPadding}${colors.cyan}${box.vertical}${colors.reset}`);
      console.log(`${colors.cyan}${box.bottom}${colors.reset}`);
    } else {
      const width = 50;
      const box = createBox(width);
      const contentWidth = width - 2;
      console.log(`${colors.cyan}${box.top}${colors.reset}`);
      const successMsg = `${colors.green} ✓ Prompt copied to clipboard!${colors.reset}`;
      const successVisibleLength = ` ✓ Prompt copied to clipboard!`.length;
      const successPadding = ' '.repeat(Math.max(0, contentWidth - successVisibleLength));
      console.log(`${colors.cyan}${box.vertical}${successMsg}${successPadding}${colors.cyan}${box.vertical}${colors.reset}`);
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

// Clear the console before starting
clearScreen();

// Start the app
displayCategories();

// Welcome message is not needed as we're clearing the screen