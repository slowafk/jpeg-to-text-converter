const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

let selectedFiles = [];
let outputFolder = '';

// Helper function to check if a file is an image
function isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
}

document.getElementById('selectFiles').addEventListener('click', async () => {
    const filePaths = await ipcRenderer.invoke('select-files');
    updateFileList(filePaths);
});

document.getElementById('selectFolder').addEventListener('click', async () => {
    const folderPaths = await ipcRenderer.invoke('select-folder');
    if (folderPaths && folderPaths.length > 0) {
        const folderPath = folderPaths[0];
        try {
            // Read all files in the directory
            const files = fs.readdirSync(folderPath);
            
            // Filter for image files and create full paths
            const imagePaths = files
                .filter(file => isImageFile(file))
                .map(file => path.join(folderPath, file));
            
            if (imagePaths.length > 0) {
                updateFileList(imagePaths);
            } else {
                document.getElementById('message').textContent = 'No image files found in selected folder';
                document.getElementById('message').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error reading folder:', error);
            document.getElementById('message').textContent = 'Error reading folder contents';
            document.getElementById('message').classList.remove('hidden');
        }
    }
});

// Add new button handler for output folder selection
document.getElementById('selectOutputFolder').addEventListener('click', async () => {
    const result = await ipcRenderer.invoke('select-folder');
    if (result && result.length > 0) {
        outputFolder = result[0];
        document.getElementById('outputPath').textContent = `Output folder: ${outputFolder}`;
        updateProcessButton();
    }
});

document.getElementById('processFiles').addEventListener('click', processFiles);

function updateFileList(paths) {
    selectedFiles = paths;
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = paths.map(path => `<div>${path}</div>`).join('');
    updateProcessButton();
}

function updateProcessButton() {
    const processButton = document.getElementById('processFiles');
    processButton.disabled = selectedFiles.length === 0 || !outputFolder;
}

async function processFiles() {
    const processButton = document.getElementById('processFiles');
    const progress = document.getElementById('progress');
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const results = document.getElementById('results');
    const resultsBody = document.getElementById('resultsBody');
    const message = document.getElementById('message');

    processButton.disabled = true;
    progress.classList.remove('hidden');
    results.classList.remove('hidden');
    resultsBody.innerHTML = '';

    for (let i = 0; i < selectedFiles.length; i++) {
        const filePath = selectedFiles[i];
        try {
            const metadata = await ipcRenderer.invoke('get-file-metadata', filePath);
            console.log('Metadata received:', metadata); // Debug log
            
            const tags = metadata ? metadata.split(';').map(tag => tag.trim()).filter(tag => tag) : [];
            console.log('Parsed tags:', tags); // Debug log
            
            // Add to results table
            const row = resultsBody.insertRow();
            row.insertCell(0).textContent = filePath;
            row.insertCell(1).textContent = tags.join(', ');

            if (tags.length > 0) {
                try {
                    const fileName = path.basename(filePath, path.extname(filePath)) + '.txt';
                    const outputPath = path.join(outputFolder, fileName);
                    fs.writeFileSync(outputPath, tags.join('\n'));
                    row.insertCell(2).innerHTML = `<span class="status success">Success</span>`;
                } catch (error) {
                    console.error('Error saving file:', error); // Debug log
                    row.insertCell(2).innerHTML = `<span class="status error">Failed to save file</span>`;
                }
            } else {
                console.log('No tags found for file:', filePath); // Debug log
                row.insertCell(2).innerHTML = `<span class="status warning">No tags found</span>`;
            }
        } catch (error) {
            console.error('Error processing file:', error); // Debug log
            const row = resultsBody.insertRow();
            row.insertCell(0).textContent = filePath;
            row.insertCell(1).textContent = 'N/A';
            row.insertCell(2).innerHTML = `<span class="status error">Error: ${error.message}</span>`;
        }

        // Update progress
        const percent = Math.round(((i + 1) / selectedFiles.length) * 100);
        progressFill.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
    }

    processButton.disabled = false;
    message.textContent = `Processed ${selectedFiles.length} files`;
    message.classList.remove('hidden');
}
