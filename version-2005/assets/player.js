import { H as Hls } from './video-vendor-dru42stk.js';

function initializePlayer(video) {
    var source = video.getAttribute('data-hls-src');
    var overlay = video.parentElement ? video.parentElement.querySelector('.player-overlay') : null;

    if (!source) {
        return;
    }

    if (Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
                return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
            } else {
                hls.destroy();
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function showOverlay() {
        if (overlay && video.paused) {
            overlay.classList.remove('is-hidden');
        }
    }

    if (overlay) {
        overlay.addEventListener('click', function () {
            video.play();
        });
    }

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);
    video.addEventListener('ended', showOverlay);
    video.addEventListener('click', function () {
        if (video.paused) {
            video.play();
        }
    });
}

document.querySelectorAll('.hls-player').forEach(initializePlayer);
