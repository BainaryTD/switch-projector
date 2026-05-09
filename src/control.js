import { Playlist } from './components/Playlist.js';
import { MediaDisplay } from './components/MediaDisplay.js';
import { SyncManager } from './components/SyncManager.js';
import { MonitorSetup } from './components/MonitorSetup.js';

const SETTINGS_KEY = 'projector.settings.v1';
const MEDIA_EXT = /\.(mp4|mkv|mov|webm|mp3|wav|png|jpe?g|gif|webp)$/i;

const loadSettings = () => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; }
    catch { return {}; }
};
const saveSettings = (patch) => {
    const cur = loadSettings();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...cur, ...patch }));
};

let currentHoldFile = null;
let playlist = null;
let syncManager = null;
let isArmed = false;

const formatTime = (sec) => {
    if (!isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const setArmed = (on) => {
    isArmed = on;
    const badge = document.getElementById('armedBadge');
    if (!badge) return;
    if (on) badge.classList.remove('hidden');
    else badge.classList.add('hidden');
};

const flash = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('ring-4', 'ring-white');
    setTimeout(() => el.classList.remove('ring-4', 'ring-white'), 200);
};

document.addEventListener('DOMContentLoaded', () => {
    syncManager = new SyncManager('livePlayer', 'liveViewerVideo');
    MonitorSetup.init('monitorSelect');

    playlist = new Playlist(
        'playlistContainer',
        (filePath) => {
            currentHoldFile = filePath;
            document.getElementById('lblSelectedPath').innerText = filePath.split('\\').pop() || filePath;
            document.getElementById('btnSend').disabled = false;
            document.getElementById('btnQuickLive').disabled = false;
            MediaDisplay.setMedia(filePath, 'holdPlayer', 'holdImage', 'holdEmpty');
            setArmed(false);
            document.getElementById('btnPlay').disabled = true;
        },
        () => {
            currentHoldFile = null;
            document.getElementById('lblSelectedPath').innerText = 'None';
            MediaDisplay.setMedia(null, 'holdPlayer', 'holdImage', 'holdEmpty');
            document.getElementById('btnSend').disabled = true;
            document.getElementById('btnQuickLive').disabled = true;
            document.getElementById('btnPlay').disabled = true;
            setArmed(false);
        }
    );

    // Restore persisted settings
    const settings = loadSettings();
    const numFadeTime = document.getElementById('numFadeTime');
    const chkLoop = document.getElementById('chkLoop');
    const chkKeepAudio = document.getElementById('chkKeepAudio');

    if (typeof settings.fadeTime === 'number' && numFadeTime) numFadeTime.value = settings.fadeTime;
    if (typeof settings.loop === 'boolean' && chkLoop) chkLoop.checked = settings.loop;
    if (typeof settings.keepAudio === 'boolean' && chkKeepAudio) chkKeepAudio.checked = settings.keepAudio;

    // Apply restored values via IPC after a tick (display window must be ready)
    setTimeout(() => {
        if (numFadeTime) {
            const t = parseFloat(numFadeTime.value);
            if (!isNaN(t) && t >= 0) window.electronAPI.setFadeTime(t);
        }
        if (chkLoop && syncManager) syncManager.setLoop(chkLoop.checked);
    }, 200);

    // ----- Buttons -----
    document.getElementById('btnSelectFile').addEventListener('click', async () => {
        const filePaths = await window.electronAPI.openFile();
        if (filePaths && filePaths.length > 0) {
            playlist.addFiles(filePaths);
            playlist.setActive(filePaths[0]);
        }
    });

    document.getElementById('btnSend').addEventListener('click', () => {
        if (currentHoldFile) {
            window.electronAPI.armMedia(currentHoldFile);
            document.getElementById('btnPlay').disabled = false;
            setArmed(true);
            flash('btnSend');
        }
    });

    document.getElementById('btnPlay').addEventListener('click', () => {
        if (currentHoldFile) {
            sendToLive(currentHoldFile);
            playlist.clearActive();
            flash('btnPlay');
        }
    });

    document.getElementById('btnQuickLive').addEventListener('click', () => {
        if (currentHoldFile) {
            sendToLive(currentHoldFile, true);
            flash('btnQuickLive');
        }
    });

    document.getElementById('btnHold').addEventListener('click', emergencyHold);

    chkLoop.addEventListener('change', (e) => {
        syncManager.setLoop(e.target.checked);
        saveSettings({ loop: e.target.checked });
    });

    chkKeepAudio.addEventListener('change', (e) => {
        saveSettings({ keepAudio: e.target.checked });
    });

    if (numFadeTime) {
        const sendFadeTime = () => {
            const time = parseFloat(numFadeTime.value);
            if (!isNaN(time) && time >= 0) {
                window.electronAPI.setFadeTime(time);
                saveSettings({ fadeTime: time });
            }
        };
        numFadeTime.addEventListener('input', sendFadeTime);
        sendFadeTime();
    }

    document.getElementById('btnSnapshot').addEventListener('click', async () => {
        const snapshotPath = await window.electronAPI.captureLive();
        if (snapshotPath) playlist.addFiles([snapshotPath]);
    });

    document.getElementById('btnChangeMonitor').addEventListener('click', () => {
        MonitorSetup.changeMonitor('monitorSelect');
    });

    setupTransport();
    setupDragDrop();
    setupKeyboardShortcuts();
    setupShortcutPanel();
});

function emergencyHold() {
    window.electronAPI.showHold();

    const liveCtrlEmpty = document.getElementById('liveControlEmpty');
    if (liveCtrlEmpty) {
        liveCtrlEmpty.style.display = 'flex';
        liveCtrlEmpty.innerText = 'No media playing';
    }
    document.getElementById('lblLivePath').innerText = 'Standby';

    const livePlayer = document.getElementById('livePlayer');
    if (livePlayer) {
        livePlayer.pause();
        livePlayer.removeAttribute('src');
        livePlayer.load();
        livePlayer.style.display = 'none';
    }

    document.getElementById('liveTransport').classList.add('hidden');
    setArmed(false);
    MediaDisplay.updateLiveViewer(null);
    flash('btnHold');
}

function sendToLive(filePath, isQuick = false) {
    const keepAudioRaw = document.getElementById('chkKeepAudio');
    const keepAudio = keepAudioRaw ? keepAudioRaw.checked : false;

    window.electronAPI.armMedia(filePath);
    setTimeout(() => {
        window.electronAPI.playNow(keepAudio);
    }, 50);

    const shortName = filePath.split('\\').pop() || filePath;
    document.getElementById('lblLivePath').innerText = shortName;

    const ext = filePath.split('.').pop().toLowerCase();
    const isImg = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);

    const livePlayer = document.getElementById('livePlayer');
    const liveCtrlEmpty = document.getElementById('liveControlEmpty');
    const liveTransport = document.getElementById('liveTransport');

    const videoLoaded = livePlayer.src && livePlayer.src !== window.location.href;

    if (isImg && isQuick && videoLoaded) {
        livePlayer.style.display = 'block';
        liveCtrlEmpty.style.display = 'none';
        liveTransport.classList.remove('hidden');
    } else if (isImg && keepAudio) {
        livePlayer.style.display = 'block';
        liveCtrlEmpty.style.display = 'none';
        liveTransport.classList.remove('hidden');
    } else if (isImg) {
        livePlayer.style.display = 'none';
        liveCtrlEmpty.style.display = 'flex';
        liveCtrlEmpty.innerText = '🖼️ Image on screen';
        liveTransport.classList.add('hidden');
    } else {
        livePlayer.style.display = 'block';
        livePlayer.src = `file://${filePath}`;
        livePlayer.load();
        livePlayer.play().catch(e => console.log(e));
        liveCtrlEmpty.style.display = 'none';
        liveTransport.classList.remove('hidden');
    }

    setArmed(false);
    MediaDisplay.updateLiveViewer(filePath, keepAudio);
}

function setupTransport() {
    const livePlayer = document.getElementById('livePlayer');
    const liveTime = document.getElementById('liveTime');
    const liveDuration = document.getElementById('liveDuration');
    const liveSeek = document.getElementById('liveSeek');
    const liveVol = document.getElementById('liveVol');
    if (!livePlayer || !liveSeek) return;

    let userSeeking = false;

    livePlayer.addEventListener('loadedmetadata', () => {
        const dur = livePlayer.duration || 0;
        liveDuration.innerText = formatTime(dur);
        liveSeek.max = String(dur || 100);
    });

    livePlayer.addEventListener('timeupdate', () => {
        if (userSeeking) return;
        liveTime.innerText = formatTime(livePlayer.currentTime);
        if (livePlayer.duration) liveSeek.value = String(livePlayer.currentTime);
    });

    liveSeek.addEventListener('input', () => {
        userSeeking = true;
        liveTime.innerText = formatTime(parseFloat(liveSeek.value));
    });
    liveSeek.addEventListener('change', () => {
        const t = parseFloat(liveSeek.value);
        if (!isNaN(t)) livePlayer.currentTime = t; // SyncManager forwards via 'seeked'
        userSeeking = false;
    });

    liveVol.addEventListener('input', () => {
        const v = parseFloat(liveVol.value);
        if (!isNaN(v)) livePlayer.volume = v; // SyncManager forwards via 'volumechange'
    });
}

function setupDragDrop() {
    const overlay = document.getElementById('dropOverlay');
    let dragDepth = 0;

    const showOverlay = () => { if (overlay) { overlay.classList.remove('hidden'); overlay.classList.add('flex'); } };
    const hideOverlay = () => { if (overlay) { overlay.classList.add('hidden'); overlay.classList.remove('flex'); } };

    window.addEventListener('dragenter', (e) => {
        if (!e.dataTransfer || !e.dataTransfer.types.includes('Files')) return;
        dragDepth++;
        showOverlay();
    });
    window.addEventListener('dragover', (e) => {
        if (e.dataTransfer && e.dataTransfer.types.includes('Files')) e.preventDefault();
    });
    window.addEventListener('dragleave', () => {
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) hideOverlay();
    });
    window.addEventListener('drop', (e) => {
        if (!e.dataTransfer || !e.dataTransfer.types.includes('Files')) return;
        e.preventDefault();
        dragDepth = 0;
        hideOverlay();
        const paths = [...e.dataTransfer.files]
            .map(f => f.path)
            .filter(p => p && MEDIA_EXT.test(p));
        if (paths.length) {
            playlist.addFiles(paths);
            playlist.setActive(paths[0]);
        }
    });
}

function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        const t = e.target;
        const tag = t && t.tagName;
        const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable);
        if (isEditable) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const livePlayer = document.getElementById('livePlayer');
        const btnPlay = document.getElementById('btnPlay');
        const btnQuickLive = document.getElementById('btnQuickLive');
        const btnSend = document.getElementById('btnSend');
        const chkLoop = document.getElementById('chkLoop');
        const chkKeepAudio = document.getElementById('chkKeepAudio');

        switch (e.key) {
            case ' ':
                e.preventDefault();
                if (livePlayer && livePlayer.src && livePlayer.src !== window.location.href) {
                    if (livePlayer.paused) livePlayer.play().catch(() => { });
                    else livePlayer.pause();
                }
                break;
            case 'Enter':
                e.preventDefault();
                if (btnPlay && !btnPlay.disabled) btnPlay.click();
                else if (btnQuickLive && !btnQuickLive.disabled) btnQuickLive.click();
                break;
            case 's':
            case 'S':
                e.preventDefault();
                if (btnSend && !btnSend.disabled) btnSend.click();
                break;
            case 'b':
            case 'B':
                e.preventDefault();
                emergencyHold();
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (playlist) playlist.moveActive(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (playlist) playlist.moveActive(-1);
                break;
            case 'Delete':
                e.preventDefault();
                if (playlist) playlist.removeActive();
                break;
            case 'l':
            case 'L':
                e.preventDefault();
                if (chkLoop) {
                    chkLoop.checked = !chkLoop.checked;
                    chkLoop.dispatchEvent(new Event('change'));
                }
                break;
            case 'k':
            case 'K':
                e.preventDefault();
                if (chkKeepAudio) {
                    chkKeepAudio.checked = !chkKeepAudio.checked;
                    chkKeepAudio.dispatchEvent(new Event('change'));
                }
                break;
            case '?':
            case '/':
                if (e.key === '?' || e.shiftKey) {
                    e.preventDefault();
                    toggleShortcutPanel();
                }
                break;
        }
    });
}

function toggleShortcutPanel() {
    const panel = document.getElementById('shortcutPanel');
    if (!panel) return;
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        panel.classList.add('flex');
    } else {
        panel.classList.add('hidden');
        panel.classList.remove('flex');
    }
}

function setupShortcutPanel() {
    const panel = document.getElementById('shortcutPanel');
    const closeBtn = document.getElementById('btnCloseShortcuts');
    if (closeBtn) closeBtn.addEventListener('click', toggleShortcutPanel);
    if (panel) {
        panel.addEventListener('click', (e) => {
            if (e.target === panel) toggleShortcutPanel();
        });
    }
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel && !panel.classList.contains('hidden')) {
            toggleShortcutPanel();
        }
    });
}
