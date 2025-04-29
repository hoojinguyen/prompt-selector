# Prompt Selector

A modern, interactive command-line tool for browsing, selecting, and copying AI prompts organized by categories. Perfect for quickly accessing your favorite prompts for AI tools like ChatGPT, Claude, or other LLM-based assistants.

## Features

- 🗂️ Browse prompts organized by categories
- 🔍 Select prompts from an interactive menu
- 📋 Automatically copy selected prompts to clipboard
- 🎨 Beautiful color-coded terminal interface with gradient effects
- 🌐 Cross-platform support (macOS, Windows, and Linux)
- ✨ Modern card-based UI for better readability
- 🔄 Easy to extend with your own prompts

## Requirements

- Node.js (v12 or higher)
- Clipboard utilities (automatically used by the tool):
  - macOS: `pbcopy` (built-in)
  - Windows: `clip` (built-in)
  - Linux: `xclip` (may need to be installed)

## Installation

1. Clone or download this repository
2. Make the script executable (Unix/Linux/macOS):

```bash
chmod +x prompt-selector.js
```

## Usage

Run the script from the terminal:

```bash
./prompt-selector.js
```

Alternatively, you can run it with Node.js directly:

```bash
node prompt-selector.js
```

### Navigating the Interface

1. **Category Selection**:
   - Use the ↑/↓ arrow keys to navigate between categories
   - Press Enter to select a category and view its prompts

2. **Prompt Selection**:
   - Use the ↑/↓ arrow keys to navigate between prompts
   - Press `c` to copy the selected prompt to your clipboard
   - Press Backspace (←) to return to the category selection

3. **Exiting the Tool**:
   - Press `q` or Ctrl+C at any time to exit

### Example Workflow

1. Launch the tool: `./prompt-selector.js`
2. Navigate to a category (e.g., "10 prompts for CODING")
3. Select a prompt that fits your needs
4. Press `c` to copy it to your clipboard
5. Paste the prompt into your AI assistant of choice

## Prompt Structure

The `prompts.json` file contains all available prompts organized by categories. Each category has a name and an array of prompts:

```json
[
  {
    "name": "Category Name",
    "prompts": [
      "Prompt 1 text",
      "Prompt 2 text",
      "Prompt 3 text"
    ]
  },
  {
    "name": "Another Category",
    "prompts": [
      "Another prompt text"
    ]
  }
]
```

### Template Placeholders

Many prompts in the collection use template placeholders that you can replace with specific values when using the prompt with an AI assistant. These placeholders are enclosed in curly braces, for example:

- `{topic}` - Replace with your specific subject matter
- `{programming_language_or_framework}` - Replace with your preferred language or framework
- `{technique/tool}` - Replace with a specific technique or tool name

When you copy a prompt containing these placeholders, you should replace them with your specific values before submitting to an AI assistant.

## Customization

### Adding Your Own Prompts

To add your own prompts, edit the `prompts.json` file:

1. To add a new prompt to an existing category:
   - Find the category in the JSON file
   - Add a new string to the "prompts" array

2. To add a new category:
   - Add a new object to the root array with "name" and "prompts" properties
   - Include your prompts as strings in the "prompts" array

### Customizing the UI

You can customize the UI by modifying the color codes and styles in the `prompt-selector.js` file:

- Look for the `colors` object to change the color scheme
- Modify the `createBox` function to change the border style
- Adjust the width variables to change the size of the UI elements

## Directory Structure

```
prompt-selector/
├── prompt-selector.js  # Main script with UI and functionality
├── prompts.json        # JSON file containing all prompts and categories
└── README.md           # Documentation
```

## License

This project is open source and available under the MIT License.