import { Playlist } from './components/Playlist.js';
import { MediaDisplay } from './components/MediaDisplay.js';
import { SyncManager } from './components/SyncManager.js';
import { MonitorSetup } from './components/MonitorSetup.js';

let currentHoldFile = null;
let playlist = null;
let syncManager = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
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
        },
        () => {
            currentHoldFile = null;
            document.getElementById('lblSelectedPath').innerText = 'None';
            MediaDisplay.setMedia(null, 'holdPlayer', 'holdImage', 'holdEmpty');
            document.getElementById('btnSend').disabled = true;
            document.getElementById('btnQuickLive').disabled = true;
            document.getElementById('btnPlay').disabled = true;
        }
    );

    // Button Events
    document.getElementById('btnSelectFile').addEventListener('click', async () => {
        const filePaths = await window.electronAPI.openFile();
        if (filePaths && filePaths.length > 0) {
            playlist.addFiles(filePaths);

            if (!currentHoldFile) {
                playlist.setActive(playlist.getQueue()[0]);
            }
        }
    });

    document.getElementById('btnSend').addEventListener('click', () => {
        if (currentHoldFile) {
            window.electronAPI.armMedia(currentHoldFile);
            document.getElementById('btnPlay').disabled = false;
        }
    });

    document.getElementById('btnPlay').addEventListener('click', () => {
        if (currentHoldFile) {
            sendToLive(currentHoldFile);
            playlist.clearActive(); // Resets currentHoldFile and clears preview
        }
    });

    document.getElementById('btnQuickLive').addEventListener('click', () => {
        if (currentHoldFile) {
            sendToLive(currentHoldFile, true /* isQuick */);
        }
    });

    document.getElementById('btnHold').addEventListener('click', () => {
        window.electronAPI.showHold();

        const liveCtrlEmpty = document.getElementById('liveControlEmpty');
        if (liveCtrlEmpty) {
            liveCtrlEmpty.style.display = 'flex';
            liveCtrlEmpty.innerText = 'No media playing';
        }
        document.getElementById('lblLivePath').innerText = 'Standby';

        MediaDisplay.updateLiveViewer(null);
    });

    document.getElementById('chkLoop').addEventListener('change', (e) => {
        syncManager.setLoop(e.target.checked);
    });

    const numFadeTime = document.getElementById('numFadeTime');
    if (numFadeTime) {
        const sendFadeTime = () => {
            const time = parseFloat(numFadeTime.value);
            if (!isNaN(time) && time >= 0) {
                window.electronAPI.setFadeTime(time);
            }
        };
        numFadeTime.addEventListener('input', sendFadeTime);
        sendFadeTime(); // Send initial value
    }

    // btnLocalPlay / btnLocalPause are currently hidden in HTML — skip their listeners
    // so that errors here don't block later listeners (e.g. btnSnapshot)
    const _btnLocalPlay = document.getElementById('btnLocalPlay');
    if (_btnLocalPlay) {
        _btnLocalPlay.addEventListener('click', () => {
            document.getElementById('livePlayer').play().catch(e => console.log(e));
        });
    }
    const _btnLocalPause = document.getElementById('btnLocalPause');
    if (_btnLocalPause) {
        _btnLocalPause.addEventListener('click', () => {
            document.getElementById('livePlayer').pause();
        });
    }

    document.getElementById('btnSnapshot').addEventListener('click', async () => {
        const snapshotPath = await window.electronAPI.captureLive();
        if (snapshotPath) {
            playlist.addFiles([snapshotPath]);
        }
    });

    document.getElementById('btnChangeMonitor').addEventListener('click', () => {
        MonitorSetup.changeMonitor('monitorSelect');
    });
});

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

    // Check if there is currently a video playing in the B panel
    const videoCurrentlyPlaying = livePlayer.src && !livePlayer.paused && !livePlayer.ended;
    const videoLoaded = livePlayer.src && livePlayer.src !== window.location.href;

    if (isImg && isQuick && videoLoaded) {
        // Quick Send to Live with an image — keep current video playing in B panel
        // Do NOT stop or change livePlayer; it stays for audio/video control
        livePlayer.style.display = 'block';
        liveCtrlEmpty.style.display = 'none';
    } else if (isImg && keepAudio) {
        // Send to Hold then Live with Keep Audio: show livePlayer for audio control
        livePlayer.style.display = 'block';
        liveCtrlEmpty.style.display = 'none';
    } else if (isImg) {
        // Image without any active video — show placeholder
        livePlayer.style.display = 'none';
        liveCtrlEmpty.style.display = 'flex';
        liveCtrlEmpty.innerText = '🖼️ Image on screen';
    } else {
        // Video: load and play in B panel
        livePlayer.style.display = 'block';
        livePlayer.src = `file://${filePath}`;
        livePlayer.load();
        livePlayer.play().catch(e => console.log(e));
        liveCtrlEmpty.style.display = 'none';
    }

    MediaDisplay.updateLiveViewer(filePath, keepAudio);
}
