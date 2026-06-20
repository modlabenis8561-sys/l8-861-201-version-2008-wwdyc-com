(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initializeMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
            button.textContent = expanded ? '☰' : '×';
        });
    }

    function initializeHero() {
        var hero = document.querySelector('.hero-carousel');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var previous = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
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

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.target || 0));
                restart();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function initializePageFilter() {
        var input = document.getElementById('page-filter');
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre
                ].join(' ').toLowerCase();
                card.classList.toggle('is-hidden-card', query && haystack.indexOf(query) === -1);
            });
        });
    }

    function uniqueSorted(items, key) {
        var seen = Object.create(null);
        items.forEach(function (item) {
            if (item[key]) {
                seen[item[key]] = true;
            }
        });
        return Object.keys(seen).sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-CN');
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function searchCard(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return '<span class="tag">' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '    <a class="movie-cover" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="movie-year">' + escapeHtml(movie.year) + '</span>',
            '        <span class="play-mark">▶</span>',
            '    </a>',
            '    <div class="movie-info">',
            '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="tag-row">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initializeSearchPage() {
        var data = window.MOVIE_SEARCH_DATA;
        var form = document.getElementById('search-page-form');
        var input = document.getElementById('search-query');
        var resultBox = document.getElementById('search-results');
        var summary = document.getElementById('search-summary');
        var typeFilter = document.getElementById('filter-type');
        var regionFilter = document.getElementById('filter-region');
        var yearFilter = document.getElementById('filter-year');

        if (!data || !form || !input || !resultBox || !summary) {
            return;
        }

        fillSelect(typeFilter, uniqueSorted(data, 'type'));
        fillSelect(regionFilter, uniqueSorted(data, 'region'));
        fillSelect(yearFilter, uniqueSorted(data, 'year'));

        var params = new URLSearchParams(window.location.search);
        input.value = params.get('q') || '';

        function render() {
            var query = input.value.trim().toLowerCase();
            var type = typeFilter ? typeFilter.value : '';
            var region = regionFilter ? regionFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';
            var matches = data.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags.join(' '),
                    movie.oneLine
                ].join(' ').toLowerCase();
                return (!query || haystack.indexOf(query) !== -1) &&
                    (!type || movie.type === type) &&
                    (!region || movie.region === region) &&
                    (!year || movie.year === year);
            });
            var visible = matches.slice(0, 120);
            summary.textContent = query ? '搜索结果：' + matches.length + ' 部匹配' : '推荐结果：' + matches.length + ' 部影片';
            if (!visible.length) {
                resultBox.innerHTML = '<div class="empty-state">未找到匹配内容，请尝试更换关键词或筛选条件。</div>';
                return;
            }
            resultBox.innerHTML = visible.map(searchCard).join('\n');
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var url = new URL(window.location.href);
            if (input.value.trim()) {
                url.searchParams.set('q', input.value.trim());
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState(null, '', url.toString());
            render();
        });

        [input, typeFilter, regionFilter, yearFilter].forEach(function (element) {
            if (element) {
                element.addEventListener('input', render);
                element.addEventListener('change', render);
            }
        });

        render();
    }

    ready(function () {
        initializeMenu();
        initializeHero();
        initializePageFilter();
        initializeSearchPage();
    });
}());
