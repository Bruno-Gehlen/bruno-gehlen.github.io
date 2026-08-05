/* Page behaviour: language toggle, project filter, mobile menu, scroll reveal,
   scrollspy and the contact map. */
(function () {
  var root = document.getElementById('root');
  if (!root) return;

  /* - language toggle -
     Each [data-pt] element holds its Portuguese copy in the attribute and its
     English copy as the authored innerHTML, so the English original has to be
     captured before the first swap or it is lost. */
  var originals = new Map();
  root.querySelectorAll('[data-pt]').forEach(function (el) {
    originals.set(el, el.innerHTML);
  });

  function setLang(lang) {
    root.querySelectorAll('[data-pt]').forEach(function (el) {
      el.innerHTML = lang === 'pt' ? el.getAttribute('data-pt') : originals.get(el);
    });
    root.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.dataset.lang === lang;
      b.style.background = on ? 'var(--color-accent)' : 'none';
      b.style.color = on ? 'var(--color-bg)' : 'var(--color-text)';
      b.setAttribute('aria-pressed', String(on));
    });
    document.documentElement.lang = lang;
  }

  root.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });
  setLang('en');

  /* - project filter - */
  function setFilter(f) {
    root.querySelectorAll('[data-proj]').forEach(function (el) {
      var show = f === 'all' || el.getAttribute('data-cat') === f;
      el.style.display = show ? 'flex' : 'none';
    });
    root.querySelectorAll('[data-filter]').forEach(function (b) {
      var on = b.dataset.filter === f;
      b.style.color = on ? 'var(--color-accent)' : 'var(--color-text)';
      b.style.opacity = on ? '1' : '.48';
      b.style.borderBottom = on ? '2px solid var(--color-accent)' : '2px solid transparent';
      b.setAttribute('aria-pressed', String(on));
    });
  }

  root.querySelectorAll('[data-filter]').forEach(function (b) {
    b.addEventListener('click', function () { setFilter(b.dataset.filter); });
  });
  setFilter('all');

  /* - mobile menu -
     The shell and scrim are built here rather than in the markup so all four
     pages get them from this one script.

     The shell is what keeps the closed panel from widening the document. The
     panel parks itself off the right edge, and a viewport-level overflow-x -
     on <body> or on <html>, hidden or clip - does not reliably stop mobile
     browsers from panning out to it. The shell is a viewport-sized box with
     overflow:hidden, so the parked panel is clipped by something that cannot
     itself exceed the viewport. On desktop the shell is display:contents, so
     the panel stays a flex item of .container exactly as before.

     The scrim goes inside the <nav>: the nav's backdrop-filter makes it a
     stacking context, so a scrim appended to <body> would paint above the
     whole nav subtree - panel included - instead of behind the panel. */
  var menu = root.querySelector('.nav-links');
  var toggle = root.querySelector('[data-menu-toggle]');
  if (toggle && menu) {
    var shell = document.createElement('div');
    shell.className = 'nav-shell';
    menu.parentNode.insertBefore(shell, menu);
    shell.appendChild(menu);

    var scrim = document.createElement('div');
    scrim.className = 'nav-scrim';
    /* Appended to the <nav> itself, not to the flex .container that holds the
       panel - a fixed box is out of flow either way, but this keeps it from
       showing up as a flex item. */
    (shell.closest('nav') || shell.parentNode).appendChild(scrim);

    var setMenu = function (open) {
      menu.classList.toggle('open', open);
      scrim.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', function () {
      setMenu(!menu.classList.contains('open'));
    });
    /* Tapping anywhere off the panel dismisses it. The scrim swallows the tap,
       so a link behind the panel is not activated on the way out. */
    scrim.addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false);
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* - image lightbox -
     Any [data-zoom] image opens full-screen on tap. One overlay is built and
     reused for all of them; pages with no such image build nothing. */
  var zoomable = root.querySelectorAll('[data-zoom]');
  if (zoomable.length) {
    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');

    /* No close button - a tap anywhere off the image dismisses. The overlay
       itself takes focus instead, so Escape reaches it and focus does not
       linger on the page behind. */
    lb.tabIndex = -1;

    var lbImg = document.createElement('img');
    lb.appendChild(lbImg);
    /* Appended to <body>, outside #root, so it clears the sticky nav's z-index. */
    document.body.appendChild(lb);

    var lbReturn = null;
    var openLightbox = function (img) {
      lbReturn = img;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      lb.setAttribute('aria-label', img.alt || 'Image');
      lb.classList.add('open');
      /* Scroll lock, with the vanished scrollbar's width paid back as padding
         so the page behind does not shift sideways as the overlay opens. */
      var bar = window.innerWidth - document.documentElement.clientWidth;
      if (bar > 0) document.documentElement.style.paddingRight = bar + 'px';
      document.documentElement.style.overflow = 'hidden';
      lb.focus();
    };
    var closeLightbox = function () {
      lb.classList.remove('open');
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';
      if (lbReturn) lbReturn.focus();
    };

    /* With no close button, a tap anywhere - image included - dismisses, so
       there is no dead zone on a phone where the image nearly fills the screen. */
    lb.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) closeLightbox();
    });

    zoomable.forEach(function (img) {
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.addEventListener('click', function () { openLightbox(img); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(img); }
      });
    });
  }

  /* - images that are allowed to go missing -
     This script is deferred, so an image can already have failed by the time the
     listener attaches; the complete/naturalWidth check catches that case. */
  root.querySelectorAll('[data-hide-on-error]').forEach(function (img) {
    function hide() { img.style.display = 'none'; }
    img.addEventListener('error', hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  /* - scroll reveal -
     The hidden state comes from CSS (.js [data-reveal]); this only adds
     .is-visible. The scroll sweep and the timeout are failsafes so content can
     never be stranded invisible if the observer misses an element. */
  var reveals = Array.prototype.slice.call(root.querySelectorAll('[data-reveal]'));
  reveals.forEach(function (el, i) {
    el.style.transitionDelay = (Math.min(i % 3, 2) * 80) + 'ms';
  });

  function show(el) { el.classList.add('is-visible'); }
  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top < (window.innerHeight || 800) * 0.94 && r.bottom > 0;
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  function sweep() {
    reveals.forEach(function (el) {
      if (!el.classList.contains('is-visible') && inView(el)) show(el);
    });
  }
  sweep();
  window.addEventListener('scroll', sweep, { passive: true });
  window.addEventListener('resize', sweep, { passive: true });
  setTimeout(function () { reveals.forEach(show); }, 1400);

  /* - scrollspy for the nav - */
  var links = Array.prototype.slice.call(root.querySelectorAll('[data-navlink]'));
  function linkFor(id) {
    return links.find(function (l) { return l.getAttribute('href') === '#' + id; });
  }
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.style.color = 'var(--color-text)'; });
        var active = linkFor(e.target.id);
        if (active) active.style.color = 'var(--color-accent)';
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    root.querySelectorAll('section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* - GitHub activity -
     Two unauthenticated calls to the public API. Unauthenticated means a 60
     requests/hour budget per visitor IP, hence the localStorage cache; it also
     means no token is ever shipped to the browser, which rules out the GraphQL
     API and so also rules out pinned repos and the contribution calendar. */
  var GH_USER = 'Bruno-Gehlen';
  var GH_CACHE = 'gh:' + GH_USER;
  var GH_TTL = 60 * 60 * 1000;
  var GH_API = 'https://api.github.com/users/' + GH_USER;

  function ghGet(url) {
    return fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error(r.status)); });
  }

  function ghFetch() {
    return Promise.all([ghGet(GH_API), ghGet(GH_API + '/repos?per_page=100&sort=pushed')])
      .then(function (both) {
        var user = both[0], repos = both[1];
        return {
          repoCount: user.public_repos,
          followers: user.followers,
          stars: repos.reduce(function (n, r) { return n + r.stargazers_count; }, 0),
          top: repos.slice().sort(function (a, b) {
            return new Date(b.pushed_at) - new Date(a.pushed_at);
          }).slice(0, 3).map(function (r) {
            return {
              name: r.name, url: r.html_url, desc: r.description,
              lang: r.language, stars: r.stargazers_count, pushed: r.pushed_at.slice(0, 10)
            };
          })
        };
      });
  }

  var GH_ARROW = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2"><path d="M7 17L17 7M17 7H9M17 7v8"/></svg>';

  function ghRow(repo, i) {
    var a = document.createElement('a');
    a.className = 'gh-repo';
    a.href = repo.url;
    a.target = '_blank';
    a.rel = 'noopener';

    var rank = document.createElement('span');
    rank.className = 'gh-rank';
    rank.textContent = '0' + (i + 1);

    // textContent, not innerHTML: repo names and descriptions are remote data.
    var mid = document.createElement('span');
    mid.style.cssText = 'flex:1;min-width:0';
    var name = document.createElement('span');
    name.className = 'gh-repo-name';
    name.textContent = repo.name;
    mid.appendChild(name);
    if (repo.desc) {
      var desc = document.createElement('span');
      desc.className = 'gh-repo-desc';
      desc.textContent = repo.desc;
      mid.appendChild(desc);
    }

    var meta = document.createElement('span');
    meta.className = 'gh-repo-meta';
    var bits = [];
    if (repo.lang) bits.push(repo.lang);
    if (repo.stars > 0) bits.push('★ ' + repo.stars); // omitted at zero rather than printing "★ 0"
    bits.push(repo.pushed);
    meta.textContent = bits.join(' · ');

    var arrow = document.createElement('span');
    arrow.style.cssText = 'display:flex;flex:none';
    arrow.innerHTML = GH_ARROW;

    a.appendChild(rank);
    a.appendChild(mid);
    a.appendChild(meta);
    a.appendChild(arrow);
    return a;
  }

  function ghRender(host, data) {
    host.querySelector('[data-gh-repo-count]').textContent = data.repoCount;
    host.querySelector('[data-gh-stars]').textContent = data.stars;
    host.querySelector('[data-gh-followers]').textContent = data.followers;
    var list = host.querySelector('[data-gh-list]');
    list.textContent = '';
    data.top.forEach(function (r, i) { list.appendChild(ghRow(r, i)); });
    host.hidden = false;
  }

  (function initGitHub() {
    var host = root.querySelector('[data-gh]');
    if (!host) return;

    var cached = null;
    try { cached = JSON.parse(localStorage.getItem(GH_CACHE)); } catch (e) { /* unreadable cache */ }
    if (cached && Date.now() - cached.at < GH_TTL) { ghRender(host, cached.data); return; }

    ghFetch().then(function (data) {
      try { localStorage.setItem(GH_CACHE, JSON.stringify({ at: Date.now(), data: data })); } catch (e) { /* full or blocked */ }
      ghRender(host, data);
    }).catch(function () {
      // Rate-limited or offline: fall back to stale cache if there is one, and
      // otherwise leave the block hidden rather than invent numbers.
      if (cached) ghRender(host, cached.data);
    });
  })();

  /* - contact map -
     Leaflet is loaded from a CDN; if it is slow or blocked, retry briefly and
     then give up quietly, leaving the tinted placeholder in place. */
  var mapTries = 0;
  function initMap() {
    var el = root.querySelector('#ime-map');
    if (!el) return;
    if (!window.L) {
      if (++mapTries < 60) setTimeout(initMap, 120);
      return;
    }

    var pos = [-23.55959, -46.73180]; // IME-USP, R. do Matão 1010
    var map = L.map(el, { scrollWheelZoom: false, attributionControl: true }).setView(pos, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // OSM tiles ship light; invert them back into the page's dark ground.
    var tilePane = el.querySelector('.leaflet-tile-pane');
    if (tilePane) tilePane.style.filter = 'invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.90)';

    var icon = L.divIcon({
      className: '',
      html: '<div style="width:22px;height:22px;background:#3ecf8e;border:3px solid #0a0f0c;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 0 0 2px #3ecf8e,0 6px 14px rgba(0,0,0,.5)"></div>',
      iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -22]
    });

    // The logo path is relative to index.html, which is the only page carrying a
    // map - this script is shared with projects/, where initMap never runs.
    var popupHtml =
      '<div style="text-align:center;min-width:150px;font-family:Archivo,system-ui,sans-serif">' +
      // The height is stated, not left to auto: Leaflet measures the popup to decide
      // whether to auto-pan it into view, and an unloaded auto-height image measures
      // as zero, so the popup would grow past the top of the map after the pan check.
      '<img alt="IME-USP" width="140" height="62" onerror="this.style.display=\'none\'" ' +
      'style="width:140px;height:62px;display:block;margin:2px auto 9px" ' +
      'src="assets/img/ime-usp.png">' +
      '<b style="font-size:14px;color:#201e1d">IME-USP</b><br>' +
      '<span style="font-size:12px;color:#555">R. do Matão, 1010 - Butantã<br>São Paulo - SP</span><br>' +
      '<a href="https://www.ime.usp.br" target="_blank" rel="noopener" style="display:inline-block;margin-top:7px;font-size:12px;font-weight:700;color:#1f8f5b;text-decoration:none">ime.usp.br &rarr;</a>' +
      '</div>';

    var marker = L.marker(pos, { icon }).addTo(map).bindPopup(popupHtml);
    // The map is laid out inside a grid cell, so its real size is only known after
    // invalidateSize. Open the popup after that, or Leaflet auto-pans against a
    // stale size and the popup ends up clipped by the top of the container.
    setTimeout(function () {
      map.invalidateSize();
      marker.openPopup();
    }, 250);
  }
  initMap();
})();
