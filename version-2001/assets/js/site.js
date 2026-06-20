(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;
        var show = function (index) {
            if (!slides.length) return;
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };
        var start = function () {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        };
        var reset = function () {
            if (timer) window.clearInterval(timer);
            start();
        };
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                reset();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                reset();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                reset();
            });
        });
        show(0);
        start();
    }

    var list = document.querySelector('[data-filter-list]');
    if (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        var keyword = document.querySelector('[data-filter-keyword]');
        var year = document.querySelector('[data-filter-year]');
        var type = document.querySelector('[data-filter-type]');
        var region = document.querySelector('[data-filter-region]');
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (keyword && q) keyword.value = q;
        var apply = function () {
            var kw = keyword ? keyword.value.trim().toLowerCase() : '';
            var yr = year ? year.value : '';
            var tp = type ? type.value : '';
            var rg = region ? region.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-title') || '').toLowerCase();
                var match = true;
                if (kw && text.indexOf(kw) === -1) match = false;
                if (yr && card.getAttribute('data-year') !== yr) match = false;
                if (tp && card.getAttribute('data-type') !== tp) match = false;
                if (rg && card.getAttribute('data-region') !== rg) match = false;
                card.style.display = match ? '' : 'none';
                if (match) visible += 1;
            });
            if (empty) empty.classList.toggle('is-visible', visible === 0);
        };
        [keyword, year, type, region].forEach(function (item) {
            if (!item) return;
            item.addEventListener('input', apply);
            item.addEventListener('change', apply);
        });
        apply();
    }
})();
