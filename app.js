/* Zakamarki — etap 2: wyszukiwanie, czytnik, zapis tropu, ustawienia czytania, przypisy jako dymki.
   Całość działa w przeglądarce telefonu. Serwer (GitHub Pages) tylko podaje pliki. */

const API = 'https://en.wikipedia.org/w/api.php';
const WIKI = 'https://en.wikipedia.org/wiki/';

// Linki do stron, które nie są hasłami (pliki, kategorie, strony pomocy itd.) otwieramy na Wikipedii.
const NON_ARTICLE = /^(File|Image|Special|Help|Wikipedia|WP|Category|Template|Portal|Talk|User|Draft|Module|MediaWiki|Book|TimedText)(_talk)?:/i;

// Elementy usuwane z treści: przyciski edycji, szablony nawigacyjne, ostrzeżenia redakcyjne.
const REMOVE = [
  '.mw-editsection', '.navbox', '.navbox-styles', '.vertical-navbox', '.sistersitebox',
  '.side-box', '.metadata', '.ambox', '.ombox', '.tmbox', '.mw-empty-elt', '.portalbox',
  '.mw-authority-control', '.catlinks', 'style', 'link', 'script', 'meta'
].join(',');

/* ——— pamięć w przeglądarce ——— */
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('zakamarki:' + key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('zakamarki:' + key, JSON.stringify(value)); } catch {}
  }
};

const state = {
  trail: store.get('trail', []),          // bieżący trop: lista tytułów
  history: store.get('history', []),      // każde otwarcie: {title, at, from}
  saved: store.get('saved', ['Garden city movement']),
  current: null,
  pendingFrom: null                       // ustawiane, gdy klikasz link w artykule
};

const $ = (sel) => document.querySelector(sel);
const encodeTitle = (t) => encodeURIComponent(t.replace(/ /g, '_'));
const decodeTitle = (s) => decodeURIComponent(s).replace(/_/g, ' ');
const hrefFor = (t) => '#/wiki/' + encodeTitle(t);

async function api(params) {
  const q = new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params });
  const res = await fetch(API + '?' + q);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

/* ——— widoki ——— */
function show(view) {
  for (const v of ['home', 'results', 'reader']) $('#view-' + v).hidden = v !== view;
  document.documentElement.dataset.view = view;   // w czytniku tłem strony jest kartka
}

function linkItem(title, desc) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = hrefFor(title);
  a.textContent = title;
  if (desc) {
    const d = document.createElement('span');
    d.className = 'desc';
    d.textContent = desc;
    a.append(d);
  }
  li.append(a);
  return li;
}

function fillList(el, titles, emptyText) {
  el.replaceChildren();
  if (!titles.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = emptyText;
    el.append(li);
    return;
  }
  for (const t of titles) el.append(typeof t === 'string' ? linkItem(t) : linkItem(t.title, t.description));
}

// Odmiana: 1 krok, 2–4 kroki, 5+ kroków (ale 12–14 kroków).
function plural(n, one, few, many) {
  if (n === 1) return one;
  const d = n % 10, dd = n % 100;
  return d >= 2 && d <= 4 && !(dd >= 12 && dd <= 14) ? few : many;
}

/* Miniatury haseł (zdjęcie główne z prop=pageimages). Zapamiętujemy je w przeglądarce,
   także brak zdjęcia (null), żeby nie pytać Wikipedii drugi raz o to samo. */
state.thumbs = store.get('thumbs', {});
async function loadThumbs(titles) {
  const missing = titles.filter((t) => !(t in state.thumbs)).slice(0, 50);
  if (missing.length) {
    try {
      const data = await api({ action: 'query', prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '300', redirects: '1', titles: missing.join('|') });
      const alias = {};
      for (const m of [...(data.query?.normalized || []), ...(data.query?.redirects || [])]) alias[m.to] = m.from;
      for (const pg of data.query?.pages || []) {
        const src = pg.thumbnail?.source || null;
        state.thumbs[pg.title] = src;
        if (alias[pg.title]) state.thumbs[alias[pg.title]] = src;
      }
      for (const t of missing) if (!(t in state.thumbs)) state.thumbs[t] = null;
      store.set('thumbs', state.thumbs);
    } catch { /* bez internetu półka pokaże kolorowe karty */ }
  }
  return state.thumbs;
}

const COVER_COLORS = ['var(--pop-pink)', 'var(--pop-mustard)', 'var(--pop-lime)', 'var(--pop-cobalt)', 'var(--pop-orange)'];
function renderShelf(titles) {
  const shelf = $('#shelf');
  shelf.replaceChildren();
  if (!titles.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'Przypnij hasło w czytniku, a stanie tutaj na półce.';
    shelf.append(p);
    return;
  }
  titles.forEach((t, i) => {
    const a = document.createElement('a');
    a.className = 'cover';
    a.href = hrefFor(t);
    const label = document.createElement('span');
    label.textContent = t;
    a.append(label);
    const src = state.thumbs[t];
    if (src) a.style.backgroundImage = `url("${src}")`;
    else {
      a.classList.add('no-img');
      a.style.background = COVER_COLORS[i % COVER_COLORS.length];
      if (i % COVER_COLORS.length === 3) a.style.color = 'var(--on-pop)';
    }
    shelf.append(a);
  });
}

function renderHome() {
  show('home');
  document.title = 'Zakamarki';
  setProgress(0);

  // Nagłówek mówi, gdzie jesteś — z liczb, które naprawdę mierzymy.
  const trail = state.trail;
  const hero = $('#hero'), lead = $('#hero-lead'), cont = $('#continue');
  const today = new Date().setHours(0, 0, 0, 0);
  const todayCount = new Set(state.history.filter((h) => h.at >= today).map((h) => h.title)).size;
  if (trail.length > 1) {
    const steps = trail.length - 1;
    hero.innerHTML = '';
    const em = document.createElement('em');
    em.textContent = `${steps} ${plural(steps, 'krok', 'kroki', 'kroków')}`;
    hero.append(em, ` od hasła „${trail[0]}”`);
    lead.textContent = `Ostatnio: ${trail[trail.length - 1]}` + (todayCount ? ` · dziś ${todayCount} ${plural(todayCount, 'hasło', 'hasła', 'haseł')}` : '');
  } else if (trail.length === 1) {
    hero.textContent = `Ostatnio: ${trail[0]}`;
    lead.textContent = 'Kliknij link w artykule, a zacznie się trop.';
  } else {
    hero.innerHTML = 'Dokąd dziś <em>w głąb</em>?';
    lead.textContent = 'Wyszukaj hasło lupą u góry.';
  }
  cont.hidden = !trail.length;
  if (trail.length) cont.href = hrefFor(trail[trail.length - 1]);

  // Półka z przypiętymi: najpierw od razu (z pamięci), potem z dociągniętymi miniaturami.
  $('#saved-count').textContent = state.saved.length ? `${state.saved.length} ${plural(state.saved.length, 'hasło', 'hasła', 'haseł')}` : '';
  renderShelf(state.saved);
  if (state.saved.some((t) => !(t in state.thumbs))) loadThumbs(state.saved).then(() => {
    if (!$('#view-home').hidden) renderShelf(state.saved);
  });

  // Trop jako numerowana lista 0.1, 0.2…; bieżący krok wyróżniony.
  const ol = $('#last-trail');
  ol.replaceChildren();
  $('#trail-count').textContent = trail.length ? `${trail.length} ${plural(trail.length, 'hasło', 'hasła', 'haseł')}` : '';
  if (!trail.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Trop pojawi się po pierwszym artykule.';
    ol.append(li);
  }
  trail.forEach((t, i) => {
    const li = document.createElement('li');
    if (i === trail.length - 1) li.className = 'now';
    const a = document.createElement('a');
    a.href = hrefFor(t);
    a.innerHTML = '<span class="n"></span><span class="t"></span><span class="go" aria-hidden="true">→</span>';
    a.querySelector('.n').textContent = (i < 9 ? '0.' : '') + (i + 1);
    a.querySelector('.t').textContent = t;
    li.append(a);
    ol.append(li);
  });

  const all = new Set(state.history.map((h) => h.title));
  const weekAgo = Date.now() - 7 * 864e5;
  const week = new Set(state.history.filter((h) => h.at >= weekAgo).map((h) => h.title)).size;
  $('#stat-total').textContent = all.size;
  $('#stat-week').textContent = `${week} w tym tygodniu`;

  const seen = new Set();
  const recent = [];
  for (let i = state.history.length - 1; i >= 0 && recent.length < 10; i--) {
    const t = state.history[i].title;
    if (!seen.has(t)) { seen.add(t); recent.push(t); }
  }
  fillList($('#history-list'), recent, 'Historia pojawi się po pierwszym artykule.');
}

/* ——— wyszukiwanie ——— */
let suggestTimer;
$('#search').addEventListener('input', (e) => {
  clearTimeout(suggestTimer);
  const q = e.target.value.trim();
  if (q.length < 2) { $('#suggestions').hidden = true; return; }
  suggestTimer = setTimeout(() => suggest(q), 200);
});

async function suggest(q) {
  try {
    const data = await api({
      action: 'query', generator: 'prefixsearch', gpssearch: q, gpslimit: '8',
      gpsnamespace: '0', prop: 'description'
    });
    const pages = (data.query?.pages || []).sort((a, b) => a.index - b.index);
    const ul = $('#suggestions');
    ul.replaceChildren(...pages.map((p) => linkItem(p.title, p.description)));
    ul.hidden = pages.length === 0;
  } catch { /* podpowiedzi są pomocnicze; błąd pomijamy */ }
}

$('#search-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = $('#search').value.trim();
  if (!q) return;
  $('#suggestions').hidden = true;
  $('#search').blur();
  show('results');
  $('#results-label').textContent = 'Wyniki: ' + q;
  const list = $('#results-list');
  fillList(list, [], 'Szukam…');
  try {
    const data = await api({
      action: 'query', generator: 'search', gsrsearch: q, gsrlimit: '25',
      gsrnamespace: '0', prop: 'description'
    });
    const pages = (data.query?.pages || []).sort((a, b) => a.index - b.index);
    fillList(list, pages, 'Brak wyników.');
  } catch {
    fillList(list, [], 'Nie udało się połączyć z Wikipedią. Sprawdź internet i spróbuj ponownie.');
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search')) $('#suggestions').hidden = true;
});

// Lupa w nagłówku: rozwija pole wyszukiwania w miejscu nazwy; drugie stuknięcie zwija.
function toggleSearch(open) {
  $('.bar').classList.toggle('is-searching', open);
  $('#search-toggle').setAttribute('aria-expanded', String(open));
  if (open) $('#search').focus();
  else { $('#search').blur(); $('#suggestions').hidden = true; }
}
$('#search-toggle').addEventListener('click', () => toggleSearch(!$('.bar').classList.contains('is-searching')));

/* ——— czytnik ——— */
function cleanArticle(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const root = doc.body;
  root.querySelectorAll(REMOVE).forEach((n) => n.remove());

  root.querySelectorAll('*').forEach((el) => {
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
    }
    // Kolory wpisane na sztywno w Wikipedii psują ciemny motyw.
    if (el.style) { el.style.removeProperty('background'); el.style.removeProperty('background-color'); el.style.removeProperty('color'); }
  });

  root.querySelectorAll('img').forEach((img) => img.setAttribute('loading', 'lazy'));

  root.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (a.classList.contains('new')) {               // hasło, które nie istnieje
      const span = doc.createElement('span');
      span.className = 'redlink';
      span.textContent = a.textContent;
      a.replaceWith(span);
    } else if (href.startsWith('/wiki/')) {
      const name = decodeURIComponent(href.slice(6).split('#')[0]);
      if (NON_ARTICLE.test(name)) {
        a.href = 'https://en.wikipedia.org' + href;
        a.target = '_blank';
        a.rel = 'noopener';
      } else {
        const title = name.replace(/_/g, ' ');
        a.setAttribute('href', hrefFor(title));
        a.dataset.title = title;
        a.classList.add('wl');
      }
    } else if (href.startsWith('#')) {               // przypis albo sekcja w tym samym artykule
      a.dataset.anchor = href.slice(1);
      a.setAttribute('href', '#');
    } else if (href) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });

  // Infobox w zwijanym <details>; otwarty tylko na szerokim ekranie (stan ustawia openArticle).
  root.querySelectorAll('table.infobox').forEach((table) => {
    if (table.parentElement.closest('table.infobox')) return;   // zagnieżdżone zostają w środku
    const details = doc.createElement('details');
    details.className = 'infobox-wrap';
    const summary = doc.createElement('summary');
    summary.textContent = 'W skrócie';
    table.replaceWith(details);
    details.append(summary, table);
  });
  return root.innerHTML;
}

$('#article').addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  if (a.dataset.anchor !== undefined) {
    e.preventDefault();
    if (a.closest('sup.reference') && showNote(a, a.dataset.anchor)) return;
    const target = document.getElementById(a.dataset.anchor);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (a.dataset.title) state.pendingFrom = state.current;
});

function updateTrail(title) {
  const from = state.pendingFrom;
  state.pendingFrom = null;
  const idx = state.trail.indexOf(title);
  if (idx !== -1) {
    state.trail = state.trail.slice(0, idx + 1);     // powrót do wcześniejszego punktu tropu
  } else if (from && state.trail[state.trail.length - 1] === from) {
    state.trail.push(title);                         // krok dalej
  } else if (from) {
    state.trail = [from, title];
  } else {
    state.trail = [title];                           // nowy trop (z wyszukiwania lub listy)
  }
  store.set('trail', state.trail);

  state.history.push({ title, at: Date.now(), from });
  if (state.history.length > 2000) state.history = state.history.slice(-2000);
  store.set('history', state.history);
}

function renderTrail() {
  const nav = $('#trail');
  nav.replaceChildren();
  state.trail.forEach((t, i) => {
    const last = i === state.trail.length - 1;
    const el = document.createElement(last ? 'span' : 'a');
    el.textContent = t;
    if (!last) el.href = hrefFor(t);
    nav.append(el);
  });
  const lastEl = nav.lastElementChild;
  if (lastEl) lastEl.scrollIntoView({ inline: 'end', block: 'nearest' });
}

function renderPin() {
  const pinned = state.saved.includes(state.current);
  const btn = $('#pin');
  btn.setAttribute('aria-pressed', String(pinned));
  btn.textContent = pinned ? 'Przypięte' : 'Przypnij';
}

$('#pin').addEventListener('click', () => {
  const t = state.current;
  if (!t) return;
  state.saved = state.saved.includes(t) ? state.saved.filter((x) => x !== t) : [t, ...state.saved];
  store.set('saved', state.saved);
  renderPin();
});

async function openArticle(requested) {
  show('reader');
  const status = $('#status');
  const article = $('#article');
  $('#article-title').textContent = requested;
  article.replaceChildren();
  $('#attribution').replaceChildren();
  status.hidden = false;
  status.textContent = 'Wczytuję…';
  window.scrollTo(0, 0);
  setProgress(0);

  try {
    const data = await api({
      action: 'parse', page: requested, prop: 'text|displaytitle',
      redirects: '1', disableeditsection: '1', disabletoc: '1'
    });
    if (data.error) throw new Error(data.error.info || 'Nie ma takiego hasła.');
    const p = data.parse;
    const title = p.title;
    state.current = title;
    updateTrail(title);

    const tmp = document.createElement('div');
    tmp.innerHTML = p.displaytitle;
    $('#article-title').textContent = tmp.textContent || title;
    document.title = title + ' · Zakamarki';
    article.innerHTML = cleanArticle(p.text);
    const wide = matchMedia('(min-width: 900px)').matches;
    article.querySelectorAll('.infobox-wrap').forEach((d) => { d.open = wide; });
    status.hidden = true;

    const src = document.createElement('a');
    src.href = WIKI + encodeTitle(title);
    src.target = '_blank';
    src.rel = 'noopener';
    src.textContent = 'oryginał na Wikipedii';
    $('#attribution').append('Treść: Wikipedia, licencja CC BY-SA 4.0 · ', src);

    renderTrail();
    renderPin();
  } catch (err) {
    status.textContent = 'Nie udało się wczytać artykułu. ' + (err.message || '');
  }
}

/* ——— pasek postępu (zalążek pomiaru głębokości czytania z etapu 3) ——— */
function setProgress(r) { $('#progress').style.width = (Math.max(0, Math.min(1, r)) * 100) + '%'; }
window.addEventListener('scroll', () => {
  if ($('#view-reader').hidden) return;
  const art = $('#article');
  const total = art.offsetTop + art.offsetHeight - window.innerHeight;
  setProgress(total > 0 ? window.scrollY / total : 1);
}, { passive: true });

/* ——— ustawienia czytania (panel „Aa”) ———
   Każde ustawienie to wartość jednej zmiennej CSS albo atrybutu na <html>; applyReader()
   je wpisuje, a style.css robi resztę. Tło czytnika (data-page) decyduje też, czy paleta
   aplikacji jest w wersji dziennej czy nocnej (data-scheme). */
const PAGES = [
  { id: 'auto', label: 'Jak telefon', swatch: ['#faf9f5', '#262624'] },
  { id: 'papier', label: 'Papier', swatch: ['#faf9f5', '#2d2c28'] },
  { id: 'len', label: 'Len', swatch: ['#f3eee3', '#34302a'] },
  { id: 'szalwia', label: 'Szałwia', swatch: ['#e9ede4', '#283027'] },
  { id: 'lawenda', label: 'Lawendowa mgła', swatch: ['#efecf4', '#2c2938'] },
  { id: 'grafit', label: 'Grafit', swatch: ['#262624', '#d8d5cb'], dark: true },
  { id: 'kakao', label: 'Kakao', swatch: ['#2b2321', '#e3d5c6'], dark: true }
];
const FONTS = [
  { id: 'literata', label: 'Literata', css: '"Literata", Georgia, serif' },
  { id: 'source', label: 'Source Serif', css: '"Source Serif 4", Georgia, serif' },
  { id: 'atkinson', label: 'Atkinson', css: '"Atkinson Hyperlegible Next", system-ui, sans-serif' },
  { id: 'system', label: 'Systemowy', css: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }
];
// Grubość kreski: przy astygmatyzmie odrobinę grubsze litery mniej się rozmywają, zwłaszcza na ciemnym tle.
const WEIGHTS = [
  { id: 360, label: 'Lżejsza' },
  { id: 400, label: 'Zwykła' },
  { id: 450, label: 'Pełniejsza' },
  { id: 500, label: 'Mocna' }
];
const READER_DEFAULT = { page: 'auto', font: 'literata', weight: 400, size: 18, leading: 1.65, measure: 38 };
const MAX_PRESETS = 8;

state.reader = { ...READER_DEFAULT, ...store.get('reader', {}) };
state.presets = store.get('presets', []);

// „Jak telefon” = Papier w dzień, Grafit w trybie ciemnym. To samo liczy skrypt w <head>.
function resolvePage(id) {
  if (!PAGES.some((p) => p.id === id) || id === 'auto') {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'grafit' : 'papier';
  }
  return id;
}

function applyReader() {
  const r = state.reader;
  const root = document.documentElement;
  const page = resolvePage(r.page);
  root.dataset.page = page;
  root.dataset.scheme = PAGES.find((p) => p.id === page).dark ? 'dark' : 'light';
  root.style.setProperty('--font-body', (FONTS.find((f) => f.id === r.font) || FONTS[0]).css);
  root.style.setProperty('--weight', String(r.weight));
  root.style.setProperty('--size', r.size + 'px');
  root.style.setProperty('--leading', String(r.leading));
  root.style.setProperty('--measure', r.measure + 'rem');
  // Pasek systemowy telefonu w kolorze tła motywu.
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
  if (bg) document.querySelector('meta[name="theme-color"]').content = bg;
}

function setReader(patch) {
  state.reader = { ...state.reader, ...patch };
  store.set('reader', state.reader);
  applyReader();
  renderSheet();
}

function choiceButtons(el, items, key, decorate) {
  el.replaceChildren(...items.map((item) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'choice';
    b.setAttribute('aria-pressed', String(state.reader[key] === item.id));
    if (decorate) decorate(b, item);
    b.append(item.label);
    b.addEventListener('click', () => setReader({ [key]: item.id }));
    return b;
  }));
}

function renderSheet() {
  const r = state.reader;
  choiceButtons($('#set-page'), PAGES, 'page', (b, p) => {
    const s = document.createElement('span');
    s.className = 'swatch';
    s.style.background = `radial-gradient(circle, ${p.swatch[1]} 0 28%, ${p.swatch[0]} 31%)`;   // kropka tekstu na tle
    b.append(s);
  });
  choiceButtons($('#set-font'), FONTS, 'font', (b, f) => {
    const s = document.createElement('span');
    s.className = 'font-sample';
    s.style.fontFamily = f.css;
    s.textContent = 'Aa';
    b.append(s);
  });
  choiceButtons($('#set-weight'), WEIGHTS, 'weight', (b, w) => {
    const s = document.createElement('span');
    s.className = 'font-sample';
    s.style.fontWeight = w.id;
    s.textContent = 'Aa';
    b.append(s);
  });
  $('#set-size').value = r.size;        $('#out-size').textContent = r.size + ' px';
  $('#set-leading').value = r.leading;  $('#out-leading').textContent = Number(r.leading).toFixed(2);
  $('#set-measure').value = r.measure;  // Przybliżenie: przeciętny znak ma ok. pół wysokości kroju; 1 rem = 16 px.
  $('#out-measure').textContent = `~${Math.round(r.measure * 32 / r.size)} znaków · tablet i komputer`;

  const list = $('#presets');
  list.replaceChildren(...state.presets.map((p, i) => {
    const wrap = document.createElement('span');
    wrap.className = 'preset';
    const use = document.createElement('button');
    use.type = 'button';
    use.textContent = p.name;
    use.addEventListener('click', () => setReader({ ...READER_DEFAULT, ...p.settings }));
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '×';
    del.setAttribute('aria-label', 'Usuń preset ' + p.name);
    del.addEventListener('click', () => {
      state.presets.splice(i, 1);
      store.set('presets', state.presets);
      renderSheet();
    });
    wrap.append(use, del);
    return wrap;
  }));
}

for (const key of ['size', 'leading', 'measure']) {
  $('#set-' + key).addEventListener('input', (e) => setReader({ [key]: Number(e.target.value) }));
}

$('#preset-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#preset-name').value.trim();
  if (!name) return;
  // Ta sama nazwa nadpisuje preset; nowe trafiają na początek, najstarsze wypadają po MAX_PRESETS.
  state.presets = [{ name, settings: { ...state.reader } }, ...state.presets.filter((p) => p.name !== name)].slice(0, MAX_PRESETS);
  store.set('presets', state.presets);
  $('#preset-name').value = '';
  $('#preset-name').blur();
  renderSheet();
});

$('#sheet-reset').addEventListener('click', () => setReader({ ...READER_DEFAULT }));

function toggleSheet(open) {
  $('#sheet').hidden = !open;
  $('#sheet-catcher').hidden = !open;
  $('#aa').setAttribute('aria-expanded', String(open));
  if (open) renderSheet();
}
$('#aa').addEventListener('click', () => toggleSheet($('#sheet').hidden));
$('#sheet-done').addEventListener('click', () => toggleSheet(false));
$('#sheet-catcher').addEventListener('click', () => toggleSheet(false));

applyReader();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyReader);

/* ——— przypisy jako dymki ——— */
function showNote(anchorEl, id) {
  const src = document.getElementById(id);
  if (!src) return false;
  const body = src.querySelector('.reference-text') || src;
  const note = $('#note');
  const num = document.createElement('span');
  num.className = 'note-num';
  num.textContent = anchorEl.textContent.replace(/[[\]]/g, '');
  const content = body.cloneNode(true);
  content.querySelectorAll('.mw-cite-backlink, [id]').forEach((n) => n.classList.contains('mw-cite-backlink') ? n.remove() : n.removeAttribute('id'));
  note.replaceChildren(num, ...content.childNodes);
  note.hidden = false;
  noteScrollY = scrollY;

  // Pod odnośnikiem, a gdy brakuje miejsca — nad nim. Poziomo w granicach ekranu.
  const r = anchorEl.getBoundingClientRect();
  const w = note.offsetWidth, h = note.offsetHeight, m = 16;
  note.style.left = Math.max(m, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - m)) + 'px';
  note.style.top = (r.bottom + 8 + h < innerHeight - m ? r.bottom + 8 : Math.max(m, r.top - 8 - h)) + 'px';
  return true;
}
function hideNote() { $('#note').hidden = true; }

document.addEventListener('click', (e) => {
  if (!e.target.closest('#note') && !e.target.closest('sup.reference')) hideNote();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { hideNote(); toggleSheet(false); toggleSearch(false); }
});
// Zamykamy dopiero po wyraźnym przewinięciu: na telefonie chowający się pasek adresu
// też wywołuje „scroll”, a nie powinien zamykać dymka.
let noteScrollY = 0;
window.addEventListener('scroll', () => {
  if (!$('#note').hidden && Math.abs(scrollY - noteScrollY) > 60) hideNote();
}, { passive: true });
$('#note').addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (a?.dataset.title) { state.pendingFrom = state.current; hideNote(); }
});

/* ——— routing: adres #/wiki/Tytuł otwiera artykuł; przycisk „wstecz” działa naturalnie ——— */
function route() {
  const m = location.hash.match(/^#\/wiki\/(.+)$/);
  $('#suggestions').hidden = true;
  if (m) toggleSearch(false);
  if (m) openArticle(decodeTitle(m[1]));
  else renderHome();
}
window.addEventListener('hashchange', route);
route();

/* ——— instalacja jako aplikacja i trwałość danych ——— */
if ('serviceWorker' in navigator) {
  // Gdy po wdrożeniu nowy service worker przejmie stronę, przeładuj ją raz, żeby od razu
  // pokazać nową wersję. Pomijamy pierwszą instalację (wcześniej nie było żadnego).
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !reloaded) { reloaded = true; location.reload(); }
  });
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
