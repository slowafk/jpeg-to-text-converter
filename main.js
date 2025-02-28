const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { execFile } = require('child_process');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile(path.join(__dirname, 'src/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle file selection
ipcMain.handle('select-files', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }]
    });
    return result.filePaths;
});

// Handle folder selection
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    return result.filePaths;
});

// Handle metadata extraction
ipcMain.handle('get-file-metadata', async (event, filePath) => {
    return new Promise((resolve, reject) => {
        // Updated PowerShell script to check multiple property indices and use Comments/Tags
        const script = `
            $shell = New-Object -ComObject Shell.Application
            $folder = Split-Path "${filePath}"
            $file = Split-Path "${filePath}" -Leaf
            $shellfolder = $shell.Namespace($folder)
            $shellfile = $shellfolder.ParseName($file)
            
            # Try different property indices that might contain tags
            $description = $shellfolder.GetDetailsOf($shellfile, 21)  # Comments/Description
            $tags = $shellfolder.GetDetailsOf($shellfile, 18)        # Tags
            $keywords = $shellfolder.GetDetailsOf($shellfile, 5)     # Keywords
            
            # Combine all possible tag sources and remove empty ones
            $allTags = @($description, $tags, $keywords) | Where-Object { $_ -ne '' }
            
            # Output the first non-empty value found
            if ($allTags.Count -gt 0) {
                $allTags[0]
            } else {
                ''
            }
        `;

        const psScript = Buffer.from(script, 'utf16le').toString('base64');
        
        execFile('powershell.exe', [
            '-NoProfile',
            '-NonInteractive',
            '-EncodedCommand', psScript
        ], (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
});
