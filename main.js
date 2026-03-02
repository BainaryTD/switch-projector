const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let controlWindow = null;
let displayWindow = null;
let displays = [];

function createControlWindow() {
    controlWindow = new BrowserWindow({
        width: 900,
        height: 700,
        title: 'Projector Control - Control Panel',
        webPreferences: {
            preload: path.join(__dirname, 'src', 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false // allow local files 
        }
    });

    controlWindow.loadFile(path.join(__dirname, 'src', 'control.html'));

    controlWindow.on('closed', () => {
        app.quit();
    });
}

function createDisplayWindow(monitorIndex = null) {
    if (displayWindow) {
        displayWindow.close();
    }

    displays = screen.getAllDisplays();

    // Choose target monitor, default to secondary display if monitorIndex not specified
    let targetDisplay = displays[0];
    if (monitorIndex !== null && displays[monitorIndex]) {
        targetDisplay = displays[monitorIndex];
    } else if (displays.length > 1) {
        targetDisplay = displays[1];
    }

    displayWindow = new BrowserWindow({
        x: targetDisplay.bounds.x,
        y: targetDisplay.bounds.y,
        width: targetDisplay.bounds.width,
        height: targetDisplay.bounds.height,
        title: 'Projector Control - Display',
        fullscreen: true,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'src', 'preload.js'),
            contextIsolation: true,
            webSecurity: false
        }
    });

    displayWindow.loadFile(path.join(__dirname, 'src', 'display.html'));
}

app.whenReady().then(() => {
    createControlWindow();
    createDisplayWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createControlWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC: Select File
ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(controlWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Media', extensions: ['mp4', 'mkv', 'mov', 'webm', 'mp3', 'wav', 'png', 'jpg', 'jpeg', 'gif', 'webp'] }
        ]
    });
    if (canceled) { return []; } else { return filePaths; }
});

// IPC: Get Monitors
ipcMain.handle('get-monitors', () => {
    displays = screen.getAllDisplays();
    return displays.map((d, index) => ({ id: index, bounds: d.bounds }));
});

// IPC: Change Monitor
ipcMain.on('set-monitor', (event, index) => {
    createDisplayWindow(index);
});

// IPC: Send media to display (Hold state)
ipcMain.on('ARM_MEDIA', (event, filePath) => {
    if (displayWindow) displayWindow.webContents.send('ARM_MEDIA', filePath);
});

// IPC: Play the loaded media
ipcMain.on('PLAY_NOW', (event, keepAudio) => {
    if (displayWindow) displayWindow.webContents.send('PLAY_NOW', keepAudio);
});

// IPC: Toggle Loop
ipcMain.on('SET_LOOP', (event, loopValue) => {
    if (displayWindow) displayWindow.webContents.send('SET_LOOP', loopValue);
});

// IPC: Media Controls sync
ipcMain.on('MEDIA_PLAY', () => { if (displayWindow) displayWindow.webContents.send('MEDIA_PLAY'); });
ipcMain.on('MEDIA_PAUSE', () => { if (displayWindow) displayWindow.webContents.send('MEDIA_PAUSE'); });
ipcMain.on('MEDIA_SEEK', (event, time) => { if (displayWindow) displayWindow.webContents.send('MEDIA_SEEK', time); });
ipcMain.on('MEDIA_VOLUME', (event, vol) => { if (displayWindow) displayWindow.webContents.send('MEDIA_VOLUME', vol); });

// IPC: Emergency Hold
ipcMain.on('SHOW_HOLD', () => {
    if (displayWindow) displayWindow.webContents.send('SHOW_HOLD');
});

// IPC: Capture Live Screen
ipcMain.handle('capture-live', async () => {
    if (!displayWindow) return null;
    try {
        const image = await displayWindow.webContents.capturePage();
        const buffer = image.toPNG();
        // save to temp directory
        const tempPath = path.join(app.getPath('temp'), `snapshot_${Date.now()}.png`);
        fs.writeFileSync(tempPath, buffer);
        return tempPath;
    } catch (e) {
        console.error("Capture failure:", e);
        return null;
    }
});
