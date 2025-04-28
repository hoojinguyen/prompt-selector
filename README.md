# Prompt Selector Tool

A terminal-based tool for managing and selecting prompt templates. This tool allows you to organize prompts by category, browse them through an interactive menu, and copy selected prompts to your clipboard for use with any AI chat service.

## Features

- Browse prompts organized by categories
- Select prompts from an interactive menu
- Automatically copy selected prompts to clipboard
- Add new categories and prompts
- Color-coded interface for better readability
- Cross-platform support (macOS and Linux)

## Requirements

- Bash shell
- Clipboard utility:
  - macOS: `pbcopy` (built-in)
  - Linux: `xclip` or `xsel` (must be installed)

## Installation

1. Clone or download this repository
2. Make the script executable:

```bash
chmod +x prompt-selector.sh
```

## Usage

Run the script from the terminal:

```bash
./prompt-selector.sh
```

### Main Menu

The main menu offers four options:

1. **Browse prompts by category** - Navigate through categories and select a prompt
2. **Add new prompt** - Create a new prompt and assign it to a category
3. **Add new category** - Create a new category for organizing prompts
4. **Exit** - Close the application

### Adding Prompts

When adding a new prompt:

1. Select a category
2. Enter a title for your prompt
3. Enter the prompt content
4. Type `END` on a new line when finished

### Prompt Format

Prompts are stored as text files with the following format:

```
# Prompt Title
Actual prompt content goes here...
Can span multiple lines...
```

The first line starting with `#` is treated as the title and will not be copied to the clipboard when selecting the prompt.

## Directory Structure

```
prompt-selector/
├── prompt-selector.sh     # Main script
├── categories.txt         # List of categories
└── prompts/               # Directory containing prompt files
    ├── Category1/         # Subdirectory for each category
    │   ├── prompt1.txt    # Prompt files
    │   └── prompt2.txt
    └── Category2/
        └── prompt3.txt
```

## Customization

You can customize the tool by directly editing the prompt files in the `prompts/` directory. Each prompt is stored as a text file within its category subdirectory.

## License

This project is open source and available under the MIT License.