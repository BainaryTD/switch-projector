export class MediaDisplay {
    static setMedia(filePath, videoID, imageID, emptyID, keepAudio = false) {
        const videoElem = document.getElementById(videoID);
        const imageElem = document.getElementById(imageID);
        const emptyElem = document.getElementById(emptyID);

        if (!filePath) {
            if (!keepAudio) {
                videoElem.style.display = 'none';
                videoElem.pause();
            }
            imageElem.style.display = 'none';
            emptyElem.style.display = 'flex';
            return false;
        }

        emptyElem.style.display = 'none';
        const ext = filePath.split('.').pop().toLowerCase();
        const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);

        if (isImage) {
            if (!keepAudio) {
                videoElem.style.display = 'none';
                videoElem.style.height = '100%';
                videoElem.style.top = '0';
                videoElem.pause();
            } else {
                // Keep the video playing in the background by making it a small audio player
                videoElem.style.display = 'block';
                videoElem.style.height = '50px';
                videoElem.style.top = 'auto';
                videoElem.style.bottom = '0';
                videoElem.style.zIndex = '10';
                videoElem.style.backgroundColor = 'rgba(0,0,0,0.7)';
            }
            imageElem.style.display = 'block';
            imageElem.src = `file://${filePath}`;
        } else {
            imageElem.style.display = 'none';
            videoElem.style.display = 'block';
            videoElem.style.height = '100%';
            videoElem.style.top = '0';
            videoElem.style.bottom = 'auto';
            videoElem.style.zIndex = '1';
            videoElem.style.backgroundColor = 'transparent';
            videoElem.src = `file://${filePath}`;
            videoElem.load();
        }
        return isImage;
    }

    static updateLiveViewer(filePath, keepAudio = false) {
        const viewerVideo = document.getElementById('liveViewerVideo');
        const viewerImage = document.getElementById('liveViewerImage');
        const viewerEmpty = document.getElementById('liveViewerEmpty');

        if (!filePath) {
            viewerVideo.pause();
            viewerVideo.style.display = 'none';
            viewerVideo.src = '';
            viewerVideo.srcObject = null;
            viewerImage.style.display = 'none';
            viewerEmpty.style.display = 'flex';
            viewerEmpty.innerText = 'Projector Standby 💤';
            return;
        }

        const ext = filePath.split('.').pop().toLowerCase();
        const isImg = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);

        viewerEmpty.style.display = 'none';
        if (isImg) {
            // Panel C: show image only, no audio bar here
            if (!keepAudio) {
                viewerVideo.pause();
            }
            viewerVideo.style.display = 'none';
            viewerImage.style.display = 'block';
            viewerImage.src = `file://${filePath}`;
        } else {
            viewerImage.style.display = 'none';
            viewerVideo.style.display = 'block';
            viewerVideo.muted = true;

            const livePlayer = document.getElementById('livePlayer');

            // Clear any old stream/source before attaching new one
            viewerVideo.src = '';
            viewerVideo.srcObject = null;

            // Wait slightly for the livePlayer to actually start its new source before capturing its stream
            setTimeout(() => {
                if (livePlayer.captureStream) {
                    viewerVideo.srcObject = livePlayer.captureStream();
                } else if (livePlayer.mozCaptureStream) {
                    viewerVideo.srcObject = livePlayer.mozCaptureStream();
                }
                viewerVideo.play().catch(e => console.log(e));
            }, 100);
        }
    }
}
