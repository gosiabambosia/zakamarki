/* Zakamarki — etap 3: wyszukiwanie, czytnik, tropy, ustawienia czytania, przypisy jako dymki,
   pomiar głębokości czytania (akapity), trzy półki, kopia zapasowa.
   Całość działa w przeglądarce telefonu. Serwer (GitHub Pages) tylko podaje pliki. */

/* Język Wikipedii jest parametrem. Hasło z angielskiej to po prostu tytuł („Octopus”), hasło
   z polskiej ma w kluczu przedrostek „pl:” („pl:Ośmiornice”) — ten sam klucz w tropach, historii,
   stanie czytania i zakreśleniach. Angielskie tytuły zawsze zaczynają się wielką literą, więc
   przedrostek nie może się z niczym pomylić. */
const WIKI_LANG = 'en';
const apiFor = (lang) => `https://${lang}.wikipedia.org/w/api.php`;
const wikiFor = (lang) => `https://${lang}.wikipedia.org/wiki/`;
const langOf = (key) => (key && key.startsWith('pl:') ? 'pl' : WIKI_LANG);
const bareTitle = (key) => (key && key.startsWith('pl:') ? key.slice(3) : key);
const shownTitle = bareTitle;
const keyFor = (lang, t) => (lang === WIKI_LANG ? t : lang + ':' + t);

// Linki do stron, które nie są hasłami (pliki, kategorie, strony pomocy itd.) otwieramy na Wikipedii.
// Polska Wikipedia: Plik, Kategoria, Szablon, Specjalna, Pomoc, Dyskusja, Wikiprojekt, Moduł…
const NON_ARTICLE = /^(File|Image|Special|Help|Wikipedia|WP|Category|Template|Portal|Talk|User|Draft|Module|MediaWiki|Book|TimedText|Plik|Grafika|Kategoria|Szablon|Specjalna|Pomoc|Dyskusja|Użytkownik|Wikiprojekt|Moduł)(_talk)?:/i;

// Elementy usuwane z treści: przyciski edycji, szablony nawigacyjne, ostrzeżenia redakcyjne.
const REMOVE = [
  '.mw-editsection', '.navbox', '.navbox-styles', '.vertical-navbox', '.sistersitebox',
  '.side-box', '.metadata', '.ambox', '.ombox', '.tmbox', '.mw-empty-elt', '.portalbox',
  '.mw-authority-control', '.catlinks', 'style', 'link', 'script', 'meta'
].join(',');

/* ——— pamięć w przeglądarce: IndexedDB ———
   Baza „zakamarki” ma dwa magazyny: „kv” (klucz → wartość: tropy, przypięte, ustawienia, presety,
   miniatury) i „history” (każde otwarcie hasła jako osobny wpis, dopisywany, nie przepisywany).
   Przy starcie wszystko ładuje się raz do pamięci (store.cache), więc odczyty są natychmiastowe,
   a zapisy idą do bazy w tle. Pierwsze uruchomienie przenosi dane z localStorage (zostają tam
   nietknięte jako kopia). Bez IndexedDB (np. bardzo stara przeglądarka) działa jak dawniej
   na localStorage. Ustawienia czytnika zapisujemy też w localStorage, bo czyta je skrypt
   w <head> przed pierwszym rysowaniem. */
const LS_PREFIX = 'zakamarki:';
const LS_HISTORY_MAX = 2000;            // tylko w trybie zapasowym; IndexedDB nie ma tego limitu
const lsGet = (key) => { try { const v = localStorage.getItem(LS_PREFIX + key); return v ? JSON.parse(v) : undefined; } catch { return undefined; } };
const lsSet = (key, value) => { try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); } catch {} };

function lsAll() {
  const out = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(LS_PREFIX)) { const v = lsGet(k.slice(LS_PREFIX.length)); if (v !== undefined) out[k.slice(LS_PREFIX.length)] = v; }
    }
  } catch {}
  return out;
}

/* Wersje bazy. Przeglądarka sama wywołuje onupgradeneeded, gdy wersja w kodzie jest wyższa niż
   zapisana; oldVersion mówi, od której zaczynamy, więc każdy krok dodaje tylko to, czego brakuje,
   a istniejące magazyny (i dane w nich) zostają nietknięte.
   v1: kv + history. v2: reads (stan czytania każdego hasła, etap 3.3).
   v3: highlights (zakreślenia, etap 3b) — klucz id, indeksy po haśle i czasie. */
const DB_VERSION = 4;

function openDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('brak IndexedDB')); return; }
    const req = indexedDB.open('zakamarki', DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (e.oldVersion < 1) {
        db.createObjectStore('kv');
        db.createObjectStore('history', { autoIncrement: true }).createIndex('at', 'at');
      }
      if (e.oldVersion < 2) db.createObjectStore('reads', { keyPath: 'title' });
      if (e.oldVersion < 3) {
        const h = db.createObjectStore('highlights', { keyPath: 'id' });
        h.createIndex('title', 'title');
        h.createIndex('at', 'at');
      }
      // v4 (etap 4): linki wychodzące haseł — pamięć podręczna do Tropu i Węzłów, poza kopią zapasową.
      if (e.oldVersion < 4) db.createObjectStore('links', { keyPath: 'title' });
    };
    // Starsza wersja aplikacji otwarta w innej karcie trzyma bazę i blokuje aktualizację.
    req.onblocked = () => {
      const p = document.createElement('p');
      p.className = 'status';
      p.textContent = 'Zamknij inne karty z Zakamarkami — aplikacja aktualizuje pamięć.';
      document.querySelector('main').prepend(p);
    };
    req.onsuccess = () => {
      const db = req.result;
      // Gdy kiedyś nowsza wersja w innej karcie zechce podnieść bazę, oddajemy ją i przeładowujemy.
      db.onversionchange = () => { db.close(); location.reload(); };
      resolve(db);
    };
    req.onerror = () => reject(req.error);
  });
}

// Jedna transakcja na jeden lub kilka magazynów; obietnica spełnia się po zatwierdzeniu zapisu.
function tx(names, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = store.db.transaction(names, mode);
    const stores = [].concat(names).map((n) => t.objectStore(n));
    const req = fn(...stores);
    t.oncomplete = () => resolve(req?.result);
    t.onerror = t.onabort = () => reject(t.error);
  });
}

const store = {
  db: null,
  cache: {},
  get(key, fallback) { return key in this.cache ? this.cache[key] : fallback; },
  set(key, value) {
    this.cache[key] = value;
    if (key === 'reader' || !this.db) lsSet(key, key === 'history' ? value.slice(-LS_HISTORY_MAX) : value);
    if (this.db) {
      if (key === 'history') this.replaceHistory(value);
      else tx('kv', 'readwrite', (kv) => { kv.put(value, key); }).catch(() => lsSet(key, value));
    }
  },
  // Klucze wpisów historii w IndexedDB (wpis → klucz albo obietnica klucza), żeby wizytę
  // dało się później uzupełnić (czas, przeczytane akapity) zamiast dopisywać nowy wpis.
  keys: new WeakMap(),
  // Nowa wizyta: w IndexedDB dopisujemy jeden wpis zamiast przepisywać całą historię.
  addHistory(entry, list) {
    this.cache.history = list;
    if (this.db) {
      const key = tx('history', 'readwrite', (h) => h.add(entry));
      key.catch(() => {});
      this.keys.set(entry, key);
    } else lsSet('history', list.slice(-LS_HISTORY_MAX));
  },
  replaceHistory(list) {
    const keys = this.keys;
    tx('history', 'readwrite', (h) => {
      h.clear();
      for (const e of list) {
        const r = h.add(e);
        keys.set(e, new Promise((res) => { r.onsuccess = () => res(r.result); }));
      }
    }).catch(() => {});
  },
  // Zapis trwającej wizyty i stanu czytania hasła w jednej transakcji.
  async saveVisit(entry, rec) {
    if (!this.db) {
      lsSet('history', state.history.slice(-LS_HISTORY_MAX));
      lsSet('reads', Object.fromEntries(state.reads));
      return;
    }
    const key = entry ? await this.keys.get(entry) : undefined;
    tx(['history', 'reads'], 'readwrite', (h, r) => {
      if (key !== undefined) h.put(entry, key);
      if (rec) r.put(rec);
    }).catch(() => {});
  },
  putReads(list) {
    if (!this.db) { lsSet('reads', Object.fromEntries(state.reads)); return; }
    tx('reads', 'readwrite', (r) => { for (const rec of list) r.put(rec); }).catch(() => {});
  },
  // Zakreślenia: każde osobnym wpisem (dopisanie, zmiana koloru, usunięcie jednego).
  putHighlights(list) {
    if (!this.db) { lsSet('highlights', state.highlights); return; }
    tx('highlights', 'readwrite', (h) => { for (const rec of list) h.put(rec); }).catch(() => {});
  },
  deleteHighlight(id) {
    if (!this.db) { lsSet('highlights', state.highlights); return; }
    tx('highlights', 'readwrite', (h) => { h.delete(id); }).catch(() => {});
  },
  // Linki wychodzące (etap 4): czytane dopiero przy pierwszym liczeniu Tropu albo Węzłów, nie przy starcie.
  // Bez IndexedDB żyją tylko do końca sesji (da się je zawsze pobrać jeszcze raz).
  allLinks() { return this.db ? tx('links', 'readonly', (l) => l.getAll()).catch(() => []) : Promise.resolve([]); },
  putLinks(rec) { if (this.db) tx('links', 'readwrite', (l) => { l.put(rec); }).catch(() => {}); }
};

async function migrateFromLocalStorage() {
  const ls = lsAll();
  const at = Date.now();
  await tx(['kv', 'history'], 'readwrite', (kv, h) => {
    for (const [k, v] of Object.entries(ls)) if (k !== 'history') kv.put(v, k);
    for (const e of Array.isArray(ls.history) ? ls.history : []) h.add(e);
    kv.put(at, 'migratedAt');
  });
  Object.assign(store.cache, ls, { migratedAt: at });
}

store.ready = (async () => {
  try {
    store.db = await openDB();
    const [keys, values] = await Promise.all([
      tx('kv', 'readonly', (kv) => kv.getAllKeys()),
      tx('kv', 'readonly', (kv) => kv.getAll())
    ]);
    keys.forEach((k, i) => { store.cache[k] = values[i]; });
    if (!('migratedAt' in store.cache)) await migrateFromLocalStorage();
    const [hist, hkeys, reads, highlights] = await Promise.all([
      tx('history', 'readonly', (h) => h.getAll()),
      tx('history', 'readonly', (h) => h.getAllKeys()),
      tx('reads', 'readonly', (r) => r.getAll()),
      tx('highlights', 'readonly', (h) => h.getAll())
    ]);
    hist.forEach((e, i) => store.keys.set(e, hkeys[i]));
    store.cache.history = hist;
    store.cache.reads = reads;
    store.cache.highlights = highlights;
  } catch {
    store.db = null;                   // tryb zapasowy: localStorage jak w etapach 1–2
    store.cache = lsAll();
    store.cache.reads = Object.values(store.cache.reads || {});
  }
})();

const state = {
  history: [],                            // każda wizyta: {title, at, from, j?, end?, ms?, p?}
  saved: [],                              // półka „Na później” (ręcznie)
  trails: [],
  thumbs: {},
  reads: new Map(),                       // tytuł → stan czytania (magazyn „reads”)
  highlights: [],                         // zakreślenia (magazyn „highlights”), od najstarszego
  pendingHighlight: null,                 // id zakreślenia, do którego przewinąć po otwarciu hasła
  hlFilter: 0,                            // ekran Zakreślenia: 0 = wszystkie, 1–5 = kolor
  visit: null,                            // bieżąca wizyta: {entry, fresh}
  current: null,
  pendingFrom: null,                      // ustawiane, gdy klikasz link w artykule
  pendingResume: null,                    // id tropu, gdy wracasz do niego z ekranu startowego
  pendingReadResume: null,                // hasło do otwarcia na pierwszym nieprzeczytanym akapicie
  searchFrom: null,                       // hasło, z którego otwarto wyszukiwarkę w czytniku (skok)
  openShelves: new Set()                  // rozwinięte półki na ekranie startowym
};

const $ = (sel) => document.querySelector(sel);
const encodeTitle = (t) => encodeURIComponent(t.replace(/ /g, '_'));
const decodeTitle = (s) => decodeURIComponent(s).replace(/_/g, ' ');
const hrefFor = (key) => (langOf(key) === WIKI_LANG ? '#/wiki/' : '#/' + langOf(key) + '/wiki/') + encodeTitle(bareTitle(key));

async function api(params, lang = WIKI_LANG) {
  const q = new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params });
  const res = await fetch(apiFor(lang) + '?' + q);
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
  for (const v of ['home', 'results', 'reader', 'highlights', 'nodes']) $('#view-' + v).hidden = v !== view;
  document.documentElement.dataset.view = view;   // w czytniku tłem strony jest kartka
}

function linkItem(title, desc) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = hrefFor(title);
  a.textContent = shownTitle(title);
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
   także brak zdjęcia (null), żeby nie pytać Wikipedii drugi raz o to samo. Pytamy po 50 tytułów. */
// Zapasowa okładka: gdy hasło nie ma zdjęcia głównego, największe zdjęcie (jpg/png, oba boki ≥ 200 px)
// użyte w haśle — bez ikon z szablonów i pasków (Socrates.png z paska filozofii, logo Commons, znaki zapytania).
const ICON_FILE = /socrates\.png|symbol|question|commons-logo|wikidata|wiki(quote|source|books|versity|news|voyage)|oojs|icon|logo|flag of|padlock|ambox|nuvola|crystal|portal|text document|disambig/i;
async function fallbackThumbs(lang, titles) {
  const found = {};
  const data = await api({ action: 'query', prop: 'images', imlimit: 'max', redirects: '1', titles: titles.map(bareTitle).join('|') }, lang);
  const alias = {};
  for (const m of [...(data.query?.normalized || []), ...(data.query?.redirects || [])]) alias[m.to] = m.from;
  const files = new Map();                 // plik → klucze haseł, w których jest
  for (const pg of data.query?.pages || []) {
    const keys = [keyFor(lang, pg.title), alias[pg.title] && keyFor(lang, alias[pg.title])].filter(Boolean);
    for (const im of pg.images || []) {
      if (!/\.(jpe?g|png|webp)$/i.test(im.title) || ICON_FILE.test(im.title)) continue;
      files.set(im.title, [...(files.get(im.title) || []), ...keys]);
    }
  }
  const all = [...files.keys()];
  const best = {};                         // hasło → {area, url}
  for (let i = 0; i < all.length; i += 50) {
    const info = await api({ action: 'query', prop: 'imageinfo', iiprop: 'url|size', iiurlwidth: '300', titles: all.slice(i, i + 50).join('|') }, lang);
    for (const f of info.query?.pages || []) {
      const ii = f.imageinfo?.[0];
      if (!ii || ii.width < 200 || ii.height < 200) continue;
      for (const k of files.get(f.title) || []) {
        const area = ii.width * ii.height;
        if (!best[k] || area > best[k].area) best[k] = { area, url: ii.thumburl || ii.url };
      }
    }
  }
  for (const [k, v] of Object.entries(best)) found[k] = v.url;
  return found;
}

// null = sprawdzone dawniej bez zapasu (sprawdzamy jeszcze raz), false = nie ma żadnego zdjęcia.
const needThumb = (t) => !(t in state.thumbs) || state.thumbs[t] === null;
async function loadThumbs(titles) {
  const missing = [...new Set(titles)].filter(needThumb);
  const parts = [];
  for (const lang of new Set(missing.map(langOf))) {
    const mine = missing.filter((t) => langOf(t) === lang);
    for (let i = 0; i < mine.length; i += 50) parts.push([lang, mine.slice(i, i + 50)]);
  }
  for (const [lang, part] of parts) {
    try {
      // pilicense=any: także zdjęcia niewolne (plakaty, okładki), które Wikipedia pokazuje w haśle
      const data = await api({ action: 'query', prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '300', pilimit: '50', pilicense: 'any', redirects: '1', titles: part.map(bareTitle).join('|') }, lang);
      const alias = {};
      for (const m of [...(data.query?.normalized || []), ...(data.query?.redirects || [])]) alias[m.to] = m.from;
      for (const pg of data.query?.pages || []) {
        const src = pg.thumbnail?.source || null;
        state.thumbs[keyFor(lang, pg.title)] = src;
        if (alias[pg.title]) state.thumbs[keyFor(lang, alias[pg.title])] = src;
      }
      const empty = part.filter((t) => !state.thumbs[t]);
      const extra = empty.length ? await fallbackThumbs(lang, empty) : {};
      for (const t of empty) state.thumbs[t] = extra[t] || false;
    } catch { break; /* bez internetu półki pokażą kolorowe karty */ }
  }
  if (missing.length) store.set('thumbs', state.thumbs);
  return state.thumbs;
}

/* ——— półki: Czytam · Na później · Przeczytane ———
   Stan hasła wynika z pomiaru akapitów (state.reads): przejrzane = co najmniej 15% akapitów,
   doczytane = co najmniej 75%. „Na później” to ręczna lista (state.saved); hasło, które zaczniesz
   czytać, przechodzi z niej na półkę Czytam, a potem do Przeczytanych (z listy nie znika, więc
   przycisk w czytniku dalej jest wciśnięty). Hasła tylko otwarte nie trafiają na żadną półkę. */
const SEEN_AT = 0.15, DONE_AT = 0.75;
const COVER_COLORS = ['var(--cover-1)', 'var(--cover-2)', 'var(--cover-3)', 'var(--cover-4)', 'var(--cover-5)'];
const GLASS = COVER_COLORS;
// Kolor liczby „22/41” na szkle (osobno na każdą barwę; w Szkliwie wszystkie jasne, więc tusz).
const GLASS_TEXT = ['var(--cover-ink)', 'var(--cover-ink)', 'var(--cover-ink)', 'var(--cover-ink)', 'var(--cover-ink)'];
const SHELF_ROW_MAX = 24;                 // w rzędzie; reszta po rozwinięciu półki

function shelves() {
  const recs = [...state.reads.values()];
  const reading = recs.filter((r) => r.state === 'seen').sort((a, b) => b.at - a.at);
  const done = recs.filter((r) => r.state === 'done').sort((a, b) => (b.doneAt || b.at) - (a.doneAt || a.at));
  const busy = new Set([...reading, ...done].map((r) => r.title));
  const later = state.saved.filter((t) => !busy.has(t));
  return { reading, later, done };
}

// Hasło bez zdjęcia głównego: okładką zostaje pierwsze większe zdjęcie z treści (w kolejności w haśle;
// navboxy i paski cleanArticle już usunął). Działa przy czytaniu, więc dotyczy haseł z półek.
function coverFromArticle(title) {
  if (state.thumbs[title]) return;
  const img = [...$('#article').querySelectorAll('img')].find((im) => +im.getAttribute('width') >= 100 && +im.getAttribute('height') >= 100 && !/\.svg/i.test(im.src));
  if (!img) return;
  state.thumbs[title] = img.src.replace(/^http:/, 'https:');
  store.set('thumbs', state.thumbs);
}

// Okładka: zdjęcie hasła albo kolorowa karta z pierwszą literą.
function coverBox(title, i, cls) {
  const box = document.createElement('span');
  box.className = cls;
  const src = state.thumbs[title];
  if (src) {
    const im = document.createElement('img');
    im.src = src;
    im.alt = '';
    im.loading = 'lazy';
    im.decoding = 'async';
    box.append(im);
  } else {
    box.classList.add('no-img');
    box.style.setProperty('--cc', COVER_COLORS[i % COVER_COLORS.length]);   // barwa Szkliwa (style.css: --cover-1…5)
    const l = document.createElement('i');
    l.textContent = shownTitle(title)[0];
    box.append(l);
  }
  return box;
}

// Szkło do poziomu przeczytanych akapitów, z pomiarem „22/41”.
function glassLevel(rec, i) {
  const s = document.createElement('span');
  s.className = 'lvl';
  s.style.setProperty('--p', Math.round(100 * rec.read / Math.max(1, rec.n)));
  s.style.setProperty('--g', GLASS[i % GLASS.length]);
  s.style.setProperty('--gt', GLASS_TEXT[i % GLASS_TEXT.length]);
  const b = document.createElement('b');
  b.textContent = `${rec.read}/${rec.n}`;
  s.append(b);
  return s;
}

// Najnowszy trop, w którym jest to hasło (stuknięcie w okładkę wznawia go w tym miejscu).
const trailWith = (t) => { for (let i = state.trails.length - 1; i >= 0; i--) if (trailTitles(state.trails[i]).includes(t)) return state.trails[i]; return null; };

function shelfLink(title, cls, resumeRead) {
  const a = document.createElement('a');
  a.className = cls;
  a.href = hrefFor(title);
  const T = trailWith(title);
  if (T) a.dataset.resume = T.id;
  if (resumeRead) a.dataset.readResume = title;
  return a;
}

// Miękki łącznik w długich słowach (> 11 liter), także w częściach słów z myślnikiem: między dwiema
// spółgłoskami (samogłoska-spółgłoska | spółgłoska-samogłoska) najbliżej środka słowa, np. „Corres-pondence”.
// Przeglądarka sama takich słów w wąskiej kolumnie nie dzieli, a cięcie byle gdzie gubi łącznik.
const VOWEL = /[aeiouyąęó]/i;
function shy(text) {
  return text.split(/([ -])/).map((w) => {
    if (w.length <= 11) return w;
    let best = -1;
    for (let i = 4; i <= w.length - 4; i++) {
      if (VOWEL.test(w[i - 2]) && !VOWEL.test(w[i - 1]) && !VOWEL.test(w[i]) && VOWEL.test(w[i + 1])) {
        if (best < 0 || Math.abs(i - w.length / 2) < Math.abs(best - w.length / 2)) best = i;
      }
    }
    return best < 0 ? w : w.slice(0, best) + '\u00ad' + w.slice(best);
  }).join('');
}

// Tytuł na półce: jedna wielkość pisma (T1), długie słowa z miękkim łącznikiem.
function label(text, cls) {
  const s = document.createElement('span');
  s.className = cls;
  s.lang = langOf(text);
  s.textContent = shy(shownTitle(text));
  return s;
}

// Jedna półka: nagłówek z nazwą, liczbą i okrągłą strzałką; rząd okładek albo rozwinięta siatka.
function shelfBlock(kind, name, items, emptyText) {
  const sec = document.createElement('section');
  sec.className = 'shelf-block shelf-' + kind;
  sec.dataset.kind = kind;
  const open = state.openShelves.has(kind) && items.length > 0;
  const head = document.createElement('button');
  head.type = 'button';
  head.className = 'shelf-head';
  head.setAttribute('aria-expanded', String(open));
  head.innerHTML = '<h2></h2><span class="sec-count"></span><span class="chev" aria-hidden="true"></span>';
  head.querySelector('h2').textContent = name;
  head.querySelector('.sec-count').textContent = items.length ? `${items.length} ${plural(items.length, 'hasło', 'hasła', 'haseł')}` : '';
  if (!items.length) head.disabled = true;
  sec.append(head);

  if (!items.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = emptyText;
    sec.append(p);
    return sec;
  }

  if (open) {
    const grid = document.createElement('div');
    grid.className = 'shelf-grid';
    items.forEach((it, i) => {
      const a = shelfLink(it.title, 'g-item', kind === 'reading');
      const box = coverBox(it.title, i, 'g-cover');
      if (kind === 'reading') box.append(glassLevel(it.rec, i));
      a.append(box, label(it.title, 'g-title'));
      if (it.sub) { const s = document.createElement('span'); s.className = 'g-sub'; s.textContent = it.sub; a.append(s); }
      grid.append(a);
    });
    sec.append(grid);
    return sec;
  }

  const row = document.createElement('div');
  row.className = 'shelf-row';
  items.slice(0, SHELF_ROW_MAX).forEach((it, i) => {
    if (kind === 'reading') {
      // Czytam: okładki napełnione szkłem do poziomu przeczytanych akapitów, tytuł pod spodem.
      const a = shelfLink(it.title, 'r-item', true);
      const box = coverBox(it.title, i, 'r-cover');
      box.append(glassLevel(it.rec, i));
      a.append(box, label(it.title, 'r-title'));
      row.append(a);
    } else {
      // Na później / Przeczytane: okładka za taflą plexi, tytuł na szkle.
      const a = shelfLink(it.title, 'p-item', false);
      a.append(coverBox(it.title, i, 'p-cover'), label(it.title, 'p-title'));
      row.append(a);
    }
  });
  if (kind === 'reading') sec.append(row);
  else {
    const wrap = document.createElement('div');
    wrap.className = 'plexi';
    const slab = document.createElement('div');
    slab.className = 'slab';
    slab.setAttribute('aria-hidden', 'true');
    wrap.append(row, slab);
    sec.append(wrap);
  }
  return sec;
}

function renderShelves() {
  const { reading, later, done } = shelves();
  $('#shelves').replaceChildren(
    shelfBlock('reading', 'Czytam', reading.map((r) => ({ title: r.title, rec: r, sub: `${r.read} z ${r.n} akapitów` })),
      'Tu stają hasła, z których przeczytane jest co najmniej 15% akapitów.'),
    shelfBlock('later', 'Na później', later.map((t) => ({ title: t })),
      'Stuknij „Na później” w czytniku, a hasło stanie tutaj.'),
    shelfBlock('done', 'Przeczytane', done.map((r) => ({ title: r.title, sub: `${r.n} ${plural(r.n, 'akapit', 'akapity', 'akapitów')}` })),
      'Tu stają hasła przeczytane co najmniej w 75%.')
  );
}

// Miniatury: najpierw rzędy (i rozwinięte półki), potem przerysowanie, jeśli coś doszło.
function shelfTitles() {
  const { reading, later, done } = shelves();
  const take = (kind, list) => (state.openShelves.has(kind) ? list : list.slice(0, SHELF_ROW_MAX));
  return [...take('reading', reading.map((r) => r.title)), ...take('later', later), ...take('done', done.map((r) => r.title))];
}
function refreshShelfThumbs() {
  const want = shelfTitles();
  if (want.some(needThumb)) loadThumbs(want).then(() => { if (!$('#view-home').hidden) renderShelves(); });
}

// Stuknięcie w nazwę półki albo w puste miejsce na niej rozwija ją w siatkę; drugie — zwija.
$('#shelves').addEventListener('click', (e) => {
  if (e.target.closest('a')) return;
  const sec = e.target.closest('.shelf-block');
  if (!sec || !(e.target.closest('.shelf-head') || e.target.closest('.plexi, .shelf-row'))) return;
  const kind = sec.dataset.kind;
  if (state.openShelves.has(kind)) state.openShelves.delete(kind);
  else state.openShelves.add(kind);
  renderShelves();
  refreshShelfThumbs();
});

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

  // „Czytaj dalej”: najnowsze hasło z półki Czytam, otwierane na pierwszym nieprzeczytanym
  // akapicie. Dopóki żadne nie jest przejrzane — miejsce, w którym jesteś w bieżącym tropie.
  const T = curTrail();
  const top = shelves().reading[0];
  const cont = $('#continue');
  const t = top ? top.title : T ? T.steps[T.pos].t : null;
  cont.hidden = !t;
  if (t) {
    const tr = top ? trailWith(t) : T;
    cont.href = hrefFor(t);
    if (tr) cont.dataset.resume = tr.id; else delete cont.dataset.resume;
    if (top) cont.dataset.readResume = t; else delete cont.dataset.readResume;
    cont.querySelector('.next-t').textContent = shownTitle(t);
    const when = top ? top.at : lastOpened(t);
    cont.querySelector('.next-s').textContent = top
      ? [`${top.read} z ${top.n} akapitów`, ago(when)].join(' · ')
      : [when && ago(when), T.steps.length > 1 && `${T.pos + 1}. krok tropu`].filter(Boolean).join(' · ');
    const paint = () => {
      const img = cont.querySelector('.next-img');
      const src = state.thumbs[t];
      img.replaceChildren(src ? '' : shownTitle(t)[0]);
      img.style.backgroundImage = src ? `url("${src}")` : '';
      img.classList.toggle('no-img', !src);
      if (top) img.append(glassLevel(top, 0));
    };
    paint();
    if (needThumb(t)) loadThumbs([t]).then(() => { if (!$('#view-home').hidden) paint(); });
  }

  // Trzy półki: najpierw od razu (z pamięci), potem z dociągniętymi miniaturami.
  renderShelves();
  refreshShelfThumbs();

  /* Tropy: jeden wiersz na rodzinę tropu (trop z odgałęzieniami — przy czytaniu „gwiazdą”
     każde wyjście z hasła to odgałęzienie, więc osobne wiersze zalewałyby listę). Wiersz pokazuje
     najnowszy trop z rodziny, liczbę haseł i odgałęzień całej rodziny. Od najnowszej: pięć,
     a po stuknięciu w nagłówek wszystkie. */
  const families = [], famSeen = new Set();
  for (let i = realTrails.length - 1; i >= 0; i--) {
    const fam = trailFamily(realTrails[i]);
    const key = fam[0].id;
    if (famSeen.has(key)) continue;
    famSeen.add(key);
    families.push({ tr: realTrails[i], fam });
  }
  const ol = $('#trails-list');
  ol.replaceChildren();
  $('#trails-count').textContent = families.length ? `${families.length} ${plural(families.length, 'trop', 'tropy', 'tropów')}` : '';
  const head = $('#trails-head');
  head.disabled = families.length <= TRAILS_FEW;
  head.setAttribute('aria-expanded', String(state.trailsOpen && !head.disabled));
  const shown = state.trailsOpen ? families : families.slice(0, TRAILS_FEW);
  if (!shown.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'Kliknij link w artykule, a zacznie się trop.';
    ol.append(li);
  }
  shown.forEach(({ tr, fam }) => {
    const li = document.createElement('li');
    if (fam.includes(T)) li.className = 'now';
    const a = document.createElement('a');
    const here = tr.steps[tr.pos].t;
    a.href = hrefFor(here);
    a.dataset.resume = tr.id;
    a.innerHTML = '<span class="n"></span><span class="t"><span class="route"></span><span class="desc"></span></span><span class="go" aria-hidden="true">→</span>';
    // Po lewej dzień tropu (N2): pomiar zamiast numeru pozycji na liście.
    a.querySelector('.n').textContent = dayLabel(tr.end);
    a.querySelector('.route').textContent = `${shownTitle(tr.steps[0].t)} → ${shownTitle(tr.steps[tr.steps.length - 1].t)}`;
    const n = new Set(fam.flatMap(trailTitles)).size;
    const forks = fam.filter((F) => F.steps.length > 1).length - 1;
    const jumps = new Set(fam.flatMap((F) => F.steps.filter((x) => x.j).map((x) => x.t))).size;
    a.querySelector('.desc').textContent = [`${n} ${plural(n, 'hasło', 'hasła', 'haseł')}`,
      forks > 0 && `${forks} ${plural(forks, 'odgałęzienie', 'odgałęzienia', 'odgałęzień')}`,
      jumps && `${jumps} ${plural(jumps, 'skok', 'skoki', 'skoków')}`].filter(Boolean).join(' · ');
    a.querySelector('.t').append(trailDots(tr));
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

const TRAILS_FEW = 5;
$('#trails-head').addEventListener('click', () => {
  state.trailsOpen = !state.trailsOpen;
  const y = scrollY;
  renderHome();
  window.scrollTo(0, y);                 // przerysowanie nie zmienia miejsca na ekranie
});

/* Kreska tropu (minimapa M3): pod każdym tropem rząd kropek, jedna na hasło, w znakach stanu
   jak przy linkach (pusty krążek = przejrzane, pełny = doczytane, mała kropka = tylko otwarte);
   przerywany odcinek = skok z wyszukiwarki, różowa kropka = miejsce, w którym jesteś w tropie.
   Długi trop: pierwsze 5 haseł, „⋯”, ostatnie 9. */
function stepMark(t) {
  const st = state.reads.get(t)?.state;
  return st === 'done' ? 'done' : st === 'seen' ? 'seen' : 'open';
}
function trailDots(T) {
  const box = document.createElement('span');
  box.className = 'dots';
  box.setAttribute('aria-hidden', 'true');
  const idx = T.steps.map((_, i) => i);
  const shown = idx.length > 15 ? [...idx.slice(0, 5), -1, ...idx.slice(-9)] : idx;
  shown.forEach((i, k) => {
    if (k) {
      const seg = document.createElement('i');
      seg.className = i === -1 || shown[k - 1] === -1 ? 'seg gap' : T.steps[i].j ? 'seg j' : 'seg';
      box.append(seg);
    }
    const b = document.createElement('b');
    if (i === -1) { b.className = 'more'; b.textContent = '⋯'; }
    else b.className = stepMark(T.steps[i].t) + (i === T.pos ? ' now' : '');
    box.append(b);
  });
  return box;
}

// Linki z ekranu startowego i z mapy tropu, które wznawiają trop (karta „Czytaj dalej”, półki,
// lista tropów, odgałęzienia na mapie) i otwierają hasło na pierwszym nieprzeczytanym akapicie
// („Czytaj dalej”, półka Czytam).
document.addEventListener('click', (e) => {
  const a = e.target.closest('#view-home a, #map-sheet a, #view-highlights a');
  if (!a) return;
  if (a.dataset.resume) state.pendingResume = a.dataset.resume;
  state.pendingReadResume = a.dataset.readResume || null;
  state.pendingHighlight = a.dataset.hl || null;
});
$('#hero-search').addEventListener('click', () => toggleSearch(true));

/* ——— kopia zapasowa ———
   Eksport: jeden plik JSON ze wszystkim, co zapisała aplikacja (bez miniatur — to tylko pamięć
   podręczna, da się je pobrać ponownie). Import łączy plik z danymi w aplikacji, niczego nie
   zastępuje: wczytanie starej kopii nie skasuje nowszej historii. */
// v1: history, trails, saved, reader, presets. v2: + reads (stan czytania haseł).
// v3: + highlights (zakreślenia). Import przyjmuje v1–v3.
const BACKUP_VERSION = 4;              // v4 = te same dane co v3 (magazyn links nie trafia do kopii)

function backupSummary(d) {
  const n = (x) => (Array.isArray(x) ? x.length : 0);
  const trails = (d.trails || []).filter((T) => T.steps?.length > 1).length;
  const reads = d.reads instanceof Map ? [...d.reads.values()] : Array.isArray(d.reads) ? d.reads : [];
  const done = reads.filter((r) => r?.state === 'done').length;
  const hl = n(d.highlights);
  return `${n(d.history)} ${plural(n(d.history), 'wizyta', 'wizyty', 'wizyt')} · ${trails} ${plural(trails, 'trop', 'tropy', 'tropów')} · ${n(d.saved)} na później · ${done} ${plural(done, 'przeczytane', 'przeczytane', 'przeczytanych')} · ${hl} ${plural(hl, 'zakreślenie', 'zakreślenia', 'zakreśleń')} · ${n(d.presets)} ${plural(n(d.presets), 'preset', 'presety', 'presetów')}`;
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
  meter.flush();
  const data = { history: state.history, trails: state.trails, saved: state.saved, reader: state.reader, presets: state.presets, reads: [...state.reads.values()], highlights: state.highlights };
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

// Stan czytania z dwóch źródeł: suma przeczytanych akapitów, dalszy z dwóch stanów, większe liczniki.
// Dokładne liczby (read, first) przeliczą się przy następnym otwarciu hasła.
const STATE_RANK = { open: 0, seen: 1, done: 2 };
function mergeRead(a, b) {
  const newer = (b.at || 0) > (a.at || 0) ? b : a;
  const out = { ...newer, seen: [...new Set([...(a.seen || []), ...(b.seen || [])])] };
  out.read = Math.min(out.n || 0, Math.max(a.read || 0, b.read || 0));
  out.state = (STATE_RANK[a.state] || 0) >= (STATE_RANK[b.state] || 0) ? a.state : b.state;
  out.visits = Math.max(a.visits || 0, b.visits || 0);
  out.ms = Math.max(a.ms || 0, b.ms || 0);
  for (const k of ['seenAt', 'doneAt']) { const v = [a[k], b[k]].filter(Number.isFinite); if (v.length) out[k] = Math.min(...v); else delete out[k]; }
  return out;
}

// Łączenie: historia po (tytuł, czas), tropy po id (wygrywa nowszy), przypięte i presety — suma,
// stan czytania hasło po haśle (mergeRead).
function mergeBackup(d) {
  const key = (h) => h.title + '|' + h.at;
  const hist = new Map(state.history.map((h) => [key(h), h]));
  for (const h of d.history || []) {
    if (!h || typeof h.title !== 'string' || !Number.isFinite(h.at)) continue;
    const mine = hist.get(key(h));
    if (!mine || (h.ms || 0) > (mine.ms || 0)) hist.set(key(h), h);   // ta sama wizyta: dłuższa wersja
  }
  state.history = [...hist.values()].sort((a, b) => a.at - b.at);

  const changed = [];
  for (const r of Array.isArray(d.reads) ? d.reads : []) {
    if (!r || typeof r.title !== 'string' || !Array.isArray(r.seen)) continue;
    const mine = state.reads.get(r.title);
    const rec = mine ? mergeRead(mine, r) : r;
    state.reads.set(r.title, rec);
    changed.push(rec);
  }
  store.putReads(changed);

  // Zakreślenia po id: nowe dochodzą, ten sam wpis — wygrywa nowsza zmiana (kolor).
  const hl = new Map(state.highlights.map((h) => [h.id, h]));
  const hlChanged = [];
  for (const h of Array.isArray(d.highlights) ? d.highlights : []) {
    if (!h?.id || typeof h.title !== 'string' || typeof h.text !== 'string') continue;
    const mine = hl.get(h.id);
    if (!mine || (h.edited || h.at || 0) > (mine.edited || mine.at || 0)) { hl.set(h.id, h); hlChanged.push(h); }
  }
  state.highlights = [...hl.values()].sort((a, b) => a.at - b.at);
  store.putHighlights(hlChanged);

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
function cleanArticle(html, lang = WIKI_LANG) {
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

  // Zdjęcia w treści idą na całą szerokość kolumny (wyrównane do obu krawędzi tekstu), więc
  // bierzemy największą wersję z srcset (zwykle 2× miniatury), żeby powiększone nie było rozmyte.
  // Małe obrazki (ikony, herby, mapki < 160 px) zostają w swoim rozmiarze.
  root.querySelectorAll('figure img, .thumb img').forEach((img) => {
    if (img.closest('table, .infobox-wrap, .gallery') || Number(img.getAttribute('width')) < 160) return;
    const best = (img.getAttribute('srcset') || '').split(',').map((s) => s.trim().split(/\s+/)).filter((p) => p[0])
      .sort((a, b) => parseFloat(b[1] || '1') - parseFloat(a[1] || '1'))[0];
    if (best) { img.setAttribute('src', best[0]); img.removeAttribute('srcset'); }
    img.classList.add('wide');
    img.closest('figure, .thumb')?.classList.add('wide');
  });

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
        a.href = `https://${lang}.wikipedia.org` + href;
        a.target = '_blank';
        a.rel = 'noopener';
      } else {
        const title = keyFor(lang, name.replace(/_/g, ' '));
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
  const mk = e.target.closest('mark.hl');
  if (mk && !a && getSelection()?.isCollapsed !== false) {
    const h = state.highlights.find((x) => x.id === mk.dataset.hl);
    if (h) openSelBar({ edit: h });
    return;
  }
  if (!a) return;
  // Puszczenie palca po przytrzymaniu linku (karta hasła) nie otwiera hasła.
  if (Date.now() - peek.at < 700) { e.preventDefault(); return; }
  if (a.dataset.anchor !== undefined) {
    e.preventDefault();
    if (a.closest('sup.reference') && showNote(a, a.dataset.anchor)) return;
    const target = document.getElementById(a.dataset.anchor);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (a.dataset.title) state.pendingFrom = state.current;
});

/* Wizyta = jedna sesja czytania hasła. Przeładowanie strony, ponowne uruchomienie aplikacji
   albo powrót przez „Czytaj dalej” do hasła, które było ostatnie i czytane mniej niż 30 min
   temu, to dalej ta sama wizyta: nie dopisujemy nowego wpisu, tylko uzupełniamy stary. */
const VISIT_GAP = 30 * 60e3;

function updateTrail(title) {
  const from = state.pendingFrom, resume = state.pendingResume;
  const jump = !from && !resume && state.searchFrom && state.searchFrom !== title;
  state.pendingFrom = state.pendingResume = state.searchFrom = null;
  applyStep(title, { from, resume, jump: !!jump });
  store.set('trails', state.trails);

  const now = Date.now();
  const last = state.history[state.history.length - 1];
  if (last && last.title === title && !from && !jump && now - (last.end || last.at) < VISIT_GAP) {
    last.end = now;
    state.visit = { entry: last, fresh: false };
    return;
  }
  const entry = { title, at: now, from: from || (jump ? state.current : null) };
  if (jump) entry.j = 1;
  state.history.push(entry);
  store.addHistory(entry, state.history);
  state.visit = { entry, fresh: true };
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
    el.textContent = shownTitle(s.t);
    if (!here) el.href = hrefFor(s.t);
    if (i > T.pos) el.classList.add('ahead');
    if (s.j) { el.classList.add('jump'); el.title = 'skok z wyszukiwarki'; }
    nav.append(el);
  });
  $('#map-open').hidden = trailFamily(T).reduce((n, F) => n + F.steps.length, 0) < 2;
  const cur = nav.children[T.pos];
  if (cur) cur.scrollIntoView({ inline: 'center', block: 'nearest' });
  const prev = T.steps[T.pos - 1];
  const back = $('#back-step');
  back.hidden = !prev;
  if (prev) { back.href = hrefFor(prev.t); back.querySelector('.t').textContent = shownTitle(prev.t); back.setAttribute('aria-label', 'Wróć do: ' + shownTitle(prev.t)); }
}

/* ——— linki według stanu hasła (etap 3.4, wariant L2) ———
   Po linku do hasła przejrzanego stoi pusty krążek, po linku do doczytanego — pełny krążek,
   a sam link jest przygaszony. Nieczytane i tylko otwarte zostają bez zmian.
   Linki często prowadzą do przekierowań („octopuses” → Octopus), a stan czytania zapisujemy
   pod docelowym tytułem. Jedno zapytanie generator=links&redirects=1 zwraca mapę przekierowań
   dla wszystkich linków hasła naraz (do 500 na zapytanie); trzymamy ją do końca sesji. */
const linkMaps = new Map();              // hasło → Map(tytuł z linku → tytuł docelowy)
// Pierwsza litera tytułu wielka (Wikipedia tak zapisuje hasła); przedrostek języka zostaje.
const normTitle = (k) => { if (!k) return k; const t = bareTitle(k); return keyFor(langOf(k), t.charAt(0).toUpperCase() + t.slice(1)); };

async function linkTargets(title) {
  if (linkMaps.has(title)) return linkMaps.get(title);
  const map = new Map();
  const lang = langOf(title);
  let cont = {};
  try {
    for (let i = 0; i < 6; i++) {
      const data = await api({ action: 'query', generator: 'links', titles: bareTitle(title), gplnamespace: '0', gpllimit: 'max', redirects: '1', ...cont }, lang);
      for (const r of data.query?.redirects || []) map.set(keyFor(lang, r.from), keyFor(lang, r.to));
      if (!data.continue) break;
      cont = data.continue;
    }
    linkMaps.set(title, map);
  } catch { /* bez internetu zostają dopasowania bez przekierowań */ }
  return map;
}

const readState = (t, map) => { const n = normTitle(t); return state.reads.get(map?.get(n) || n)?.state; };

function paintLinks(map) {
  for (const a of $('#article').querySelectorAll('a.wl')) {
    const st = readState(a.dataset.title, map);
    a.classList.toggle('st-seen', st === 'seen');
    a.classList.toggle('st-done', st === 'done');
  }
}

/* ——— Trop i Węzły (etap 4) ———
   Indeks odwrotny: dla każdego przeczytanego hasła pamiętamy, dokąd linkuje, i odwracamy to
   na „kto linkuje tutaj”.
   – Trop: linki ostatniego hasła tropu. Każdy dostaje punkt za każdy wcześniejszy krok, który też
     tam linkuje, i za każdy krok, do którego sam linkuje — wątek się nie rozmywa.
   – Węzły: nieprzeczytane hasła, do których linkują przeczytane z kilku różnych rodzin tropów.
   Pamięć linków: magazyn `links` {title, out, src, at}. Zawsze tylko linki z samej treści — navboxy
   (tabelki szablonów na dole hasła) linkują do dziesiątek haseł z tej samej dziedziny i zalewały Węzły
   hasłami, do których żaden tekst nie prowadzi. src 'body' = z czytnika (akapity, które liczy pomiar),
   po przekierowaniach; src 'wt' = z wikitekstu (źródła hasła), bez szablonów, przypisów i sekcji
   „See also”, „References”… — dla haseł spoza czytnika; przekierowania wyrównuje resolveTitles(). */
const JUNK = /\((identifier|disambiguation)\)$|^(ISBN|ISSN|Digital object identifier|PubMed|PubMed Central|Bibcode|JSTOR|OCLC|Wayback Machine|Geographic coordinate system|Semantic Scholar|Library of Congress Control Number)$|^\d{1,4}( BC| AD)?$|^\d{1,4}s( BC)?$|^(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}$/;
const isJunk = (k) => JUNK.test(bareTitle(k));
const isRead = (k) => { const st = state.reads.get(k)?.state; return st === 'seen' || st === 'done'; };

const links = {
  mem: new Map(),                        // hasło → {title, out, src, at}
  pending: new Map(),                    // hasło otwarte w czytniku → obietnica zapisu linków z treści
  sets: new Map(),                       // hasło → Set(out), budowane leniwie
  loaded: null,
  load() {
    return (this.loaded ||= store.allLinks().then((all) => {
      for (const r of all) if (r?.title && r.src !== 'api' && !this.mem.has(r.title)) this.mem.set(r.title, r);   // 'api' = próba z navboxami (odrzucona)
    }));
  },
  save(title, out, src) {
    const rec = { title, out: [...new Set(out)].filter((t) => t !== title && !isJunk(t)), src, at: Date.now() };
    this.mem.set(title, rec);
    this.sets.delete(title);
    store.putLinks(rec);
    return rec;
  },
  set(title) {
    const r = this.mem.get(title);
    if (!r) return null;
    if (!this.sets.has(title)) this.sets.set(title, new Set(r.out));
    return this.sets.get(title);
  },
  // Linki hasła: z pamięci albo z wikitekstu.
  async of(title) {
    await this.load();
    await this.pending.get(title);
    if (!this.mem.has(title)) await fetchWikiLinks([title]);
    return this.set(title);
  }
};

// Linki z wikitekstu: ucięte na pierwszej sekcji z listy STOP_SECTIONS, bez komentarzy, przypisów
// i szablonów {{…}} (infoboksy, navboxy, cytowania); zostają [[linki]] z tekstu i podpisów zdjęć.
function wikiLinks(wt, lang) {
  let t = wt;
  const stop = t.search(new RegExp('^==\\s*(' + STOP_SECTIONS.source.slice(2, -2) + ')\\s*==', 'im'));
  if (stop > 0) t = t.slice(0, stop);
  t = t.replace(/<!--[\s\S]*?-->/g, '').replace(/<ref[^>]*\/>/gi, '').replace(/<ref[\s\S]*?<\/ref>/gi, '');
  for (let i = 0; i < 8 && t.includes('{{'); i++) t = t.replace(/\{\{[^{}]*\}\}/g, '');
  const out = [];
  for (const m of t.matchAll(/\[\[([^\[\]|#]+)(?:#[^\[\]|]*)?(?:\|[^\[\]]*)?\]\]/g)) {
    const name = m[1].replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    if (!name || name.startsWith(':') || NON_ARTICLE.test(name) || /^[a-z][a-z-]*:/.test(name)) continue;
    out.push(normTitle(keyFor(lang, name)));
  }
  return out;
}

// Wikitekst kilku haseł naraz (po 10: hasła bywają długie), linki do pamięci.
async function fetchWikiLinks(titles) {
  for (const lang of new Set(titles.map(langOf))) {
    const mine = titles.filter((t) => langOf(t) === lang);
    for (let i = 0; i < mine.length; i += 10) {
      const part = mine.slice(i, i + 10);
      const data = await api({ action: 'query', prop: 'revisions', rvprop: 'content', rvslots: 'main', redirects: '1', titles: part.map(bareTitle).join('|') }, lang);
      const alias = {};
      for (const m of [...(data.query?.normalized || []), ...(data.query?.redirects || [])]) alias[m.to] = m.from;
      for (const pg of data.query?.pages || []) {
        const wt = pg.revisions?.[0]?.slots?.main?.content;
        if (typeof wt !== 'string') continue;
        let key = keyFor(lang, pg.title);
        if (!part.includes(key)) { let f = pg.title; while (alias[f]) f = alias[f]; key = keyFor(lang, f); }
        links.save(key, wikiLinks(wt, lang), 'wt');
      }
    }
  }
}

// Przekierowania: tytuł z linku → tytuł hasła (po 50 w jednym zapytaniu, wynik do końca sesji).
const aliasOf = new Map();
const canon = (k) => aliasOf.get(k) || k;
async function resolveTitles(keys) {
  const todo = [...new Set(keys)].filter((k) => !aliasOf.has(k));
  for (const lang of new Set(todo.map(langOf))) {
    const mine = todo.filter((t) => langOf(t) === lang);
    for (let i = 0; i < mine.length; i += 50) {
      const part = mine.slice(i, i + 50);
      const data = await api({ action: 'query', titles: part.map(bareTitle).join('|'), redirects: '1' }, lang);
      const step = {};
      for (const m of [...(data.query?.normalized || []), ...(data.query?.redirects || [])]) step[m.from] = m.to;
      for (const k of part) {
        let t = bareTitle(k);
        for (let n = 0; n < 4 && step[t]; n++) t = step[t];
        aliasOf.set(k, keyFor(lang, t));
      }
    }
  }
}

// Po otwarciu hasła: linki z samej treści, po przekierowaniach.
function recordBodyLinks(title, map) {
  const out = [];
  for (const { el } of measureUnits($('#article'))) {
    for (const a of el.querySelectorAll('a.wl')) { const n = normTitle(a.dataset.title); out.push(map?.get(n) || n); }
  }
  return out.length ? links.load().then(() => { links.save(title, out, 'body'); }) : Promise.resolve();
}

// Rodzina tropu = trop razem z odgałęzieniami (korzeń łańcucha branchOf). Hasło należy do rodziny,
// w której pojawiło się najwcześniej — jedno hasło nie liczy się za kilka niezależnych tropów.
function familyOf() {
  const byId = new Map(state.trails.map((t) => [t.id, t]));
  const root = (t) => { const seen = new Set(); while (t.branchOf && byId.has(t.branchOf) && !seen.has(t.id)) { seen.add(t.id); t = byId.get(t.branchOf); } return t; };
  const fam = new Map();
  for (const T of [...state.trails].sort((a, b) => a.start - b.start)) {
    const r = root(T);
    for (const s of T.steps) if (!fam.has(s.t)) fam.set(s.t, r);
  }
  return fam;
}

// Przeczytane hasła, których linków jeszcze nie znamy: po jednym zapytaniu, najnowsze najpierw.
const BACKFILL_MAX = 300;
async function backfillLinks(onProgress) {
  await links.load();
  const todo = [...state.reads.values()].filter((r) => isRead(r.title) && !links.mem.has(r.title))
    .sort((a, b) => b.at - a.at).slice(0, BACKFILL_MAX);
  for (let i = 0; i < todo.length; i += 10) {
    onProgress?.(i, todo.length);
    try { await fetchWikiLinks(todo.slice(i, i + 10).map((r) => r.title)); }
    catch { break; }                     // bez internetu: dokończy się następnym razem
  }
  onProgress?.(todo.length, todo.length);
  return todo.length;
}

// Wagi rekomendacji (decyzja 3 — na razie domyślne).
// Trop: tropPath = za każdy wcześniejszy krok, który tu linkuje; tropBack = za każdy wcześniejszy krok,
// do którego kandydat linkuje; tropLast = za link z powrotem do ostatniego hasła (sygnał lokalny —
// sam w sobie wyciągał wioski wokół Letchworth). Węzły: za każdą rodzinę tropów i każde zakreślenie.
// nodeMin: próg 3 tropy na stałe (jej decyzja 2026-11-22: bez ustawień; przy 2 wychodziło ponad sto węzłów).
const REC_W = { tropPath: 1, tropBack: 1, tropLast: 0.5, nodeFamilies: 1, nodeHighlights: 1, nodeMin: 3 };

// Węzły: {t, fams: [{root, titles}], n (przeczytanych linkujących), hl (zakreśleń z linkiem), score}.
// Najpierw liczenie na tytułach z linków; cele z ≥ 2 haseł wyrównujemy do tytułów haseł (przekierowania)
// i liczymy jeszcze raz — warianty tego samego hasła się sumują, a przeczytane pod inną nazwą odpadają.
async function computeNodes() {
  const fam = familyOf();
  const sources = [...state.reads.values()].filter((r) => isRead(r.title) && links.mem.has(r.title));
  const count = new Map();
  for (const r of sources) for (const t of links.mem.get(r.title).out) count.set(t, (count.get(t) || 0) + 1);
  try { await resolveTitles([...count].filter(([t, n]) => n >= 2 && !isRead(t)).map(([t]) => t).slice(0, 600)); } catch { /* bez internetu: bez wyrównania */ }
  const agg = new Map();
  for (const r of sources) {
    const root = fam.get(r.title) || null;
    const fid = root ? root.id : 'solo:' + r.title;
    for (const t0 of new Set(links.mem.get(r.title).out.map(canon))) {
      if (isRead(t0) || t0 === r.title) continue;
      if (!agg.has(t0)) agg.set(t0, { t: t0, src: new Map(), hl: 0 });
      const x = agg.get(t0);
      if (!x.src.has(fid)) x.src.set(fid, { root, titles: [] });
      x.src.get(fid).titles.push(r.title);
    }
  }
  for (const h of state.highlights) for (const t of new Set((h.links || []).map(canon))) if (agg.has(t)) agg.get(t).hl++;
  const W = REC_W;
  return [...agg.values()]
    .map((x) => {
      const fams = [...x.src.values()].sort((a, b) => b.titles.length - a.titles.length);
      const n = fams.reduce((s, f) => s + f.titles.length, 0);
      return { t: x.t, fams, n, hl: x.hl, score: W.nodeFamilies * fams.length + W.nodeHighlights * x.hl };
    })
    .filter((x) => x.fams.length >= W.nodeMin)
    .sort((a, b) => b.score - a.score || b.fams.length - a.fams.length || b.n - a.n);
}

// Trop: {path, items: [{t, from: [wcześniejsze kroki, które tu linkują], to: [kroki, do których linkuje], score}]}.
const tropCache = new Map();
async function computeTrop(T) {
  const all = [...new Set(T.steps.slice(0, T.pos + 1).map((s) => s.t))];
  const last = all[all.length - 1];
  const lang = langOf(last);
  const path = all.filter((t) => langOf(t) === lang).slice(-50);
  const key = path.join('|');
  if (tropCache.has(key)) return tropCache.get(key);
  const outLast = await links.of(last);
  if (!outLast) return { path, items: [] };
  const earlier = path.slice(0, -1);
  for (const t of earlier) await links.of(t);
  const inPath = new Set(path);
  const items = [...outLast].filter((c) => !inPath.has(c) && !isRead(c))
    .map((c, i) => ({ t: c, i, from: earlier.filter((s) => links.set(s)?.has(c)), to: [] }));
  // Do których kroków tropu linkuje kandydat: prop=links z filtrem pltitles, 50 kandydatów na zapytanie.
  const byTitle = new Map(items.map((x) => [bareTitle(x.t), x]));
  const pl = path.map(bareTitle).join('|');
  try {
    for (let i = 0; i < items.length; i += 50) {
      let cont = {};
      for (let k = 0; k < 5; k++) {
        const data = await api({ action: 'query', prop: 'links', titles: items.slice(i, i + 50).map((x) => bareTitle(x.t)).join('|'), pltitles: pl, pllimit: 'max', ...cont }, lang);
        for (const pg of data.query?.pages || []) for (const l of pg.links || []) byTitle.get(pg.title)?.to.push(keyFor(lang, l.title));
        if (!data.continue) break;
        cont = data.continue;
      }
    }
  } catch { /* bez internetu liczymy tylko linki z kroków tropu */ }
  const W = REC_W;
  for (const x of items) x.score = W.tropPath * x.from.length + W.tropBack * x.to.filter((t) => t !== last).length + W.tropLast * x.to.includes(last);
  const res = { path, items: items.filter((x) => x.score > 0).sort((a, b) => b.score - a.score || a.i - b.i) };
  tropCache.set(key, res);
  return res;
}

/* ——— Trop i Węzły: lista i rysunek uzasadnienia ———
   Lista (N1): okładka, tytuł, jedna nazwa w linijce, wielka liczba. Stuknięcie: arkusz z rysunkiem —
   wiersze (kroki tropu albo tropy) zbiegają się liniami w kółku z liczbą (forma z renderowni:
   „zbieżność” i „ciągłość wątku”). Jedna grubość linii, bez grotów; tekst zawsze poziomo. */
function recLine(day, name, more) {
  const l = node('span', 'rec-line');
  if (day != null) l.append(node('span', 'rec-day', day));
  l.append(node('span', 'rec-name', shownTitle(name)));
  if (more) l.append(node('span', 'rec-more', '+' + more));
  return l;
}
function recRow(t, i, lines, num, onTap) {
  const b = node('button', 'rec-row');
  b.type = 'button';
  const mid = node('span', 'rec-mid');
  const tt = node('span', 'rec-t', shownTitle(t));
  tt.lang = langOf(t);
  mid.append(tt, ...lines);
  b.append(coverBox(t, i, 'r-cover'), mid, node('span', 'rec-big', String(num)));
  b.addEventListener('click', onTap);
  return b;
}
const tropsWord = (n) => plural(n, 'trop', 'tropy', 'tropów');

const SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  parent?.append(e);
  return e;
}
const cut = (t, n) => (t.length > n ? t.slice(0, n - 1) + '…' : t);
// rows: [{t, day?, more?, on, ghost?, bead?}] — bead = kroki tropu na pionowej nici.
function whySvg(rows, num) {
  const W = 340, ROW = 32, LX = 236, HX = 306, Hh = rows.length * ROW + 10, cy = Hh / 2;
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${Hh}`, class: 'why-svg', 'aria-hidden': 'true' });
  rows.forEach((r, i) => {
    const y = 5 + i * ROW + ROW / 2;
    if (r.bead) {
      if (i < rows.length - 1) svgEl('line', { x1: 7, y1: y, x2: 7, y2: y + ROW, class: 'thread' }, svg);
      svgEl('circle', { cx: 7, cy: y, r: r.on ? 5.5 : 3.5, class: r.on ? 'bead on' : 'bead' }, svg);
    }
    let x = r.bead ? 22 : 0;
    if (r.day != null) { svgEl('text', { x, y: y + 4, class: 'day' }, svg).textContent = r.day; x += 48; }
    const t = svgEl('text', { x, y: y + 4, class: r.on && !r.ghost ? 'lb' : 'lb off' }, svg);
    t.textContent = cut(shownTitle(r.t), (r.day != null ? 20 : 26) - (r.more ? 3 : 0));
    if (r.more) svgEl('tspan', { class: 'dayt', dx: 5 }, t).textContent = '+' + r.more;
    if (r.on) svgEl('path', { d: `M${LX} ${y} C ${LX + 40} ${y}, ${HX - 50} ${cy}, ${HX - 22} ${cy}`, class: r.ghost ? 'sp ghost' : 'sp' }, svg);
  });
  svgEl('circle', { cx: HX, cy, r: 22, class: 'hub' }, svg);
  svgEl('text', { x: HX, y: cy + 8, class: 'hubn', 'text-anchor': 'middle' }, svg).textContent = num;
  return svg;
}
function openWhy(t, sub, svg, from) {
  $('#why-t').textContent = shownTitle(t);
  $('#why-t').lang = langOf(t);
  $('#why-s').textContent = sub;
  $('#why-body').replaceChildren(svg);
  $('#why-go').href = hrefFor(t);
  state.whyFrom = from;
  $('#why').hidden = false;
  $('#why-catcher').hidden = false;
}
function closeWhy() { $('#why').hidden = true; $('#why-catcher').hidden = true; }
$('#why-catcher').addEventListener('click', closeWhy);
$('#why-go').addEventListener('click', () => { state.pendingFrom = state.whyFrom || null; closeWhy(); });

// Trop na końcu hasła: liczony dopiero, gdy zbliżasz się do stopki (zapytania tylko wtedy, gdy potrzebne).
let tropObs = null;
function watchTrop(title, token) {
  $('#trop-next').hidden = true;
  tropObs?.disconnect();
  if (!('IntersectionObserver' in window)) return;
  tropObs = new IntersectionObserver((es) => {
    if (!es.some((e) => e.isIntersecting)) return;
    tropObs.disconnect();
    renderTrop(title, token);
  }, { rootMargin: '0px 0px 900px 0px' });
  tropObs.observe($('#attribution'));
}
async function renderTrop(title, token) {
  const T = curTrail();
  if (!T || T.steps[T.pos]?.t !== title) return;
  let r;
  try { r = await computeTrop(T); } catch { return; }
  const items = r.items.filter((x) => !isRead(x.t)).slice(0, 3);
  if (token !== openToken || !items.length) return;
  await loadThumbs(items.map((x) => x.t));
  if (token !== openToken) return;
  const last = r.path[r.path.length - 1];
  $('#trop-count').textContent = `${r.path.length} ${plural(r.path.length, 'krok', 'kroki', 'kroków')}`;
  $('#trop-list').replaceChildren(...items.map((x, i) => {
    const set = new Set([...x.from, ...x.to, last]);
    const linked = r.path.filter((s) => set.has(s));
    const lines = linked.slice(0, 3).map((s, k) => recLine(null, s, k === 2 ? linked.length - 3 : 0));
    return recRow(x.t, i, lines, linked.length, () => {
      const shown = r.path.slice(-8);
      const rows = shown.map((s) => ({ t: s, bead: 1, on: set.has(s) }));
      if (r.path.length > 8) rows.unshift({ t: `+${r.path.length - 8} wcześniejszych`, bead: 1, on: false });
      openWhy(x.t, `${linked.length} z ${r.path.length} ${plural(r.path.length, 'kroku', 'kroków', 'kroków')} tropu łączy się z tym hasłem`, whySvg(rows, linked.length), title);
    });
  }));
  $('#trop-next').hidden = false;
}

// Ekran Węzły (#/wezly).
let nodesRun = 0;
async function renderNodes() {
  show('nodes');
  document.title = 'Węzły · Zakamarki';
  setProgress(0);
  window.scrollTo(0, 0);
  const run = ++nodesRun;
  const st = $('#nodes-status');
  const list = $('#nodes-list');
  const readN = [...state.reads.values()].filter((r) => isRead(r.title)).length;
  $('#nodes-num').textContent = '';
  $('#nodes-unit').textContent = '';
  $('#nodes-sub').textContent = '';
  st.hidden = false;
  st.textContent = 'Liczę…';
  await links.load();
  if (run !== nodesRun) return;
  await backfillLinks((i, n) => { if (run === nodesRun && n) st.textContent = `Pobieram linki z przeczytanych haseł: ${i} z ${n}`; });
  if (run !== nodesRun) return;
  const all = await computeNodes();
  if (run !== nodesRun) return;
  const famN = new Set(all.flatMap((x) => x.fams.map((f) => f.root?.id))).size;
  $('#nodes-num').textContent = all.length;
  $('#nodes-unit').textContent = plural(all.length, 'węzeł', 'węzły', 'węzłów');
  $('#nodes-sub').textContent = all.length ? `z ${famN} ${plural(famN, 'tropu', 'tropów', 'tropów')} · ${readN} przeczytanych` : `${readN} przeczytanych`;
  if (!all.length) {
    st.textContent = 'Węzeł pojawi się, gdy do jednego nieprzeczytanego hasła poprowadzą przeczytane z trzech różnych tropów.';
    list.hidden = true;
    return;
  }
  st.hidden = true;
  const top = all.slice(0, 30);
  await loadThumbs(top.map((x) => x.t));
  if (run !== nodesRun) return;
  list.replaceChildren(...top.map((x, i) => {
    const lines = x.fams.slice(0, 3).map((f) => recLine(f.root ? dayLabel(f.root.start) : '', f.titles[0], f.titles.length - 1));
    if (x.fams.length > 3) lines.push(recLine('', `+${x.fams.length - 3} ${tropsWord(x.fams.length - 3)}`));
    return recRow(x.t, i, lines, x.fams.length, () => {
      const rows = x.fams.slice(0, 6).map((f) => ({ day: f.root ? dayLabel(f.root.start) : '', t: f.titles[0], more: f.titles.length - 1, on: true }));
      if (x.fams.length > 6) rows.push({ day: '', t: `+${x.fams.length - 6} ${tropsWord(x.fams.length - 6)}`, on: true, ghost: true });
      openWhy(x.t, `${x.fams.length} ${tropsWord(x.fams.length)} · ${x.n} ${plural(x.n, 'przeczytane hasło linkuje', 'przeczytane hasła linkują', 'przeczytanych haseł linkuje')} tutaj`, whySvg(rows, x.fams.length), null);
    });
  }));
  list.hidden = false;
}

/* ——— mapa tropu ———
   Arkusz od dołu z całą rodziną tropu (trop + odgałęzienia połączone przez branchOf), od 3b jako drzewo
   M4 (familyTree niżej; linia metra M2 odrzucona). Znaki stanu jak przy linkach; skok z wyszukiwarki
   przerywaną kreską; kroki „przed tobą” przygaszone. Stuknięcie otwiera hasło (na odgałęzieniu — wznawia je). */
function trailFamily(T) {
  const byId = new Map(state.trails.map((t) => [t.id, t]));
  let root = T;
  const up = new Set([T.id]);
  while (root.branchOf && byId.has(root.branchOf) && !up.has(root.branchOf)) { root = byId.get(root.branchOf); up.add(root.id); }
  const kids = new Map();
  for (const t of state.trails) if (t.branchOf) { if (!kids.has(t.branchOf)) kids.set(t.branchOf, []); kids.get(t.branchOf).push(t); }
  const fam = [], seen = new Set(), stack = [root];
  while (stack.length) {
    const t = stack.pop();
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    fam.push(t);
    for (const k of kids.get(t.id) || []) stack.push(k);
  }
  return fam;
}

/* Mapa jako drzewo (wariant M4, 2026-11-21): każde hasło stoi pod tym, z którego do niego
   przyszłaś — jak spis treści. Zbieramy kroki wszystkich tropów z rodziny w kolejności czasu;
   pierwsze pojawienie się hasła wyznacza jego rodzica. Przy czytaniu „gwiazdą” (wychodzisz
   z jednego hasła do kilku i wracasz) wszystkie wyjścia stoją równo pod tym hasłem. */
const MAP_ROW = 40, MAP_IND = 20, MAP_DEPTH = 6;

function familyTree(T) {
  const nodes = new Map(), roots = [];
  const fam = trailFamily(T).sort((a, b) => a.start - b.start);
  for (const F of fam) {
    F.steps.forEach((s, i) => {
      if (nodes.has(s.t)) return;
      const parent = i ? nodes.get(F.steps[i - 1].t) : null;
      const n = { t: s.t, j: !!s.j, trail: F, kids: [], parent };
      nodes.set(s.t, n);
      (parent ? parent.kids : roots).push(n);
    });
  }
  return { nodes, roots };
}

function renderMap() {
  const T = curTrail();
  if (!T) return;
  const { nodes, roots } = familyTree(T);
  const here = T.steps[T.pos].t;
  const ahead = new Set(T.steps.slice(T.pos + 1).map((s) => s.t).filter((t) => !T.steps.slice(0, T.pos + 1).some((s) => s.t === t)));

  // Wiersze w porządku drzewa (rodzic, potem jego dzieci w kolejności czytania).
  const rows = [];
  (function walk(list, d) { for (const n of list) { n.row = rows.length; n.d = Math.min(d, MAP_DEPTH); rows.push(n); walk(n.kids, d + 1); } })(roots, 0);

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'map-svg');
  svg.setAttribute('width', '10');
  svg.setAttribute('height', String(rows.length * MAP_ROW));
  svg.setAttribute('aria-hidden', 'true');
  const markX = (n) => 12 + n.d * MAP_IND;
  const y = (n) => n.row * MAP_ROW + MAP_ROW / 2;
  // Cienka kreska „└” od znaku rodzica do dziecka; przerywana, gdy dziecko to skok z wyszukiwarki.
  for (const n of rows) {
    if (!n.parent) continue;
    const px = markX(n.parent), py = y(n.parent) + 8, cy = y(n), cx = markX(n) - 9;
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', `M${px} ${py} V${cy - 6} Q${px} ${cy} ${px + 6} ${cy} H${cx}`);
    p.setAttribute('class', 'ml' + (n.j ? ' j' : ''));
    svg.append(p);
  }

  const list = document.createElement('div');
  list.className = 'map-rows';
  for (const n of rows) {
    const a = document.createElement('a');
    a.className = 'map-row' + (n.t === here ? ' now' : '') + (ahead.has(n.t) ? ' ahead' : '');
    a.style.paddingLeft = (markX(n) - 6) + 'px';
    a.href = hrefFor(n.t);
    if (n.trail !== T) a.dataset.resume = n.trail.id;
    const mk = document.createElement('i');
    mk.className = 'mk ' + stepMark(n.t);
    const nm = document.createElement('span');
    nm.className = 'nm';
    nm.lang = langOf(n.t);
    nm.textContent = shownTitle(n.t);
    a.append(mk, nm);
    if (n.j) { const j = document.createElement('span'); j.className = 'jmp'; j.textContent = 'skok'; a.append(j); }
    const rec = state.reads.get(n.t);
    if (rec?.n && rec.state !== 'open') { const m = document.createElement('span'); m.className = 'meta'; m.textContent = `${rec.read}/${rec.n}`; a.append(m); }
    list.append(a);
  }
  const wrap = document.createElement('div');
  wrap.className = 'map-wrap';
  wrap.append(svg, list);
  $('#map-body').replaceChildren(wrap);
  // Bieżące hasło widoczne w arkuszu, nawet przy długim drzewie.
  requestAnimationFrame(() => list.querySelector('.now')?.scrollIntoView({ block: 'nearest' }));

  const n = nodes.size;
  const jumps = rows.filter((r) => r.j).length;
  const forks = rows.filter((r) => r.kids.length > 1).length;
  $('#map-count').textContent = [`${n} ${plural(n, 'hasło', 'hasła', 'haseł')}`,
    forks && `${forks} ${plural(forks, 'rozwidlenie', 'rozwidlenia', 'rozwidleń')}`,
    jumps && `${jumps} ${plural(jumps, 'skok', 'skoki', 'skoków')}`].filter(Boolean).join(' · ');
}

function toggleMap(open) {
  $('#map-sheet').hidden = !open;
  $('#map-catcher').hidden = !open;
  $('#map-open').setAttribute('aria-expanded', String(open));
  if (open) renderMap();
}
$('#map-open').addEventListener('click', () => toggleMap(true));
$('#map-catcher').addEventListener('click', () => toggleMap(false));

/* ——— karta hasła pod przytrzymaniem linku (etap 3.5) ———
   Przytrzymanie linku (pół sekundy bez ruchu palca) zamiast systemowego menu linku pokazuje
   małą kartę od dołu: miniatura, krótki opis i dwa pierwsze zdania hasła (żeby od razu wiedzieć,
   czym jest), długość (słowa, czas czytania), stan czytania, które z przeczytanych haseł tu
   linkują; Otwórz i Na później. Na komputerze to samo pod prawym przyciskiem myszy.
   Wszystko z jednego zapytania (+ jedno o linki z przeczytanych), zapamiętane do końca sesji. */
const PEEK_MS = 480;
const peek = { timer: null, xy: null, at: 0, title: null, cache: new Map() };

// Wyciąg bez wymowy zostawia ślady w nawiasach, np. „(; also …)” albo „()”.
const cleanExtract = (t) => t.replace(/\s+/g, ' ').replace(/\(\s*[;,]\s*/g, '(').replace(/\(\s*\)\s?/g, '').replace(/\s+([,.;:])/g, '$1').trim();

async function peekData(linkTitle) {
  if (peek.cache.has(linkTitle)) return peek.cache.get(linkTitle);
  const lang = langOf(linkTitle), bare = bareTitle(linkTitle);
  const data = await api({
    action: 'query', titles: bare, redirects: '1',
    prop: 'description|pageimages|extracts', piprop: 'thumbnail', pithumbsize: '160', pilicense: 'any',
    exintro: '1', explaintext: '1', exsentences: '2',
    list: 'search', srsearch: bare, srwhat: 'nearmatch', srnamespace: '0', srlimit: '1', srprop: 'wordcount'
  }, lang);
  const pg = data.query?.pages?.[0] || {};
  const out = {
    title: pg.title ? keyFor(lang, pg.title) : linkTitle, missing: !!pg.missing,
    desc: pg.description || '', extract: cleanExtract(pg.extract || ''),
    thumb: pg.thumbnail?.source || null, words: data.query?.search?.[0]?.wordcount || 0
  };
  if (out.thumb && !state.thumbs[out.title]) state.thumbs[out.title] = out.thumb;
  peek.cache.set(linkTitle, out);
  return out;
}

// Które z przeczytanych (przejrzanych lub doczytanych) haseł linkują do tego: prop=links z filtrem
// pltitles sprawdza do 50 stron naraz.
async function linkedFromRead(title) {
  const lang = langOf(title);
  const read = [...state.reads.values()].filter((r) => r.state !== 'open' && r.title !== title && langOf(r.title) === lang).sort((a, b) => b.at - a.at).slice(0, 150).map((r) => bareTitle(r.title));
  const found = [];
  for (let i = 0; i < read.length; i += 50) {
    const data = await api({ action: 'query', prop: 'links', pltitles: bareTitle(title), pllimit: 'max', titles: read.slice(i, i + 50).join('|') }, lang);
    for (const pg of data.query?.pages || []) if (pg.links?.length) found.push(pg.title);
  }
  return found;
}

function fmtWords(n) {
  const w = n >= 1000 ? `${(n / 1000).toLocaleString('pl-PL', { maximumFractionDigits: 1 })} tys.` : String(n);
  return `${w} słów · ok. ${Math.max(1, Math.round(n / 230))} min`;
}

function renderPeekLater() {
  const b = $('#peek-later');
  const on = state.saved.includes(peek.title);
  b.setAttribute('aria-pressed', String(on));
  b.textContent = on ? '✓ Na później' : 'Na później';
}

async function openPeek(linkTitle) {
  const box = $('#peek');
  peek.title = normTitle(linkTitle);
  box.dataset.for = linkTitle;
  $('#peek-t').textContent = shownTitle(linkTitle);
  $('#peek-d').textContent = '';
  $('#peek-x').textContent = 'Wczytuję…';
  $('#peek-m').textContent = '';
  $('#peek-from').hidden = true;
  $('#peek-img').style.backgroundImage = '';
  $('#peek-go').href = hrefFor(linkTitle);
  renderPeekLater();
  box.hidden = false;
  $('#peek-catcher').hidden = false;
  hideNote();
  try {
    const d = await peekData(linkTitle);
    if (box.dataset.for !== linkTitle || box.hidden) return;
    peek.title = d.title;
    $('#peek-t').textContent = shownTitle(d.title);
    $('#peek-d').textContent = d.desc;
    $('#peek-x').textContent = d.missing ? 'Nie ma takiego hasła.' : d.extract;
    $('#peek-img').style.backgroundImage = d.thumb ? `url("${d.thumb}")` : '';
    $('#peek-img').classList.toggle('no-img', !d.thumb);
    $('#peek-img').textContent = d.thumb ? '' : shownTitle(d.title)[0];
    $('#peek-go').href = hrefFor(d.title);
    const rec = state.reads.get(d.title);
    const m = $('#peek-m');
    m.replaceChildren();
    if (rec && rec.state !== 'open') {
      const i = document.createElement('i');
      i.className = 'st st-' + rec.state;
      m.append(i, `${rec.read} z ${rec.n} akapitów · `);
    }
    if (d.words) m.append(fmtWords(d.words));
    renderPeekLater();
    const from = await linkedFromRead(d.title);
    if (box.dataset.for !== linkTitle || box.hidden || !from.length) return;
    $('#peek-from').textContent = 'Linkują tu: ' + (from.length > 4 ? from.slice(0, 4).join(', ') + ` i ${from.length - 4} inne` : from.join(', '));
    $('#peek-from').hidden = false;
  } catch {
    if (box.dataset.for === linkTitle) $('#peek-x').textContent = 'Nie udało się połączyć z Wikipedią.';
  }
}

function closePeek() {
  $('#peek').hidden = true;
  $('#peek-catcher').hidden = true;
  $('#peek').dataset.for = '';
}

const cancelPeekTimer = () => { clearTimeout(peek.timer); peek.timer = null; };
$('#article').addEventListener('pointerdown', (e) => {
  const a = e.target.closest('a.wl');
  if (!a || e.button > 0) return;
  peek.xy = [e.clientX, e.clientY];
  cancelPeekTimer();
  peek.timer = setTimeout(() => {
    peek.timer = null;
    peek.at = Date.now();
    getSelection()?.removeAllRanges();
    openPeek(a.dataset.title);
  }, PEEK_MS);
});
document.addEventListener('pointermove', (e) => {
  if (peek.timer && Math.hypot(e.clientX - peek.xy[0], e.clientY - peek.xy[1]) > 10) cancelPeekTimer();
}, { passive: true });
for (const ev of ['pointerup', 'pointercancel']) document.addEventListener(ev, cancelPeekTimer);
window.addEventListener('scroll', cancelPeekTimer, { passive: true });
// Systemowe menu linku (Android po przytrzymaniu, prawy przycisk na komputerze) → nasza karta.
$('#article').addEventListener('contextmenu', (e) => {
  const a = e.target.closest('a.wl');
  if (!a) return;
  e.preventDefault();
  cancelPeekTimer();
  if (Date.now() - peek.at > 800) { peek.at = Date.now(); openPeek(a.dataset.title); }
});
$('#peek-catcher').addEventListener('click', closePeek);
$('#peek-go').addEventListener('click', () => { state.pendingFrom = state.current; closePeek(); });
$('#peek-later').addEventListener('click', () => {
  const t = peek.title;
  if (!t) return;
  state.saved = state.saved.includes(t) ? state.saved.filter((x) => x !== t) : [t, ...state.saved];
  store.set('saved', state.saved);
  renderPeekLater();
  renderPin();
});

// „Na później”: ta sama nazwa na przycisku i na półce; wciśnięty ma znaczek ✓ i kolor półki.
function renderPin() {
  const pinned = state.saved.includes(state.current);
  const btn = $('#pin');
  btn.setAttribute('aria-pressed', String(pinned));
  btn.textContent = pinned ? '✓ Na później' : 'Na później';
}

$('#pin').addEventListener('click', () => {
  const t = state.current;
  if (!t) return;
  state.saved = state.saved.includes(t) ? state.saved.filter((x) => x !== t) : [t, ...state.saved];
  store.set('saved', state.saved);
  renderPin();
});

let openToken = 0;                       // chroni przed spóźnioną odpowiedzią, gdy zdążysz przejść dalej

async function openArticle(requested) {
  const token = ++openToken;
  const resumeRead = state.pendingReadResume;
  const viaLink = !!state.pendingFrom;   // link w treści hasła (updateTrail zeruje to dopiero po wczytaniu)
  const goHighlight = state.pendingHighlight;
  state.pendingReadResume = state.pendingHighlight = null;
  const lang = langOf(requested);
  show('reader');
  const status = $('#status');
  const article = $('#article');
  $('#article-title').textContent = shownTitle(requested);
  $('#article-title').lang = lang;
  article.replaceChildren();
  article.lang = lang;
  $('#attribution').replaceChildren();
  $('#lang').hidden = true;
  status.hidden = false;
  status.textContent = 'Wczytuję…';
  window.scrollTo(0, 0);
  setProgress(0);

  try {
    // langlinks w tym samym zapytaniu: odpowiednik hasła w drugim języku (chip PL / EN).
    const data = await api({
      action: 'parse', page: bareTitle(requested), prop: 'text|displaytitle|langlinks',
      redirects: '1', disableeditsection: '1', disabletoc: '1'
    }, lang);
    if (token !== openToken) return;
    if (data.error) throw new Error(data.error.info || 'Nie ma takiego hasła.');
    const p = data.parse;
    const title = keyFor(lang, p.title);
    updateTrail(title);       // przed zmianą state.current: skok pamięta hasło, z którego wyszukiwano
    state.current = title;

    const tmp = document.createElement('div');
    tmp.innerHTML = p.displaytitle;
    $('#article-title').textContent = tmp.textContent || p.title;
    document.title = p.title + ' · Zakamarki';
    article.innerHTML = cleanArticle(p.text, lang);
    coverFromArticle(title);
    const wide = matchMedia('(min-width: 900px)').matches;
    article.querySelectorAll('.infobox-wrap').forEach((d) => { d.open = wide; });
    status.hidden = true;

    const src = document.createElement('a');
    src.href = wikiFor(lang) + encodeTitle(p.title);
    src.target = '_blank';
    src.rel = 'noopener';
    src.textContent = 'oryginał na Wikipedii';
    $('#attribution').append('Treść: Wikipedia, licencja CC BY-SA 4.0 · ', src);

    renderLangChip(lang, p.langlinks || []);
    renderTrail();
    renderPin();
    paintHighlights(title);
    /* Gdzie otworzyć hasło:
       – stuknięcie w zakreślenie na ekranie Zakreślenia: to zakreślenie;
       – „Czytaj dalej” i półka Czytam: pierwszy nieprzeczytany akapit z zakładką;
       – powrót (wstecz, trop, pigułka ←, historia): tam, gdzie skończyłaś;
       – link w treści: od początku, chyba że to hasło czytałaś przed chwilą (< 30 min) —
         np. link z powrotem do hasła, od którego zaczął się trop. */
    const resumeHere = resumeRead === requested || resumeRead === title;
    const spot = state.reads.get(title)?.spot;
    meter.start(title, resumeHere && !goHighlight);
    const mark = goHighlight && article.querySelector(`mark[data-hl="${goHighlight}"]`);
    if (mark) { meter.jumpTo(mark, 120, false); mark.classList.add('flash'); }
    else if (!resumeHere && spot && (!viaLink || Date.now() - spot.at < VISIT_GAP)) meter.restore(spot);
    paintLinks(linkMaps.get(title));
    links.pending.set(title, linkTargets(title).then((map) => {
      if (token !== openToken) return;
      paintLinks(map);
      return recordBodyLinks(title, map);
    }).catch(() => {}));
    watchTrop(title, token);
  } catch (err) {
    if (token !== openToken) return;
    status.textContent = 'Nie udało się wczytać artykułu. ' + (err.message || '');
  }
}

/* Chip języka obok „Aa”: w angielskim haśle „PL” (gdy jest polski odpowiednik), w polskim —
   wciśnięty „PL”; stuknięcie przechodzi do odpowiednika jako zwykły krok tropu. */
function renderLangChip(lang, langlinks) {
  const other = lang === 'pl' ? WIKI_LANG : 'pl';
  const ll = langlinks.find((l) => l.lang === other);
  const b = $('#lang');
  b.hidden = !ll;
  b.setAttribute('aria-pressed', String(lang === 'pl'));
  b.setAttribute('aria-label', lang === 'pl' ? 'Wróć do wersji angielskiej' : 'Polska wersja hasła');
  b.dataset.to = ll ? keyFor(other, ll.title) : '';
}
$('#lang').addEventListener('click', () => {
  const to = $('#lang').dataset.to;
  if (!to) return;
  state.pendingFrom = state.current;
  location.hash = hrefFor(to);
});

/* ——— zakreślenia (etap 3b) ———
   Zakreślenie = {id, title, trail, text, prefix, suffix, pos, links, color, at, edited?}.
   Zakotwiczenie tekstem: zapisujemy sam fragment i po 32 znaki przed nim i po nim. Po otwarciu
   hasła szukamy „przed + fragment + po” w tekście artykułu; gdy Wikipedia zmieniła sąsiedztwo —
   samego fragmentu najbliżej dawnego miejsca (pos). Pozycja w tekście = długość tekstu od
   początku artykułu (Range.toString), czyli ta sama miara co textContent.
   Kolory 1–5 (paleta „Lampy”): grupowanie ręczne, jednym stuknięciem, bez słów. */
const HL_NAMES = ['', 'morska zieleń', 'niebieski', 'morela', 'wrzos', 'cytryna'];
const HL_CTX = 32;

function textPos(root, node, offset) {
  const r = document.createRange();
  r.setStart(root, 0);
  r.setEnd(node, offset);
  return r.toString().length;
}

function locate(text, h) {
  const near = (needle) => {
    let best = -1, d = Infinity;
    for (let j = text.indexOf(needle); j !== -1; j = text.indexOf(needle, j + 1)) {
      const dd = Math.abs(j - (h.pos || 0));
      if (dd < d) { d = dd; best = j; }
    }
    return best;
  };
  const i = near(h.prefix + h.text + h.suffix);
  if (i !== -1) return i + h.prefix.length;
  return near(h.text);
}

// Owija fragment [a, b) tekstu artykułu w <mark>: tnie tylko węzły tekstowe, więc zakreślenie może
// przechodzić przez linki i kursywę. Puste odstępy między wierszami tabel i list pomijamy.
function wrapSpan(root, a, b, h) {
  const nodes = [], starts = [];
  let len = 0;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) { nodes.push(n); starts.push(len); len += n.data.length; }
  for (let i = 0; i < nodes.length; i++) {
    const s0 = starts[i], s1 = s0 + nodes[i].data.length;
    if (s1 <= a || s0 >= b) continue;
    let n = nodes[i];
    const from = Math.max(a, s0) - s0, to = Math.min(b, s1) - s0;
    if (!n.data.slice(from, to).trim() && /^(TABLE|TBODY|THEAD|TR|UL|OL|DL)$/.test(n.parentNode.nodeName)) continue;
    if (to < n.data.length) n.splitText(to);
    if (from > 0) n = n.splitText(from);
    const m = document.createElement('mark');
    m.className = 'hl c' + h.color;
    m.dataset.hl = h.id;
    n.replaceWith(m);
    m.append(n);
  }
}

function paintHighlights(title) {
  const root = $('#article');
  for (const h of state.highlights) {
    if (h.title !== title) continue;
    const a = locate(root.textContent, h);
    if (a < 0) { h.lost = true; continue; }     // fragmentu już nie ma w haśle (zostaje na liście)
    delete h.lost;
    wrapSpan(root, a, a + h.text.length, h);
  }
}

function highlightFromRange(range, color) {
  const root = $('#article');
  const text = root.textContent;
  let s = textPos(root, range.startContainer, range.startOffset);
  let e = textPos(root, range.endContainer, range.endOffset);
  while (s < e && /\s/.test(text[s])) s++;
  while (e > s && /\s/.test(text[e - 1])) e--;
  if (e <= s) return null;
  // Linki w zaznaczeniu, od razu jako tytuły docelowe (po przekierowaniach): z nich ekran
  // Zakreślenia liczy, do jakich haseł prowadzą zakreślenia z różnych haseł.
  const map = linkMaps.get(state.current);
  const links = [...new Set([...root.querySelectorAll('a.wl')].filter((x) => range.intersectsNode(x))
    .map((x) => { const n = normTitle(x.dataset.title); return map?.get(n) || n; }))];
  const h = {
    id: 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: state.current, trail: curTrail()?.id || null,
    text: text.slice(s, e), prefix: text.slice(Math.max(0, s - HL_CTX), s), suffix: text.slice(e, e + HL_CTX),
    pos: s, links, color, at: Date.now()
  };
  state.highlights.push(h);
  store.putHighlights([h]);
  wrapSpan(root, s, e, h);
  return h;
}

const marksOf = (id) => document.querySelectorAll(`#article mark[data-hl="${id}"]`);
function recolorHighlight(h, color) {
  h.color = color;
  h.edited = Date.now();
  marksOf(h.id).forEach((m) => { m.className = 'hl c' + color; });
  store.putHighlights([h]);
}
function deleteHighlight(h) {
  state.highlights = state.highlights.filter((x) => x !== h);
  marksOf(h.id).forEach((m) => m.replaceWith(...m.childNodes));
  $('#article').normalize();
  store.deleteHighlight(h.id);
}

/* Pasek zaznaczenia (Z1, na dole): pięć kółek-kolorów, × zamyka. Jedno angielskie słowo →
   polskie znaczenia z Wikisłownika; fraza → przycisk „Tłumacz” (Google, a gdy nie odpowie —
   MyMemory; fraza wychodzi z aplikacji dopiero po stuknięciu). Stuknięcie w zakreślenie otwiera
   ten sam pasek: zmiana koloru albo usunięcie. */
const sel = { range: null, text: '', edit: null, keep: false, timer: null, ask: 0 };

function closeSelBar() {
  $('#selbar').hidden = true;
  document.documentElement.removeAttribute('data-sel');
  sel.range = sel.edit = null;
  sel.keep = false;
  sel.ask++;
}

function openSelBar({ range = null, text = '', edit = null }) {
  Object.assign(sel, { range, text, edit, keep: !!edit });
  const bar = $('#selbar');
  bar.querySelectorAll('.hc').forEach((b) => b.setAttribute('aria-pressed', String(!!edit && Number(b.dataset.c) === edit.color)));
  $('#sb-del').hidden = !edit;
  const more = $('#sb-more');
  more.replaceChildren();
  more.hidden = true;
  const lang = langOf(state.current);
  const phrase = edit ? edit.text : text;
  if (lang === 'en' && phrase) {
    const word = phrase.match(/^[A-Za-z][A-Za-z'’-]*[A-Za-z]$/) ? phrase.replace(/’/g, "'") : null;
    if (word && !edit) showDict(word, ++sel.ask);
    else { more.append(translateButton(phrase)); more.hidden = false; }
  }
  bar.hidden = false;
  document.documentElement.dataset.sel = '1';
}

const node = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

function translateButton(phrase) {
  const b = node('button', 'sb-tr', 'Tłumacz');
  b.type = 'button';
  b.addEventListener('click', async () => {
    const ask = sel.ask;
    b.disabled = true;
    b.textContent = 'Tłumaczę…';
    const r = await translate(phrase);
    if (ask !== sel.ask) return;
    const more = $('#sb-more');
    if (r) {
      const p = node('p', 'sb-out', r.t);
      p.lang = 'pl';
      more.replaceChildren(p, node('small', 'sb-src', r.src));
    } else {
      const a = node('a', 'sb-ext', 'Tłumacz Google ↗');
      a.href = 'https://translate.google.com/?sl=en&tl=pl&op=translate&text=' + encodeURIComponent(phrase.slice(0, 1500));
      a.target = '_blank';
      a.rel = 'noopener';
      more.replaceChildren(node('p', 'sb-note', 'Tłumacz nie odpowiada.'), a);
    }
  });
  return b;
}

document.addEventListener('selectionchange', () => {
  clearTimeout(sel.timer);
  sel.timer = setTimeout(() => {
    if ($('#view-reader').hidden) return;
    const s = getSelection();
    if (!s.rangeCount || s.isCollapsed) { if (!sel.keep && !$('#selbar').hidden && !sel.edit) closeSelBar(); return; }
    const r = s.getRangeAt(0);
    if (!$('#article').contains(r.commonAncestorContainer)) return;
    const text = s.toString().replace(/\s+/g, ' ').trim();
    if (text && text !== sel.text) openSelBar({ range: r.cloneRange(), text });
    else if (text) sel.range = r.cloneRange();
  }, 220);
});
// Dotknięcie paska trzyma go otwartym, nawet gdy telefon w tym momencie zdejmie zaznaczenie.
$('#selbar').addEventListener('pointerdown', () => { sel.keep = true; });
$('#selbar').addEventListener('click', (e) => {
  const c = e.target.closest('.hc');
  if (c) {
    const color = Number(c.dataset.c);
    if (sel.edit) recolorHighlight(sel.edit, color);
    else if (sel.range) highlightFromRange(sel.range, color);
    getSelection()?.removeAllRanges();
    closeSelBar();
  } else if (e.target.closest('#sb-del') && sel.edit) {
    deleteHighlight(sel.edit);
    closeSelBar();
  } else if (e.target.closest('#sb-x')) {
    getSelection()?.removeAllRanges();
    closeSelBar();
  }
});
// Stuknięcie obok (bez zaznaczenia) zamyka pasek; stuknięcie w zakreślenie otwiera je do edycji.
document.addEventListener('click', (e) => {
  if ($('#selbar').hidden || e.target.closest('#selbar')) return;
  if (e.target.closest('#article mark.hl') && !e.target.closest('a')) return;
  if (getSelection()?.isCollapsed !== false) closeSelBar();
});

/* Słownik: polskie znaczenia angielskiego słowa z Wikisłownika (pl.wiktionary). Pytamy naraz
   o kilka form (camouflaged → camouflage, octopuses → octopus), w kolejności od dosłownej. */
const dictCache = new Map();
function wordVariants(w) {
  const out = [];
  const add = (x) => { if (x.length > 1 && !out.includes(x)) out.push(x); };
  const l = w.toLowerCase();
  add(w); add(l);
  if (/ies$/.test(l)) add(l.slice(0, -3) + 'y');
  if (/(s|x|z|ch|sh)es$/.test(l)) add(l.slice(0, -2));
  if (/s$/.test(l) && !/ss$/.test(l)) add(l.slice(0, -1));
  if (/ied$/.test(l)) add(l.slice(0, -3) + 'y');
  if (/ed$/.test(l)) { add(l.slice(0, -1)); add(l.slice(0, -2)); if (/([^aeiou])\1ed$/.test(l)) add(l.slice(0, -3)); }
  if (/ing$/.test(l)) { add(l.slice(0, -3)); add(l.slice(0, -3) + 'e'); if (/([^aeiou])\1ing$/.test(l)) add(l.slice(0, -4)); }
  if (/ly$/.test(l)) add(l.slice(0, -2));
  return out.slice(0, 10);
}

// Wikitekst → [{pos: 'rzeczownik', items: ['kamuflaż', …]}] z sekcji angielskiej, pola {{znaczenia}}.
function parseWikt(wt) {
  const sec = wt.match(/==[^=\n]*\(\{\{język angielski\}\}\)\s*==([\s\S]*?)(?=\n==[^=]|$)/);
  if (!sec) return [];
  const block = sec[1].match(/\{\{znaczenia\}\}([\s\S]*?)(?=\n\{\{[^}\n]+\}\}\s*\n|$)/);
  if (!block) return [];
  const clean = (t) => t.replace(/<ref[^>]*\/>|<ref[\s\S]*?<\/ref>|<!--[\s\S]*?-->/g, '')
    .replace(/\{\{[^{}]*\}\}/g, '').replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, '$1')
    .replace(/'{2,}/g, '').replace(/\s+/g, ' ').replace(/^[\s;,]+|[\s;,]+$/g, '');
  const groups = [];
  for (const line of block[1].split('\n')) {
    const pos = line.match(/^''(.+?)''/);
    if (pos) { groups.push({ pos: clean(pos[1]).replace(/,.*$/, ''), items: [] }); continue; }
    const m = line.match(/^:\s*\(\d+\.\d+\)\s*(.*)$/);
    if (m && groups.length) { const t = clean(m[1]); if (t && !groups[groups.length - 1].items.includes(t)) groups[groups.length - 1].items.push(t); }
  }
  return groups.filter((g) => g.items.length);
}

async function lookup(word) {
  if (dictCache.has(word)) return dictCache.get(word);
  const vs = wordVariants(word);
  const q = new URLSearchParams({ action: 'query', prop: 'revisions', rvprop: 'content', rvslots: 'main', titles: vs.join('|'), format: 'json', formatversion: '2', origin: '*' });
  const data = await fetch('https://pl.wiktionary.org/w/api.php?' + q).then((r) => r.json());
  const byTitle = new Map((data.query?.pages || []).filter((p) => !p.missing).map((p) => [p.title, p.revisions?.[0]?.slots?.main?.content || '']));
  let out = null;
  for (const v of vs) {
    const groups = byTitle.has(v) ? parseWikt(byTitle.get(v)) : [];
    if (groups.length) { out = { word: v, groups }; break; }
  }
  dictCache.set(word, out);
  return out;
}

async function showDict(word, ask) {
  const more = $('#sb-more');
  more.replaceChildren(node('p', 'sb-note', 'Szukam w Wikisłowniku…'));
  more.hidden = false;
  let d = null;
  try { d = await lookup(word); } catch {}
  if (ask !== sel.ask) return;
  if (!d) {
    more.replaceChildren(node('p', 'sb-note', 'Tego słowa nie ma w Wikisłowniku.'), translateButton(word));
    return;
  }
  const box = node('div', 'dict');
  const head = node('div', 'dict-w');
  const w = node('b', null, d.word);
  w.lang = 'en';
  head.append(w);
  box.append(head);
  for (const g of d.groups.slice(0, 3)) {
    const row = node('p', 'dict-g');
    row.append(node('small', null, g.pos), ' ', g.items.slice(0, 4).join(' · '));
    box.append(row);
  }
  const src = node('a', 'sb-src', 'Wikisłownik ↗');
  src.href = 'https://pl.wiktionary.org/wiki/' + encodeURIComponent(d.word);
  src.target = '_blank';
  src.rel = 'noopener';
  box.append(src);
  more.replaceChildren(box);
}

// Tłumaczenie frazy: Google (nieoficjalny adres jego wtyczki), a gdy nie odpowie — MyMemory.
async function translate(text) {
  const q = text.slice(0, 1000);
  try {
    const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pl&dt=t&q=' + encodeURIComponent(q));
    if (r.ok) { const j = await r.json(); const t = (j?.[0] || []).map((x) => x?.[0] || '').join('').trim(); if (t) return { t, src: 'Google Tłumacz' }; }
  } catch {}
  try {
    const r = await fetch('https://api.mymemory.translated.net/get?langpair=en|pl&q=' + encodeURIComponent(q.slice(0, 480)));
    const j = await r.json();
    const t = j?.responseData?.translatedText;
    if (Number(j?.responseStatus) === 200 && t && !/MYMEMORY WARNING/i.test(t)) return { t, src: 'MyMemory' };
  } catch {}
  return null;
}

/* ——— ekran Zakreślenia ———
   Wielka liczba, filtr kolorem (kółka z licznikami), grupy po tropach (dzień + trasa tropu),
   na dole hasła, do których prowadzą linki z zakreśleń w co najmniej dwóch różnych hasłach
   (przyszli kandydaci na Węzły). Stuknięcie w zakreślenie otwiera hasło w tym miejscu. */
const MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
function dayLabel(at) {
  const d = new Date(at), today = new Date().setHours(0, 0, 0, 0);
  const day = new Date(at).setHours(0, 0, 0, 0);
  if (day === today) return 'dziś';
  if (day === today - 864e5) return 'wczoraj';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}` + (d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : '');
}

function renderHighlights() {
  show('highlights');
  document.title = 'Zakreślenia · Zakamarki';
  setProgress(0);
  window.scrollTo(0, 0);
  const all = state.highlights;
  const list = state.hlFilter ? all.filter((h) => h.color === state.hlFilter) : all;
  const nT = new Set(list.map((h) => h.title)).size, nR = new Set(list.map((h) => h.trail).filter(Boolean)).size;
  $('#hl-num').textContent = list.length;
  $('#hl-unit').textContent = plural(list.length, 'zakreślenie', 'zakreślenia', 'zakreśleń');
  $('#hl-sub').textContent = list.length ? `w ${nT} ${nT === 1 ? 'haśle' : 'hasłach'}` + (nR ? ` · ${nR} ${nR === 1 ? 'tropie' : 'tropach'}` : '') : '';

  // Filtr kolorem: „wszystkie” i pięć kółek z licznikami; stuknięcie w wybrany kolor zdejmuje filtr.
  const f = $('#hl-filter');
  f.hidden = !all.length;
  f.replaceChildren();
  const allB = node('button', 'hf-all', `wszystkie ${all.length}`);
  allB.type = 'button';
  allB.setAttribute('aria-pressed', String(!state.hlFilter));
  allB.dataset.c = '0';
  f.append(allB);
  for (let c = 1; c <= 5; c++) {
    const n = all.filter((h) => h.color === c).length;
    const b = node('button', 'hf c' + c, n ? String(n) : '');
    b.type = 'button';
    b.dataset.c = String(c);
    b.disabled = !n;
    b.setAttribute('aria-pressed', String(state.hlFilter === c));
    b.setAttribute('aria-label', `${HL_NAMES[c]}: ${n}`);
    f.append(b);
  }

  // Grupy po tropach (cała rodzina tropu, jak na liście Tropy), od najświeższej; w grupie
  // w kolejności zakreślania.
  const byId = new Map(state.trails.map((T) => [T.id, T]));
  const famOf = new Map();
  const groups = new Map();
  for (const h of list) {
    let k = 'x:' + h.title;
    const T = byId.get(h.trail);
    if (T) {
      if (!famOf.has(T.id)) famOf.set(T.id, trailFamily(T));
      k = famOf.get(T.id)[0].id;
    }
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(h);
  }
  const box = $('#hl-groups');
  box.replaceChildren();
  if (!list.length) box.append(node('p', 'empty', all.length ? 'Brak zakreśleń w tym kolorze.' : 'Zaznacz fragment w czytniku i stuknij kolor na pasku na dole — zakreślenie trafi tutaj.'));
  const sorted = [...groups.values()].sort((a, b) => b[b.length - 1].at - a[a.length - 1].at);
  for (const g of sorted) {
    const fam = famOf.get(g[0].trail);
    const newest = fam && fam.reduce((a, b) => ((b.end || 0) > (a.end || 0) ? b : a));
    const card = node('div', 'card hl-card');
    const head = node('div', 'hl-head');
    head.append(node('span', 'hl-day', dayLabel(g[g.length - 1].at)),
      node('span', 'hl-route', fam && new Set(fam.flatMap(trailTitles)).size > 1 ? `${shownTitle(fam[0].steps[0].t)} → ${shownTitle(newest.steps[newest.steps.length - 1].t)}` : shownTitle(g[0].title)));
    card.append(head);
    for (const h of g) {
      const a = node('a', 'hl-item');
      a.href = hrefFor(h.title);
      a.dataset.hl = h.id;
      if (h.trail && byId.has(h.trail)) a.dataset.resume = h.trail;
      const q = node('span', 'hl-q');
      q.lang = langOf(h.title);
      const txt = h.text.replace(/\s+/g, ' ');
      q.append(node('mark', 'hl c' + h.color, txt.length > 240 ? txt.slice(0, 240) + '…' : txt));
      a.append(q, node('span', 'hl-src', `${shownTitle(h.title)} · ${ago(h.at)}` + (h.lost ? ' · fragmentu już nie ma w haśle' : '')));
      card.append(a);
    }
    box.append(card);
  }

  // Wspólne cele: hasło, do którego prowadzą linki z zakreśleń w ≥ 2 różnych hasłach.
  const targets = new Map();
  for (const h of list) for (const t of h.links || []) {
    if (t === h.title) continue;
    if (!targets.has(t)) targets.set(t, { n: 0, from: new Set() });
    const x = targets.get(t);
    x.n++;
    x.from.add(h.title);
  }
  const common = [...targets.entries()].filter(([, x]) => x.from.size >= 2).sort((a, b) => b[1].from.size - a[1].from.size || b[1].n - a[1].n).slice(0, 8);
  $('#hl-common').hidden = !common.length;
  $('#hl-common-list').replaceChildren(...common.map(([t, x]) => {
    const li = node('li');
    const a = node('a');
    a.href = hrefFor(t);
    const from = [...x.from].map(shownTitle);
    a.append(node('span', 'hc-t', '→ ' + shownTitle(t)),
      node('span', 'hc-s', `${x.n} ${plural(x.n, 'zakreślenie', 'zakreślenia', 'zakreśleń')} z ${from.length > 3 ? from.slice(0, 3).join(', ') + ` i ${from.length - 3} innych` : from.join(', ')}`));
    li.append(a);
    return li;
  }));
}
$('#hl-filter').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const c = Number(b.dataset.c);
  state.hlFilter = state.hlFilter === c ? 0 : c;
  renderHighlights();
});

/* ——— pomiar głębokości czytania: akapity na ekranie (etap 3.3) ———
   Jednostka pomiaru to akapit treści: <p>, cała lista albo cytat (najbardziej zewnętrzny), bez
   tabel, infoboksu, podpisów zdjęć, przypisów i sekcji „See also”, „References” itp.
   IntersectionObserver (obserwator przecięć) mówi przeglądarce: „daj znać, gdy ten element
   wjedzie na ekran albo z niego zjedzie” — bez liczenia czegokolwiek przy każdym przewinięciu.
   Dla elementów, które są teraz na ekranie, co pół sekundy dokładamy czas, jeśli karta jest
   aktywna i akapit widać w wystarczającej części. Akapit, który był na ekranie łącznie ≥ 2 s,
   jest przeczytany. Akapity zapamiętujemy jako krótkie skróty tekstu (hash), więc drobna edycja
   hasła na Wikipedii nie przesuwa całego zapisu. */
const READ_MS = 2000;
const IDLE_MS = 3 * 60e3;                // po 3 min bez dotyku i przewijania nie liczymy czasu wizyty
const STOP_SECTIONS = /^(see also|references|notes|footnotes|citations|sources|bibliography|further reading|external links|notes and references|references and notes|works cited|explanatory notes|general and cited references)$/i;
const NOT_TEXT = 'table, .infobox-wrap, figure, .gallery, .reflist, .references, .mw-references-wrap, .refbegin, .hatnote, .thumb, .toc, .sidebar, .noprint';

// Skrót tekstu akapitu (FNV-1a, 32 bity) — 6–7 znaków zamiast całego akapitu.
function textHash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36);
}

function measureUnits(root) {
  const units = [];
  let stop = false;
  for (const el of root.querySelectorAll('h2, p, ul, ol, dl, blockquote')) {
    if (el.tagName === 'H2') { stop = STOP_SECTIONS.test(el.textContent.trim()); continue; }
    if (stop || el.closest(NOT_TEXT) || el.parentElement.closest('p, ul, ol, dl, blockquote')) continue;
    const text = el.textContent.replace(/\[(\d+|[a-z]|note \d+)\]/gi, '').replace(/\s+/g, ' ').trim();
    if (text.length < 20) continue;
    units.push({ el, hash: textHash(text.slice(0, 240)) });
  }
  return units;
}

// Pierwszy nieprzeczytany akapit; pojedyncza „dziura” między przeczytanymi nie zatrzymuje.
function firstUnread(flags) {
  for (let i = 0; i < flags.length; i++) {
    if (flags[i]) continue;
    if (i > 0 && flags[i - 1] && flags[i + 1]) continue;
    return i;
  }
  return -1;
}

const meter = {
  m: null,                               // bieżący pomiar: {title, units, byEl, rec, seen, dwell, inView, visit, io, timer}
  lastInput: Date.now(),
  saveTimer: null,

  start(title, resume) {
    this.stop();
    const units = measureUnits($('#article'));
    if (!units.length) return;
    const rec = state.reads.get(title) || { title, n: 0, read: 0, seen: [], state: 'open', visits: 0, ms: 0, at: Date.now() };
    if (!rec.seen) rec.seen = [];
    if (state.visit?.fresh || !rec.visits) rec.visits = (rec.visits || 0) + 1;
    const m = {
      title, units, rec, visit: state.visit?.entry || null,
      byEl: new Map(units.map((u) => [u.el, u])),
      seen: new Set(rec.seen), dwell: new Map(), inView: new Set(), last: performance.now(), t0: performance.now()
    };
    this.m = m;
    this.stats();
    state.reads.set(title, rec);
    this.flush();

    const top = $('.bar').offsetHeight;
    m.io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? m.inView.add(e.target) : m.inView.delete(e.target);
    }, { rootMargin: `-${top}px 0px 0px 0px` });
    for (const u of units) if (!m.seen.has(u.hash)) m.io.observe(u.el);
    m.timer = setInterval(() => this.tick(), 500);

    if (resume && rec.first >= 0 && rec.read > 0) this.jumpTo(units[rec.first].el);
  },

  // Miejsce powrotu: przewiń do akapitu (dy = odstęp od paska u góry); mark = różowa zakładka na marginesie.
  jumpTo(el, dy = 24, mark = true) {
    if (mark) el.classList.add('resume');
    let y = 0;
    const go = () => { y = Math.max(0, el.getBoundingClientRect().top + scrollY - $('.bar').offsetHeight - dy); window.scrollTo(0, y); };
    go();
    // Poprawka po doładowaniu obrazków nad akapitem — tylko jeśli w międzyczasie nie przewijałaś.
    for (const ms of [250, 700]) setTimeout(() => { if (el.isConnected && Math.abs(scrollY - y) < 4) go(); }, ms);
  },

  /* Miejsce, w którym skończyłaś: pierwszy akapit przy górnej krawędzi ekranu (jego skrót)
     i jego odstęp od paska, a na zapas zwykła pozycja w pikselach. Zapisywane w stanie czytania
     hasła (rec.spot), więc przetrwa też zamknięcie aplikacji. Na samej górze hasła — brak miejsca. */
  spotNow() {
    const m = this.m;
    if (!m || scrollY < 150) return null;
    const top = $('.bar').offsetHeight;
    for (const u of m.units) {
      const r = u.el.getBoundingClientRect();
      if (r.bottom > top + 8) return { h: u.hash, dy: Math.round(r.top - top), y: Math.round(scrollY), at: Date.now() };
    }
    return { y: Math.round(scrollY), at: Date.now() };
  },

  // Powrót do zapisanego miejsca: najpierw po akapicie, gdy go nie ma (hasło zmienione) — po pikselach.
  restore(spot) {
    const u = this.m?.units.find((x) => x.hash === spot.h);
    if (u) this.jumpTo(u.el, spot.dy, false);
    else window.scrollTo(0, spot.y || 0);
  },

  tick() {
    const m = this.m;
    if (!m) return;
    const now = performance.now();
    const dt = Math.min(now - m.last, 1000);   // uśpiona karta nie nabija czasu
    m.last = now;
    if (document.visibilityState !== 'visible' || $('#view-reader').hidden || !$('#sheet').hidden) return;
    if (Date.now() - this.lastInput < IDLE_MS) {
      m.rec.ms = (m.rec.ms || 0) + dt;
      if (m.visit) { m.visit.ms = (m.visit.ms || 0) + dt; m.visit.end = Date.now(); }
      m.dirty = true;
    }
    const top = $('.bar').offsetHeight, vh = innerHeight;
    for (const el of m.inView) {
      const r = el.getBoundingClientRect();
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, top);
      // Krótki akapit: widać ≥ 60% jego wysokości. Długi: zajmuje ≥ połowę ekranu.
      if (visible <= 0 || visible < Math.min(r.height * 0.6, (vh - top) * 0.5)) continue;
      const d = (m.dwell.get(el) || 0) + dt;
      m.dwell.set(el, d);
      if (d >= READ_MS) this.markRead(el);
    }
    if (m.dirty && Date.now() - (m.savedAt || 0) > 10000) this.flush();
  },

  markRead(el) {
    const m = this.m;
    const u = m.byEl.get(el);
    m.io.unobserve(el);
    m.inView.delete(el);
    if (!u || m.seen.has(u.hash)) return;
    m.seen.add(u.hash);
    m.rec.seen.push(u.hash);
    if (m.visit) m.visit.p = (m.visit.p || 0) + 1;
    this.stats();
    m.dirty = true;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.flush(), 3000);
  },

  // Przelicza liczby hasła z bieżącego tekstu. Stan tylko rośnie: doczytane zostaje doczytanym.
  stats() {
    const { rec, units, seen } = this.m;
    const flags = units.map((u) => seen.has(u.hash));
    rec.n = units.length;
    rec.read = flags.filter(Boolean).length;
    rec.first = firstUnread(flags);
    rec.firstHash = rec.first >= 0 ? units[rec.first].hash : null;
    const pct = rec.read / rec.n, now = Date.now();
    if (pct >= DONE_AT && rec.state !== 'done') { rec.state = 'done'; rec.doneAt = now; if (!rec.seenAt) rec.seenAt = now; }
    else if (pct >= SEEN_AT && rec.state === 'open') { rec.state = 'seen'; rec.seenAt = now; }
  },

  flush() {
    const m = this.m;
    if (!m) return;
    clearTimeout(this.saveTimer);
    // Miejsce zapisujemy dopiero, gdy hasło już stoi tam, gdzie miało się otworzyć (nie od razu po wczytaniu).
    if (performance.now() - m.t0 > 1500) { const s = this.spotNow(); if (s) m.rec.spot = s; else delete m.rec.spot; }
    m.rec.at = Date.now();
    m.dirty = false;
    m.savedAt = Date.now();
    store.saveVisit(m.visit, m.rec);
  },

  stop() {
    const m = this.m;
    if (!m) return;
    this.flush();
    m.io.disconnect();
    clearInterval(m.timer);
    document.querySelectorAll('#article .resume').forEach((el) => el.classList.remove('resume'));
    this.m = null;
  }
};

for (const ev of ['scroll', 'touchstart', 'pointerdown', 'keydown', 'wheel']) {
  window.addEventListener(ev, () => { meter.lastInput = Date.now(); }, { passive: true, capture: true });
}
// Zapis przy zejściu z aplikacji (inna aplikacja, zgaszony ekran, zamknięcie karty).
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') meter.flush(); });
window.addEventListener('pagehide', () => meter.flush());

/* ——— pasek postępu przewijania ——— */
function setProgress(r) { $('#progress').style.width = (Math.max(0, Math.min(1, r)) * 100) + '%'; }
window.addEventListener('scroll', () => {
  if ($('#view-reader').hidden) return;
  const art = $('#article');
  const total = art.offsetTop + art.offsetHeight - window.innerHeight;
  setProgress(total > 0 ? window.scrollY / total : 1);
}, { passive: true });

/* ——— szybki powrót: poprzedni krok tropu + na górę (wariant P2) ———
   Od chwili, gdy trop znika z ekranu (300 px), w lewym dolnym rogu stale jest różowe kółko „←”.
   Przewijanie w górę rozwija je w pigułkę z nazwą poprzedniego kroku i pokazuje „↑”;
   czytanie w dół zwija z powrotem do kółka. */
let floatY = 0;
function hideFloat() { $('#float').hidden = true; $('#float').classList.remove('up'); }
window.addEventListener('scroll', () => {
  if ($('#view-reader').hidden) return;
  const y = scrollY, dy = y - floatY;
  if (Math.abs(dy) < 12) return;
  floatY = y;
  const f = $('#float');
  f.hidden = y < 300;
  f.classList.toggle('up', dy < 0);
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

state.reader = { ...READER_DEFAULT, ...(lsGet('reader') || {}) };   // od razu, zanim wstanie baza
state.presets = [];

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
  if (e.key === 'Escape') { hideNote(); toggleSheet(false); toggleMap(false); closePeek(); toggleSearch(false); state.searchFrom = null; }
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
// Miejsce w haśle przywracamy sami (meter.restore); przeglądarka nie przewija przy „wstecz”.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
function route() {
  const m = location.hash.match(/^#\/(?:(pl)\/)?wiki\/(.+)$/);
  meter.stop();
  toggleMap(false);
  closePeek();
  closeSelBar();
  closeWhy();
  $('#suggestions').hidden = true;
  hideFloat();
  if (m) { toggleSearch(false); openArticle(keyFor(m[1] || WIKI_LANG, decodeTitle(m[2]))); }
  else if (location.hash === '#/zakreslenia') renderHighlights();
  else if (location.hash === '#/wezly') renderNodes();
  else renderHome();
}
// Start: najpierw dane z bazy, potem pierwszy widok.
store.ready.then(() => {
  state.history = store.get('history', []);
  state.saved = store.get('saved', ['Garden city movement']);
  state.thumbs = store.get('thumbs', {});
  state.reader = { ...READER_DEFAULT, ...store.get('reader', {}) };
  state.presets = store.get('presets', []);
  state.reads = new Map(store.get('reads', []).filter((r) => r?.title).map((r) => [r.title, r]));
  state.highlights = store.get('highlights', []).filter((h) => h?.id && h.title).sort((a, b) => a.at - b.at);
  state.trails = loadTrails();
  applyReader();
  window.addEventListener('hashchange', route);
  route();
});

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
