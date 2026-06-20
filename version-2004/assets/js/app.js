(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");

        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }

                index = (nextIndex + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var localForms = Array.prototype.slice.call(document.querySelectorAll("[data-local-search]"));
        var empty = document.querySelector("[data-empty-state]");
        var activeFilters = {
            type: "all",
            region: "all",
            year: "all"
        };
        var currentQuery = "";

        function getUrlQuery() {
            try {
                return new URLSearchParams(window.location.search).get("q") || "";
            } catch (error) {
                return "";
            }
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }

            var visible = 0;
            var query = normalize(currentQuery);

            cards.forEach(function (card) {
                var hay = normalize(card.getAttribute("data-search"));
                var matchesQuery = !query || hay.indexOf(query) !== -1;
                var matchesType = activeFilters.type === "all" || card.getAttribute("data-type") === activeFilters.type;
                var matchesRegion = activeFilters.region === "all" || card.getAttribute("data-region") === activeFilters.region;
                var matchesYear = activeFilters.year === "all" || card.getAttribute("data-year") === activeFilters.year;
                var matches = matchesQuery && matchesType && matchesRegion && matchesYear;

                card.classList.toggle("is-hidden", !matches);

                if (matches) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        localForms.forEach(function (form) {
            var input = form.querySelector("input[type='search']");

            form.addEventListener("submit", function (event) {
                event.preventDefault();
                currentQuery = input ? input.value : "";
                applyFilters();
            });

            if (input) {
                input.addEventListener("input", function () {
                    currentQuery = input.value;
                    applyFilters();
                });
            }
        });

        var queryFromUrl = getUrlQuery();

        if (queryFromUrl && cards.length) {
            currentQuery = queryFromUrl;
            localForms.forEach(function (form) {
                var input = form.querySelector("input[type='search']");

                if (input) {
                    input.value = queryFromUrl;
                }
            });
            applyFilters();
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-chip]")).forEach(function (chip) {
            chip.addEventListener("click", function () {
                var group = chip.getAttribute("data-chip");
                var value = chip.getAttribute("data-value") || "all";

                activeFilters[group] = value;

                Array.prototype.slice.call(document.querySelectorAll("[data-chip='" + group + "']")).forEach(function (item) {
                    item.classList.toggle("active", item === chip);
                });

                applyFilters();
            });
        });

        var player = document.querySelector("[data-player]");

        if (player) {
            var video = player.querySelector("video");
            var startButton = player.querySelector("[data-player-start]");
            var stream = video ? video.getAttribute("data-stream") : "";
            var attached = false;
            var hls = null;

            function attachStream() {
                if (!video || !stream || attached) {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (!data || !data.fatal) {
                            return;
                        }

                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                            hls = null;
                            attached = false;
                        }
                    });
                } else {
                    video.src = stream;
                }

                attached = true;
            }

            function begin() {
                attachStream();

                if (startButton) {
                    startButton.classList.add("is-hidden");
                }

                if (video) {
                    var attempt = video.play();

                    if (attempt && typeof attempt.catch === "function") {
                        attempt.catch(function () {
                            if (startButton) {
                                startButton.classList.remove("is-hidden");
                            }
                        });
                    }
                }
            }

            if (startButton) {
                startButton.addEventListener("click", begin);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        begin();
                    }
                });

                video.addEventListener("play", function () {
                    if (startButton) {
                        startButton.classList.add("is-hidden");
                    }
                });
            }

            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    });
}());
