(function () {
  var data = window.SEARCH_INDEX || [];
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var input = document.getElementById('searchInput');
  var status = document.getElementById('searchStatus');
  var results = document.getElementById('searchResults');
  var defaultRecs = document.getElementById('defaultRecs');

  if (input) {
    input.value = query;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <span class="poster-media" style="--poster-image: url(\'./' + escapeHtml(movie.cover) + '\');"></span>',
      '    <span class="poster-play">播放</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
      '    <p class="movie-meta">' + escapeHtml([movie.year, movie.region, movie.type].filter(Boolean).join(' · ')) + '</p>',
      '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + movie.tags.split(',').slice(0, 3).filter(Boolean).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  if (!query) {
    if (status) {
      status.textContent = '请输入关键词开始搜索。';
    }
    return;
  }

  var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  var matched = data.filter(function (movie) {
    return terms.every(function (term) {
      return movie.text.indexOf(term) !== -1;
    });
  }).slice(0, 120);

  if (defaultRecs) {
    defaultRecs.style.display = 'none';
  }

  if (status) {
    status.textContent = matched.length ? '以下内容与“' + query + '”相关。' : '没有找到匹配内容，可以尝试更换关键词。';
  }

  if (results) {
    results.innerHTML = matched.map(renderCard).join('');
  }
})();
