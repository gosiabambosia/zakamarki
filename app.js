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
  history: store.get('history', []),      // każde otwarcie: {title, at, from, j?}
  saved: store.get('saved', ['Garden city movement']),
  current: null,
  pendingFrom: null,                      // ustawiane, gdy klikasz link w artykule
  pendingResume: null,                    // id tropu, gdy wracasz do niego z ekranu startowego
  searchFrom: null                        // hasło, z którego otwarto wyszukiwarkę w czytniku (skok)
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

/* ——— tropy ———
   Trop = {id, steps: [{t: tytuł, j?: 1 przy skoku z wyszukiwarki}], pos, start, end, branchOf?}.
   pos wskazuje, gdzie w tropie jesteś: powrót o krok przesuwa pos i niczego nie kasuje.
   Nowy link z wcześniejszego kroku tworzy odgałęzienie: nowy trop ze wspólnym początkiem.
   Bieżący trop jest zawsze ostatni na liście; wznowienie starego przenosi go na koniec. */
const MAX_TRAILS = 500;
const curTrail = () => state.trails[state.trails.length - 1] || null;
const trailTitles = (T) => T.steps.map((s) => s.t);

function newTrail(steps, at, branchOf) {
  const T = { id: 't' + at.toString(36) + '-' + state.trails.length, steps, pos: steps.length - 1, start: at, end: at };
  if (branchOf) T.branchOf = branchOf;
  state.trails.push(T);
  if (state.trails.length > MAX_TRAILS) state.trails.splice(0, state.trails.length - MAX_TRAILS);
  return T;
}

// Jeden krok czytania. from = hasło, z którego kliknięto link; jump = skok z wyszukiwarki w czytniku;
// resume = id tropu wybranego na ekranie startowym.
function applyStep(title, { from = null, jump = false, resume = null, at = Date.now() } = {}) {
  let T = curTrail();
  if (resume) {
    const i = state.trails.findIndex((t) => t.id === resume);
    if (i !== -1) {
      T = state.trails.splice(i, 1)[0];
      state.trails.push(T);
      const k = trailTitles(T).lastIndexOf(title);
      if (k !== -1) { T.pos = k; T.end = at; return; }
    }
  }
  const src = from || (jump && T ? T.steps[T.pos].t : null);
  if (T && src && T.steps[T.pos]?.t === src) {
    if (T.steps[T.pos + 1]?.t === title) { T.pos++; T.end = at; return; }   // znowu tą samą drogą
    if (T.pos < T.steps.length - 1) T = newTrail(T.steps.slice(0, T.pos + 1), at, T.id);   // odgałęzienie
    T.steps.push(jump ? { t: title, j: 1 } : { t: title });
    T.pos = T.steps.length - 1;
    T.end = at;
    return;
  }
  if (T && !src) {                       // „wstecz”, stuknięcie w trop albo w hasło z historii
    const k = trailTitles(T).indexOf(title);
    if (k !== -1) { T.pos = k; T.end = at; return; }
  }
  newTrail(src ? [{ t: src }, { t: title }] : [{ t: title }], at);
}

// Pierwsze uruchomienie z archiwum tropów: odtwarzamy je z historii otwarć (pole from mówi,
// skąd przyszłaś linkiem). Wychodzi to samo, co dałaby nowa logika, gdyby działała od początku.
function loadTrails() {
  const saved = store.get('trails', null);
  if (Array.isArray(saved)) return saved;
  state.trails = [];
  for (const h of state.history) applyStep(h.title, { from: h.from || null, at: h.at });
  const old = store.get('trail', []);    // stary zapis bieżącego tropu (sama lista tytułów)
  if (!state.trails.length && old.length) newTrail(old.map((t) => ({ t })), Date.now());
  store.set('trails', state.trails);
  return state.trails;
}
state.trails = loadTrails();

// „14 min temu”, „wczoraj”…
function ago(at) {
  const m = Math.round((Date.now() - at) / 6e4);
  if (m < 1) return 'przed chwilą';
  if (m < 60) return `${m} min temu`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} godz. temu`;
  const d = Math.round(h / 24);
  return d === 1 ? 'wczoraj' : `${d} dni temu`;
}
const lastOpened = (title) => { for (let i = state.history.length - 1; i >= 0; i--) if (state.history[i].title === title) return state.history[i].at; return null; };

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
  state.searchFrom = null;

  // Nagłówek: wielka liczba dnia. Gdy dziś nic, liczba tygodnia, a gdy i to zero — wszystkich.
  const hist = state.history;
  const total = new Set(hist.map((h) => h.title)).size;
  const today = new Date().setHours(0, 0, 0, 0);
  const weekAgo = Date.now() - 7 * 864e5;
  const uniq = (from) => new Set(hist.filter((h) => h.at >= from).map((h) => h.title)).size;
  const todayN = uniq(today), weekN = uniq(weekAgo);
  const realTrails = state.trails.filter((T) => T.steps.length > 1);
  const trailsToday = realTrails.filter((T) => T.end >= today).length;
  const [num, unit, sub] = todayN
    ? [todayN, `${plural(todayN, 'hasło', 'hasła', 'haseł')} dziś`, trailsToday ? `${trailsToday} ${plural(trailsToday, 'trop', 'tropy', 'tropów')} · ${total} w sumie` : `${total} w sumie`]
    : weekN
      ? [weekN, `${plural(weekN, 'hasło', 'hasła', 'haseł')} w tym tygodniu`, `${total} w sumie`]
      : [total, `${plural(total, 'hasło', 'hasła', 'haseł')} w sumie`, hist.length ? `ostatnio ${ago(hist[hist.length - 1].at)}` : ''];
  $('#hero').hidden = !total;
  $('#hero-search').hidden = !!total;
  $('#hero-num').textContent = num;
  $('#hero-unit').textContent = unit;
  $('#hero-sub').textContent = sub;

  // „Czytaj dalej”: miejsce, w którym jesteś w bieżącym tropie.
  const T = curTrail();
  const cont = $('#continue');
  cont.hidden = !T;
  if (T) {
    const t = T.steps[T.pos].t;
    cont.href = hrefFor(t);
    cont.dataset.resume = T.id;
    cont.querySelector('.next-t').textContent = t;
    const when = lastOpened(t);
    cont.querySelector('.next-s').textContent = [when && ago(when), T.steps.length > 1 && `${T.pos + 1}. krok tropu`].filter(Boolean).join(' · ');
    const paint = () => {
      const img = cont.querySelector('.next-img');
      const src = state.thumbs[t];
      img.textContent = src ? '' : t[0];
      img.style.backgroundImage = src ? `url("${src}")` : '';
      img.classList.toggle('no-img', !src);
    };
    paint();
    if (!(t in state.thumbs)) loadThumbs([t, ...state.saved]).then(() => { if (!$('#view-home').hidden) { paint(); renderShelf(state.saved); } });
  }

  // Półka z przypiętymi: najpierw od razu (z pamięci), potem z dociągniętymi miniaturami.
  $('#saved-count').textContent = state.saved.length ? `${state.saved.length} ${plural(state.saved.length, 'hasło', 'hasła', 'haseł')}` : '';
  renderShelf(state.saved);
  if (state.saved.some((t) => !(t in state.thumbs))) loadThumbs(state.saved).then(() => {
    if (!$('#view-home').hidden) renderShelf(state.saved);
  });

  // Tropy: najnowsze pięć (z co najmniej dwoma hasłami), 0.1…; stuknięcie wznawia trop.
  const ol = $('#trails-list');
  ol.replaceChildren();
  $('#trails-count').textContent = realTrails.length ? `${realTrails.length} ${plural(realTrails.length, 'trop', 'tropy', 'tropów')}` : '';
  const shown = realTrails.slice(-5).reverse();
  if (!shown.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Kliknij link w artykule, a zacznie się trop.';
    ol.append(li);
  }
  shown.forEach((tr, i) => {
    const li = document.createElement('li');
    if (tr === T) li.className = 'now';
    const a = document.createElement('a');
    const here = tr.steps[tr.pos].t;
    a.href = hrefFor(here);
    a.dataset.resume = tr.id;
    a.innerHTML = '<span class="n"></span><span class="t"><span class="route"></span><span class="desc"></span></span><span class="go" aria-hidden="true">→</span>';
    a.querySelector('.n').textContent = '0.' + (i + 1);
    a.querySelector('.route').textContent = `${tr.steps[0].t} → ${tr.steps[tr.steps.length - 1].t}`;
    const jumps = tr.steps.filter((x) => x.j).length;
    a.querySelector('.desc').textContent = [`${tr.steps.length} ${plural(tr.steps.length, 'hasło', 'hasła', 'haseł')}`, jumps && `${jumps} ${plural(jumps, 'skok', 'skoki', 'skoków')}`, ago(tr.end)].filter(Boolean).join(' · ');
    li.append(a);
    ol.append(li);
  });

  const seen = new Set();
  const recent = [];
  for (let i = hist.length - 1; i >= 0 && recent.length < 10; i--) {
    const t = hist[i].title;
    if (!seen.has(t)) { seen.add(t); recent.push(t); }
  }
  fillList($('#history-list'), recent, 'Historia pojawi się po pierwszym artykule.');
  renderBackup();
}

// Linki z ekranu startowego, które wznawiają trop (karta „Czytaj dalej”, lista tropów).
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-resume]');
  if (a) state.pendingResume = a.dataset.resume;
});
$('#hero-search').addEventListener('click', () => toggleSearch(true));

/* ——— kopia zapasowa ———
   Eksport: jeden plik JSON ze wszystkim, co zapisała aplikacja (bez miniatur — to tylko pamięć
   podręczna, da się je pobrać ponownie). Import łączy plik z danymi w aplikacji, niczego nie
   zastępuje: wczytanie starej kopii nie skasuje nowszej historii. */
const BACKUP_VERSION = 1;

function backupSummary(d) {
  const n = (x) => (Array.isArray(x) ? x.length : 0);
  const trails = (d.trails || []).filter((T) => T.steps?.length > 1).length;
  return `${n(d.history)} ${plural(n(d.history), 'otwarcie', 'otwarcia', 'otwarć')} · ${trails} ${plural(trails, 'trop', 'tropy', 'tropów')} · ${n(d.saved)} ${plural(n(d.saved), 'przypięte', 'przypięte', 'przypiętych')} · ${n(d.presets)} ${plural(n(d.presets), 'preset', 'presety', 'presetów')}`;
}

function renderBackup() {
  const at = store.get('backupAt', null);
  $('#backup-age').textContent = at ? `ostatnia ${ago(at)}` : 'jeszcze żadnej';
  $('#backup-info').textContent = 'W aplikacji: ' + backupSummary(state);
}

function backupMsg(text) {
  const m = $('#backup-msg');
  m.textContent = text;
  m.hidden = !text;
}

$('#backup-save').addEventListener('click', () => {
  const data = { history: state.history, trails: state.trails, saved: state.saved, reader: state.reader, presets: state.presets };
  const file = { app: 'zakamarki', version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data };
  const blob = new Blob([JSON.stringify(file)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `zakamarki-kopia-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  store.set('backupAt', Date.now());
  renderBackup();
  backupMsg('Zapisano plik w Pobranych: ' + a.download);
});

// Łączenie: historia po (tytuł, czas), tropy po id (wygrywa nowszy), przypięte i presety — suma.
function mergeBackup(d) {
  const key = (h) => h.title + '|' + h.at;
  const hist = new Map(state.history.map((h) => [key(h), h]));
  for (const h of d.history || []) if (h && typeof h.title === 'string' && Number.isFinite(h.at)) hist.set(key(h), h);
  state.history = [...hist.values()].sort((a, b) => a.at - b.at).slice(-2000);

  const trails = new Map(state.trails.map((T) => [T.id, T]));
  for (const T of d.trails || []) {
    if (!T?.id || !Array.isArray(T.steps) || !T.steps.length) continue;
    const mine = trails.get(T.id);
    if (!mine || (T.end || 0) > (mine.end || 0)) trails.set(T.id, T);
  }
  // Bieżący trop zostaje bieżącym (ostatnim); reszta według czasu ostatniego kroku.
  const cur = curTrail();
  state.trails = [...trails.values()].filter((T) => T !== cur).sort((a, b) => (a.end || 0) - (b.end || 0));
  if (cur) state.trails.push(trails.get(cur.id) || cur);

  for (const t of d.saved || []) if (typeof t === 'string' && !state.saved.includes(t)) state.saved.push(t);
  for (const p of d.presets || []) if (p?.name && !state.presets.some((x) => x.name === p.name)) state.presets.push(p);
  state.presets = state.presets.slice(0, MAX_PRESETS);
  // Ustawienia czytania należą do urządzenia; z pliku bierzemy je tylko, gdy tu są domyślne.
  if (d.reader && sameAsDefault(state.reader)) setReader({ ...READER_DEFAULT, ...d.reader });

  store.set('history', state.history);
  store.set('trails', state.trails);
  store.set('saved', state.saved);
  store.set('presets', state.presets);
}
const sameAsDefault = (r) => Object.keys(READER_DEFAULT).every((k) => String(r[k]) === String(READER_DEFAULT[k]));

$('#backup-load').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  let file;
  try { file = JSON.parse(await f.text()); } catch { backupMsg('To nie jest plik kopii Zakamarków (nie da się odczytać JSON).'); return; }
  if (file?.app !== 'zakamarki' || !file.data) { backupMsg('To nie jest plik kopii Zakamarków.'); return; }
  if (file.version > BACKUP_VERSION) { backupMsg('Kopia pochodzi z nowszej wersji aplikacji. Zaktualizuj aplikację i spróbuj ponownie.'); return; }
  const when = file.exportedAt ? new Date(file.exportedAt).toLocaleDateString('pl-PL') : '?';
  if (!confirm(`Kopia z ${when}:\n${backupSummary(file.data)}\n\nPołączyć z danymi w aplikacji? Nic nie zostanie usunięte.`)) return;
  const before = state.history.length;
  mergeBackup(file.data);
  renderHome();
  backupMsg(`Wczytano. Nowych wpisów w historii: ${state.history.length - before}.`);
});

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
  // Zwinięte pole jest ukryte, ale trzyma wartość; czyścimy je, żeby po otwarciu
  // nie czekał w nim stary tekst (na Androidzie wyglądało na puste aż do stuknięcia).
  $('#search').value = '';
  $('#suggestions').hidden = true;
  if (open) $('#search').focus();
  else $('#search').blur();
}
$('#search-toggle').addEventListener('click', () => {
  const open = !$('.bar').classList.contains('is-searching');
  // Wyszukanie z czytnika to skojarzeniowy skok w tym samym tropie; ze startu — nowy trop.
  state.searchFrom = open && !$('#view-reader').hidden ? state.current : null;
  toggleSearch(open);
});

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
  const from = state.pendingFrom, resume = state.pendingResume;
  const jump = !from && !resume && state.searchFrom && state.searchFrom !== title;
  state.pendingFrom = state.pendingResume = state.searchFrom = null;
  applyStep(title, { from, resume, jump: !!jump });
  store.set('trails', state.trails);

  const entry = { title, at: Date.now(), from: from || (jump ? state.current : null) };
  if (jump) entry.j = 1;
  state.history.push(entry);
  if (state.history.length > 2000) state.history = state.history.slice(-2000);
  store.set('history', state.history);
}

// Trop nad artykułem: kroki przed bieżącym to linki, bieżący wyróżniony, kroki „przed tobą”
// (gdy cofnęłaś się w tropie) przygaszone; skok z wyszukiwarki ma przerywaną ramkę.
function renderTrail() {
  const nav = $('#trail');
  nav.replaceChildren();
  const T = curTrail();
  if (!T) return;
  T.steps.forEach((s, i) => {
    const here = i === T.pos;
    const el = document.createElement(here ? 'span' : 'a');
    el.textContent = s.t;
    if (!here) el.href = hrefFor(s.t);
    if (i > T.pos) el.classList.add('ahead');
    if (s.j) { el.classList.add('jump'); el.title = 'skok z wyszukiwarki'; }
    nav.append(el);
  });
  const cur = nav.children[T.pos];
  if (cur) cur.scrollIntoView({ inline: 'center', block: 'nearest' });
  const prev = T.steps[T.pos - 1];
  const back = $('#back-step');
  back.hidden = !prev;
  if (prev) { back.href = hrefFor(prev.t); back.querySelector('.t').textContent = prev.t; }
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
    updateTrail(title);       // przed zmianą state.current: skok pamięta hasło, z którego wyszukiwano
    state.current = title;

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

/* ——— szybki powrót: poprzedni krok tropu + na górę ———
   Pokazuje się przy przewijaniu w górę (jak pasek adresu w Chrome), chowa przy czytaniu w dół
   i blisko początku artykułu, gdzie trop jest widoczny nad tytułem. */
let floatY = 0;
function hideFloat() { $('#float').hidden = true; }
window.addEventListener('scroll', () => {
  if ($('#view-reader').hidden) return;
  const y = scrollY, dy = y - floatY;
  if (Math.abs(dy) < 12) return;
  floatY = y;
  $('#float').hidden = dy > 0 || y < 300;
}, { passive: true });
$('#to-top').addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); hideFloat(); });

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

// Kafel-próbka zamiast przycisku z nazwą; nazwa zostaje w aria-label (czytnik ekranu) i title.
function tileButtons(el, items, key, decorate) {
  el.replaceChildren(...items.map((item) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile';
    b.setAttribute('aria-label', item.label);
    b.title = item.label;
    b.setAttribute('aria-pressed', String(state.reader[key] === item.id));
    decorate(b, item);
    b.addEventListener('click', () => setReader({ [key]: item.id }));
    return b;
  }));
}

const SETTING_KEYS = ['page', 'font', 'weight', 'size', 'leading', 'measure'];
const sameSettings = (a) => SETTING_KEYS.every((k) => String(a[k] ?? READER_DEFAULT[k]) === String(state.reader[k]));

// Próbka „Aa” w kolorach danego tła; „Jak telefon” = pół jasnej, pół ciemnej kartki.
function paintPage(el, pageId) {
  const p = PAGES.find((x) => x.id === pageId) || PAGES[0];
  if (p.id === 'auto') {
    el.style.background = `linear-gradient(135deg, ${PAGES[1].swatch[0]} 50%, ${PAGES[5].swatch[0]} 50%)`;
    el.style.color = PAGES[1].swatch[1];
    el.classList.add('split');
  } else {
    el.style.background = p.swatch[0];
    el.style.color = p.swatch[1];
  }
}

function renderSheet() {
  const r = state.reader;
  const fontCss = (FONTS.find((f) => f.id === r.font) || FONTS[0]).css;
  tileButtons($('#set-page'), PAGES, 'page', (b, p) => {
    paintPage(b, p.id);
    b.style.fontFamily = fontCss;
    if (p.id === 'auto') b.innerHTML = '<span>Aa</span><span>Aa</span>';
    else b.textContent = 'Aa';
  });
  tileButtons($('#set-font'), FONTS, 'font', (b, f) => { b.style.fontFamily = f.css; b.textContent = 'Ag'; });
  tileButtons($('#set-weight'), WEIGHTS, 'weight', (b, w) => { b.style.fontFamily = fontCss; b.style.fontWeight = w.id; b.textContent = 'Aa'; });
  $('#set-size').value = r.size;
  $('#set-leading').value = r.leading;
  $('#set-measure').value = r.measure;

  // Presety jako kafle w swoich kolorach, kroju i grubości. × widać tylko przy „Dostosuj”.
  const list = $('#presets');
  list.replaceChildren(...state.presets.map((p, i) => {
    const set = { ...READER_DEFAULT, ...p.settings };
    const card = document.createElement('div');
    card.className = 'pcard';
    const use = document.createElement('button');
    use.type = 'button';
    use.className = 'pcard-use';
    use.setAttribute('aria-pressed', String(sameSettings(set)));
    paintPage(use, set.page);
    use.style.fontFamily = (FONTS.find((f) => f.id === set.font) || FONTS[0]).css;
    use.innerHTML = '<b></b><small></small>';
    use.querySelector('b').textContent = 'Aa';
    use.querySelector('b').style.fontWeight = set.weight;
    use.querySelector('small').textContent = p.name;
    use.addEventListener('click', () => setReader(set));
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'pdel';
    del.textContent = '×';
    del.setAttribute('aria-label', 'Usuń preset ' + p.name);
    del.addEventListener('click', () => {
      state.presets.splice(i, 1);
      store.set('presets', state.presets);
      renderSheet();
    });
    card.append(use, del);
    return card;
  }));
  if (state.presets.length < MAX_PRESETS) {
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'pcard-add';
    add.textContent = '+';
    add.setAttribute('aria-label', 'Zapisz bieżące ustawienia jako preset');
    add.addEventListener('click', () => {
      $('#preset-form').hidden = false;
      $('#preset-name').focus();
    });
    list.append(add);
  }
}

for (const key of ['size', 'leading', 'measure']) {
  $('#set-' + key).addEventListener('input', (e) => setReader({ [key]: Number(e.target.value) }));
}

$('#preset-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#preset-name').value.trim();
  if (!name) return;
  // Ta sama nazwa nadpisuje preset; nowe trafiają na koniec (kolejność kafli się nie przestawia).
  const settings = Object.fromEntries(SETTING_KEYS.map((k) => [k, state.reader[k]]));
  const i = state.presets.findIndex((p) => p.name === name);
  if (i !== -1) state.presets[i] = { name, settings };
  else state.presets = [...state.presets, { name, settings }].slice(-MAX_PRESETS);
  store.set('presets', state.presets);
  $('#preset-name').value = '';
  $('#preset-name').blur();
  $('#preset-form').hidden = true;
  renderSheet();
});

$('#sheet-reset').addEventListener('click', () => setReader({ ...READER_DEFAULT }));

function toggleSheet(open) {
  $('#sheet').hidden = !open;
  $('#sheet-catcher').hidden = !open;
  $('#aa').setAttribute('aria-expanded', String(open));
  $('#preset-form').hidden = true;
  // Bez zapisanych presetów nie ma czego wybierać na wierzchu — od razu szczegóły.
  if (open) { $('#tune').open = !state.presets.length; renderSheet(); }
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
  if (e.key === 'Escape') { hideNote(); toggleSheet(false); toggleSearch(false); state.searchFrom = null; }
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
  hideFloat();
  if (m) { toggleSearch(false); openArticle(decodeTitle(m[1])); }
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
