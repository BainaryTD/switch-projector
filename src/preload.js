const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    getMonitors: () => ipcRenderer.invoke('get-monitors'),
    setMonitor: (index) => ipcRenderer.send('set-monitor', index),
    armMedia: (filePath) => ipcRenderer.send('ARM_MEDIA', filePath),
    playNow: (keepAudio) => ipcRenderer.send('PLAY_NOW', keepAudio),
    showHold: () => ipcRenderer.send('SHOW_HOLD'),

    // New Feature APIs
    captureLive: () => ipcRenderer.invoke('capture-live'),
    setLoop: (loopValue) => ipcRenderer.send('SET_LOOP', loopValue),

    // Sync Media Control
    mediaPlay: () => ipcRenderer.send('MEDIA_PLAY'),
    mediaPause: () => ipcRenderer.send('MEDIA_PAUSE'),
    mediaSeek: (time) => ipcRenderer.send('MEDIA_SEEK', time),
    mediaVolume: (vol) => ipcRenderer.send('MEDIA_VOLUME', vol),

    // For Receiving on Display window
    onArmMedia: (callback) => ipcRenderer.on('ARM_MEDIA', (event, path) => callback(path)),
    onPlayNow: (callback) => ipcRenderer.on('PLAY_NOW', (event, keepAudio) => callback(keepAudio)),
    onShowHold: (callback) => ipcRenderer.on('SHOW_HOLD', () => callback()),
    onSetLoop: (callback) => ipcRenderer.on('SET_LOOP', (event, loopValue) => callback(loopValue)),

    onMediaPlay: (callback) => ipcRenderer.on('MEDIA_PLAY', () => callback()),
    onMediaPause: (callback) => ipcRenderer.on('MEDIA_PAUSE', () => callback()),
    onMediaSeek: (callback) => ipcRenderer.on('MEDIA_SEEK', (event, time) => callback(time)),
    onMediaVolume: (callback) => ipcRenderer.on('MEDIA_VOLUME', (event, vol) => callback(vol))
});
