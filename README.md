# Zakamarki

Osobisty czytnik angielskiej Wikipedii z zapisem tropów. Etap 1 z 7.

## Co jest w środku

| Plik | Rola |
|---|---|
| `index.html` | szkielet: nagłówek z wyszukiwarką i trzy widoki (start, wyniki, czytnik) |
| `style.css` | wygląd; kolory, kroje i rozmiary to zmienne na górze pliku |
| `app.js` | logika: zapytania do API Wikipedii, czyszczenie treści, zapis tropu i historii |
| `manifest.webmanifest` | opis potrzebny, żeby telefon traktował stronę jak aplikację |
| `sw.js` | service worker: trzyma pliki aplikacji w pamięci telefonu |
| `icons/` | ikony aplikacji |
| `CLAUDE.md` | kontekst projektu dla Claude Code |
| `docs/` | plan etapów i handoffy z sesji |

Dane (trop, historia, przypięte) leżą wyłącznie w pamięci przeglądarki na danym urządzeniu. Repozytorium zawiera tylko kod.

## Wdrożenie na GitHub Pages

1. Na github.com: **New repository** → nazwa `zakamarki` → **Public** → Create.
2. W nowym repozytorium: **uploading an existing file** → przeciągnij wszystkie pliki oraz foldery `icons` i `docs` (zawartość folderu `zakamarki`, nie sam folder) → **Commit changes**.
3. **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save.
4. Po 1–2 minutach aplikacja działa pod adresem `https://TWOJANAZWA.github.io/zakamarki/`.
5. Android (Chrome): otwórz adres → menu ⋮ → **Zainstaluj aplikację** / **Dodaj do ekranu głównego**.
   iPad (Safari): przycisk udostępniania → **Do ekranu początkowego**.

Aktualizacja w przyszłości: w repozytorium **Add file → Upload files**, wgrywasz nowe wersje plików, commit. Telefon pokaże nową wersję przy drugim otwarciu aplikacji.
