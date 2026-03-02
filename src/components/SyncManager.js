export class SyncManager {
    constructor(livePlayerId, liveViewerVideoId) {
        this.livePlayer = document.getElementById(livePlayerId);
        this.liveViewerVid = document.getElementById(liveViewerVideoId);
        this.isSyncingSeek = false;
        this.throttleSeekTimer = null;
        this.isLocalSyncing = false;

        this.setupListeners(this.livePlayer);
        // We no longer attach listeners to liveViewerVid because it will just be a mirror stream
    }

    syncSeeking(time) {
        if (!this.throttleSeekTimer) {
            this.throttleSeekTimer = setTimeout(() => {
                window.electronAPI.mediaSeek(time);
                this.throttleSeekTimer = null;
            }, 150);
        }
    }

    setupListeners(sourceElement) {
        sourceElement.addEventListener('play', () => {
            window.electronAPI.mediaPlay();
        });

        sourceElement.addEventListener('pause', () => {
            window.electronAPI.mediaPause();
        });

        sourceElement.addEventListener('volumechange', () => {
            window.electronAPI.mediaVolume(sourceElement.volume);
        });

        sourceElement.addEventListener('seeking', () => {
            this.syncSeeking(sourceElement.currentTime);
        });

        sourceElement.addEventListener('seeked', () => {
            if (!this.isSyncingSeek) {
                this.isSyncingSeek = true;
                window.electronAPI.mediaSeek(sourceElement.currentTime);
                setTimeout(() => { this.isSyncingSeek = false; }, 100);
            }
        });
    }

    setLoop(isLoop) {
        this.livePlayer.loop = isLoop;
        if (this.liveViewerVid) this.liveViewerVid.loop = isLoop;
        document.getElementById('holdPlayer').loop = isLoop;
        window.electronAPI.setLoop(isLoop);
    }
}
