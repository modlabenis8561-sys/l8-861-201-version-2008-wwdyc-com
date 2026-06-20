(function () {
    function initMoviePlayer(streamUrl) {
        var video = document.querySelector('[data-movie-player]');
        var overlay = document.querySelector('[data-play-overlay]');
        if (!video || !streamUrl) return;
        var ready = false;
        var hls = null;
        var load = function () {
            if (ready) return;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                ready = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                ready = true;
                return;
            }
            video.src = streamUrl;
            ready = true;
        };
        var play = function () {
            load();
            video.controls = true;
            if (overlay) overlay.classList.add('is-hidden');
            var started = video.play();
            if (started && typeof started.catch === 'function') started.catch(function () {});
        };
        if (overlay) overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!ready || video.paused) play();
        });
        video.addEventListener('play', function () {
            if (overlay) overlay.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            if (overlay) overlay.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') hls.destroy();
        });
    }
    window.initMoviePlayer = initMoviePlayer;
})();
