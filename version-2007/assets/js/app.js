(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length || !dots.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stop();
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function createResult(item) {
    var link = document.createElement('a');
    link.className = 'search-result-item';
    link.href = item.url;

    var image = document.createElement('img');
    image.src = item.cover;
    image.alt = item.title;
    image.loading = 'lazy';

    var text = document.createElement('div');
    var title = document.createElement('strong');
    title.textContent = item.title;
    var meta = document.createElement('span');
    meta.textContent = [item.year, item.region, item.type].filter(Boolean).join(' · ');
    var desc = document.createElement('span');
    desc.textContent = item.oneLine;

    text.appendChild(title);
    text.appendChild(meta);
    text.appendChild(desc);
    link.appendChild(image);
    link.appendChild(text);
    return link;
  }

  function initSearch() {
    var input = document.querySelector('[data-site-search]');
    var results = document.querySelector('[data-search-results]');
    var clear = document.querySelector('[data-search-clear]');
    if (!input || !results || !Array.isArray(window.SITE_MOVIES)) {
      return;
    }

    function render(query) {
      var value = query.trim().toLowerCase();
      results.innerHTML = '';
      if (!value) {
        results.classList.remove('open');
        return;
      }
      var matched = window.SITE_MOVIES.filter(function (item) {
        return item.search.includes(value);
      }).slice(0, 24);

      if (!matched.length) {
        var empty = document.createElement('div');
        empty.className = 'search-result-item';
        empty.textContent = '未找到匹配影片';
        results.appendChild(empty);
      } else {
        matched.forEach(function (item) {
          results.appendChild(createResult(item));
        });
      }
      results.classList.add('open');
    }

    input.addEventListener('input', function () {
      render(input.value);
    });

    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        render('');
        input.focus();
      });
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
