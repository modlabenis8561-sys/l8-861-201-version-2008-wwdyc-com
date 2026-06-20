function initMoviePlayer(streamUrl) {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-player-start]');
  var hlsInstance = null;

  if (!video || !button || !streamUrl) {
    return;
  }

  function attachStream() {
    if (video.dataset.ready === '1') {
      return Promise.resolve();
    }

    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = streamUrl;
    return Promise.resolve();
  }

  function play() {
    button.classList.add('hidden');
    attachStream().then(function () {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.classList.remove('hidden');
        });
      }
    });
  }

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('hidden');
  });
  video.addEventListener('ended', function () {
    button.classList.remove('hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
