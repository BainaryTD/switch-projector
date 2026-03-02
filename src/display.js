const holdScreen = document.getElementById('holdScreen');
const holdText = document.getElementById('holdText');
const videoPlayer = document.getElementById('videoPlayer');
const imagePlayer = document.getElementById('imagePlayer');

let currentIsImage = false;
let armedFilePath = null;
let isLivePlaying = false; // Track if we are currently displaying something on projector

window.electronAPI.onArmMedia((filePath) => {
    armedFilePath = filePath;

    // If nothing is playing on projector right now, we can show Standby.
    // If something IS playing, we do nothing visibly so we don't interrupt it.
    if (!isLivePlaying) {
        holdScreen.style.zIndex = '10';
        holdScreen.style.opacity = '1';
        holdText.innerText = "READY // STANDBY";
    }
});

window.electronAPI.onPlayNow((keepAudio) => {
    if (!armedFilePath) return;

    isLivePlaying = true;

    // Determine type of the queued file
    const ext = armedFilePath.split('.').pop().toLowerCase();
    currentIsImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);

    // Stop and hide current media
    if (!currentIsImage || !keepAudio) {
        videoPlayer.pause();
    }
    videoPlayer.style.display = 'none';
    imagePlayer.style.display = 'none';

    // Set and play new media
    if (currentIsImage) {
        imagePlayer.src = `file://${armedFilePath}`;
        imagePlayer.style.display = 'block';
        imagePlayer.style.zIndex = '5';

        // Ensure old video src is cleared if we shouldn't keep audio, to save memory and ensure stops.
        if (!keepAudio) {
            videoPlayer.src = '';
        }
    } else {
        videoPlayer.src = `file://${armedFilePath}`;
        videoPlayer.style.display = 'block';
        videoPlayer.style.zIndex = '5';
        videoPlayer.load();
        videoPlayer.play().catch(e => console.log(e));
    }

    // Hide hold screen smoothly
    holdScreen.style.opacity = '0';
    setTimeout(() => {
        holdScreen.style.zIndex = '-1';
    }, 300); // fade out effect
});

window.electronAPI.onShowHold(() => {
    isLivePlaying = false;
    armedFilePath = null; // Clear armed queue if cut

    videoPlayer.pause();
    videoPlayer.style.display = 'none';
    videoPlayer.style.zIndex = '-1';
    imagePlayer.style.display = 'none';
    imagePlayer.style.zIndex = '-1';
    holdText.innerText = "HOLD SCREEN // 🛑";
    holdScreen.style.zIndex = '10';
    holdScreen.style.opacity = '1';
});

window.electronAPI.onSetLoop((isLoop) => {
    videoPlayer.loop = isLoop;
});

window.electronAPI.onMediaPlay(() => {
    if (isLivePlaying) videoPlayer.play().catch(e => console.log(e));
});

window.electronAPI.onMediaPause(() => {
    if (isLivePlaying) videoPlayer.pause();
});

window.electronAPI.onMediaSeek((time) => {
    if (isLivePlaying) videoPlayer.currentTime = time;
});

window.electronAPI.onMediaVolume((vol) => {
    videoPlayer.volume = vol;
});
