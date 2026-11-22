#!/usr/bin/env node
// Skrypt kontrolny przed wysłaniem zmian (etap 1 testów, handoff 009).
// Uruchom w katalogu repo:  node tools/check.mjs
// Porównuje stan roboczy z origin/main (tym, co jest teraz na telefonie) i pilnuje reguł,
// które wcześniej zależały tylko od pamięci. Bez zależności — sam Node.
// Kod wyjścia 0 = wszystko w porządku, 1 = coś trzeba poprawić przed pushem.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const BASE = 'origin/main';
const APP_FILES = /^(app\.js|style\.css|index\.html|sw\.js|manifest\.webmanifest|icons\/)/;
const problems = [];
const notes = [];
const ok = (msg) => console.log('  ✓ ' + msg);
const bad = (msg) => { problems.push(msg); console.log('  ✗ ' + msg); };

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const atBase = (file) => { try { return git('show', `${BASE}:${file}`); } catch { return null; } };
const grab = (src, re) => src?.match(re)?.[1] ?? null;

console.log(`Zakamarki · kontrola przed wysłaniem (porównanie z ${BASE})\n`);

// 1. Składnia: czy pliki JS w ogóle dają się wczytać.
for (const f of ['app.js', 'sw.js']) {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status === 0) ok(`składnia ${f}`);
  else bad(`błąd składni w ${f}:\n${r.stderr.split('\n').slice(0, 5).join('\n')}`);
}

// 2. Pliki z listy SHELL w sw.js muszą istnieć — brak jednego psuje instalację i tryb offline.
const sw = readFileSync('sw.js', 'utf8');
const shell = [...(grab(sw, /const SHELL = \[([\s\S]*?)\]/) || '').matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter(Boolean);
const missing = shell.filter((f) => !existsSync(f));
if (missing.length) bad(`sw.js wymienia pliki, których nie ma: ${missing.join(', ')}`);
else ok(`pliki z listy SHELL istnieją (${shell.length})`);

// 3. CACHE: zmienione pliki aplikacji → nowa nazwa pamięci, inaczej telefon pokaże starą wersję.
const changed = git('diff', '--name-only', BASE).split('\n').filter(Boolean);
const untracked = git('ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean);
const appChanged = [...changed, ...untracked].filter((f) => APP_FILES.test(f));
const cacheNow = grab(sw, /const CACHE = '([^']+)'/);
const cacheBase = grab(atBase('sw.js'), /const CACHE = '([^']+)'/);
if (!appChanged.length) ok('pliki aplikacji bez zmian — CACHE nie musi się zmieniać');
else if (cacheNow !== cacheBase) ok(`zmienione: ${appChanged.join(', ')} · CACHE ${cacheBase} → ${cacheNow}`);
else bad(`zmieniły się pliki aplikacji (${appChanged.join(', ')}), a CACHE w sw.js dalej '${cacheNow}' — podbij wersję`);

// 4. Schemat bazy: nowe DB_VERSION wymaga kroku migracji i nowej wersji kopii zapasowej.
const app = readFileSync('app.js', 'utf8');
const dbNow = Number(grab(app, /const DB_VERSION = (\d+)/));
const dbBase = Number(grab(atBase('app.js'), /const DB_VERSION = (\d+)/));
const bkNow = Number(grab(app, /const BACKUP_VERSION = (\d+)/));
const bkBase = Number(grab(atBase('app.js'), /const BACKUP_VERSION = (\d+)/));
if (dbNow === dbBase) ok(`schemat bazy bez zmian (DB_VERSION ${dbNow})`);
else {
  if (!app.includes(`oldVersion < ${dbNow}`)) bad(`DB_VERSION ${dbBase} → ${dbNow}, ale brak kroku „oldVersion < ${dbNow}” w onupgradeneeded`);
  else ok(`krok migracji oldVersion < ${dbNow} jest`);
  if (bkNow === bkBase) bad(`DB_VERSION się zmieniło, a BACKUP_VERSION dalej ${bkNow} — podbij wersję kopii`);
  else ok(`BACKUP_VERSION ${bkBase} → ${bkNow}`);
  notes.push('ZMIANA SCHEMATU BAZY: przed pushem zrób świeżą kopię zapasową na telefonie (ekran startowy → Kopia zapasowa → „Zapisz kopię”).');
}

// 5. Repo jest publiczne: żaden plik kopii zapasowej (z prawdziwymi danymi) nie może do niego trafić.
const toShip = [...new Set([...git('ls-files').split('\n'), ...untracked])].filter((f) => f.endsWith('.json') && existsSync(f));
const leaks = toShip.filter((f) => /"app"\s*:\s*"zakamarki"/.test(readFileSync(f, 'utf8').slice(0, 200)));
if (leaks.length) bad(`pliki wyglądają na kopię zapasową z danymi — nie wysyłaj: ${leaks.join(', ')}`);
else ok('brak plików kopii zapasowej w repo');

console.log('');
for (const n of notes) console.log('! ' + n);
if (problems.length) { console.log(`\n${problems.length} do poprawienia przed pushem.`); process.exit(1); }
console.log('Wszystko w porządku — można wysyłać.');
