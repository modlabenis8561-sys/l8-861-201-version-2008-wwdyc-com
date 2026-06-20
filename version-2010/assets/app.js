(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
            var current = 0;
            function show(index) {
                current = index;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === index);
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    show((current + 1) % slides.length);
                }, 5200);
            }
        }

        var filterRoot = document.querySelector('[data-filter-root]');
        if (filterRoot) {
            var keyword = filterRoot.querySelector('[data-filter-keyword]');
            var type = filterRoot.querySelector('[data-filter-type]');
            var region = filterRoot.querySelector('[data-filter-region]');
            var year = filterRoot.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
            var params = new URLSearchParams(window.location.search);
            if (keyword && params.get('q')) {
                keyword.value = params.get('q');
            }
            function applyFilter() {
                var q = keyword ? keyword.value.trim().toLowerCase() : '';
                var t = type ? type.value : '';
                var r = region ? region.value : '';
                var y = year ? year.value : '';
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-type') || '',
                        card.getAttribute('data-year') || '',
                        card.getAttribute('data-tags') || ''
                    ].join(' ').toLowerCase();
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (t && card.getAttribute('data-type') !== t) {
                        ok = false;
                    }
                    if (r && card.getAttribute('data-region') !== r) {
                        ok = false;
                    }
                    if (y && card.getAttribute('data-year') !== y) {
                        ok = false;
                    }
                    card.classList.toggle('hide-card', !ok);
                });
            }
            [keyword, type, region, year].forEach(function (node) {
                if (node) {
                    node.addEventListener('input', applyFilter);
                    node.addEventListener('change', applyFilter);
                }
            });
            applyFilter();
        }
    });
})();

function initMoviePlayer(playerId, videoUrl) {
    var box = document.getElementById(playerId);
    if (!box) {
        return;
    }
    var video = box.querySelector('video');
    var trigger = box.querySelector('.play-trigger');
    var cover = box.querySelector('.player-cover');
    var loaded = false;
    var hlsInstance = null;

    function start() {
        if (!video) {
            return;
        }
        box.classList.add('is-playing');
        if (loaded) {
            video.play().catch(function () {});
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(videoUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }
        video.src = videoUrl;
        video.play().catch(function () {});
    }

    if (trigger) {
        trigger.addEventListener('click', start);
    }
    if (cover) {
        cover.addEventListener('click', start);
    }
    if (video) {
        video.addEventListener('click', function () {
            if (!loaded) {
                start();
            }
        });
        video.addEventListener('ended', function () {
            if (hlsInstance) {
                hlsInstance.stopLoad();
            }
        });
    }
}
