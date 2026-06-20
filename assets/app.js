(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var isOpen = mobileNav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;
      var timer = null;
      var activate = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      };
      var start = function () {
        timer = window.setInterval(function () {
          activate(current + 1);
        }, 5200);
      };
      var restart = function () {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          activate(index);
          restart();
        });
      });
      start();
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var section = scope.closest(".filter-section");
      var cards = section ? Array.prototype.slice.call(section.querySelectorAll(".movie-card")) : [];
      var empty = section ? section.querySelector(".empty-state") : null;
      var params = new URLSearchParams(window.location.search);
      if (input && params.get("q")) {
        input.value = params.get("q");
      }
      var apply = function () {
        var q = input ? input.value.trim().toLowerCase() : "";
        var t = type ? type.value : "";
        var y = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-genre") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (t && (card.getAttribute("data-type") || "") !== t) {
            ok = false;
          }
          if (y && (card.getAttribute("data-year") || "") !== y) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      };
      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  });
})();

function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var button = document.querySelector(config.buttonSelector);
  var source = config.source;
  var hls = null;

  function attachSource() {
    if (!video || video.getAttribute("data-ready") === "1") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
    video.setAttribute("data-ready", "1");
  }

  function beginPlay() {
    attachSource();
    if (button) {
      button.classList.add("is-hidden");
    }
    if (video) {
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }
  }

  if (button) {
    button.addEventListener("click", beginPlay);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        beginPlay();
      }
    });
    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (button && !video.ended) {
        button.classList.remove("is-hidden");
      }
    });
  }
  return hls;
}
