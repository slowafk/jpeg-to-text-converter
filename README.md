# JPEG to Text Converter

A desktop application that extracts tags from image files' Windows properties and saves them as text files.

## Features

- Select individual image files or entire folders
- Extract tags from Windows file properties (Comments, Tags, and Keywords)
- Choose custom output location for text files
- Process multiple files at once with progress tracking
- Supports .jpg, .jpeg, and .png files
- Visual feedback with success/warning/error status for each file

## Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed on your computer
2. Clone or download this repository
3. Open a terminal in the project directory
4. Install dependencies:
```bash
npm install
```

## Usage

1. Start the application:
```bash
npm start
```

2. Using the application:
   - Click "Select Files" to choose individual image files
   - Click "Select Folder" to process all images in a folder
   - Click "Select Output Folder" to choose where text files will be saved
   - Click "Process Files" to begin extraction

3. The application will:
   - Read tags from the Windows file properties
   - Create a text file for each image with the same name
   - Display progress and results in the application window

## Requirements

- Windows operating system
- Node.js
- PowerShell (comes pre-installed with Windows)
- Image files must have tags set in Windows properties

## How to Add Tags to Images

1. Right-click an image file in Windows Explorer
2. Select "Properties"
3. Go to the "Details" tab
4. Add tags in the "Tags" or "Comments" field
5. Click "Apply" and "OK"

## Troubleshooting

- If no tags are found, check that the image has tags in its Windows properties
- Make sure you have permission to read the source files and write to the output folder
- Check the Developer Tools (Ctrl+Shift+I) for detailed error messages

## Technical Details

- Built with Electron
- Uses Windows PowerShell to access file metadata
- Supports multiple metadata fields (Tags, Comments, Keywords)
- Creates one text file per image with extracted tags

## License

[MIT License](LICENSE)
