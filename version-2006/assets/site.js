(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentSlide);
      });
    }

    function restartTimer() {
      if (!slides.length) {
        return;
      }
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5000);
    }

    if (slides.length) {
      showSlide(0);
      restartTimer();
      var prev = document.querySelector("[data-hero-prev]");
      var next = document.querySelector("[data-hero-next]");
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(currentSlide - 1);
          restartTimer();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(currentSlide + 1);
          restartTimer();
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
          restartTimer();
        });
      });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var year = scope.querySelector("[data-year-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var region = scope.querySelector("[data-region-filter]");
      var cards = Array.prototype.slice.call(scope.parentElement.querySelectorAll("[data-card]"));
      var empty = scope.parentElement.querySelector("[data-no-results]");

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var regionValue = region ? region.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-text") || "").toLowerCase();
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            ok = false;
          }
          if (typeValue && card.getAttribute("data-type") !== typeValue) {
            ok = false;
          }
          if (regionValue && card.getAttribute("data-region") !== regionValue) {
            ok = false;
          }
          card.classList.toggle("hidden-by-filter", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [input, year, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  });

  window.startMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var startButton = document.querySelector("[data-player-start]");
    var attached = false;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (startButton) {
      startButton.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };
})();
