(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var containers = Array.prototype.slice.call(document.querySelectorAll('[data-filter-container]'));
    containers.forEach(function (container) {
      var keyword = container.querySelector('.filter-keyword');
      var year = container.querySelector('.filter-year');
      var type = container.querySelector('.filter-type');
      var region = container.querySelector('.filter-region');
      var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
      var empty = container.querySelector('[data-empty-state]');

      function value(node) {
        return node ? node.value.trim().toLowerCase() : '';
      }

      function apply() {
        var q = value(keyword);
        var y = value(year);
        var t = value(type);
        var r = value(region);
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre')
          ].join(' ').toLowerCase();
          var match = true;
          if (q && text.indexOf(q) === -1) {
            match = false;
          }
          if (y && String(card.getAttribute('data-year')).toLowerCase() !== y) {
            match = false;
          }
          if (t && String(card.getAttribute('data-type')).toLowerCase() !== t) {
            match = false;
          }
          if (r && String(card.getAttribute('data-region')).toLowerCase() !== r) {
            match = false;
          }
          card.hidden = !match;
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [keyword, year, type, region].forEach(function (node) {
        if (!node) {
          return;
        }
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      });
    });
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-site-search]');
    var results = document.querySelector('[data-search-results]');
    if (!form || !results || !window.SEARCH_INDEX) {
      return;
    }
    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(items) {
      if (!items.length) {
        results.innerHTML = '<div class="empty-state">没有匹配的内容</div>';
        return;
      }
      results.innerHTML = items.slice(0, 80).map(function (item) {
        var tags = Array.isArray(item.tags) ? item.tags.slice(0, 3).join(' · ') : '';
        return [
          '<article class="search-result-card">',
          '<a href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>',
          '<div>',
          '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
          '<p>' + escapeHtml(item.region + ' · ' + item.year + ' · ' + item.genre) + '</p>',
          '<p>' + escapeHtml(tags) + '</p>',
          '<p>' + escapeHtml(item.desc) + '</p>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    }

    function search() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '';
        return;
      }
      var items = window.SEARCH_INDEX.filter(function (item) {
        var value = [item.title, item.year, item.region, item.type, item.genre, item.desc, (item.tags || []).join(' ')].join(' ').toLowerCase();
        return value.indexOf(q) !== -1;
      });
      render(items);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      search();
    });
    input.addEventListener('input', search);
    if (initial) {
      search();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play]');
      var url = player.getAttribute('data-playurl');
      var hls = null;
      var initialized = false;

      function attach() {
        if (!video || !url || initialized) {
          return;
        }
        initialized = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        attach();
        player.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!initialized || video.paused) {
            play();
          } else {
            video.pause();
          }
        });
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('ended', function () {
          if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
          }
        });
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
}());
