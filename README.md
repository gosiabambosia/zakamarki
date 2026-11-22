# Zakamarki

Osobisty czytnik angielskiej (i polskiej) Wikipedii z zapisem tropów czytania i rekomendacjami, które pokazują swoje uzasadnienie. PWA w czystym HTML/CSS/JS, bez frameworka i kroku budowania. Etapy 1–4 z 8 (plan: `docs/PLAN.md`).

Działa pod adresem: https://gosiabambosia.github.io/zakamarki/

## Co jest w środku

| Plik | Rola |
|---|---|
| `index.html` | szkielet: widoki start, Zakreślenia, Węzły, wyniki, czytnik; arkusze i dolny pasek |
| `style.css` | wygląd; kolory, kroje i rozmiary to zmienne na górze pliku |
| `app.js` | logika: API Wikipedii, czyszczenie treści, tropy, pomiar czytania, półki, zakreślenia, Trop i Węzły, kopia zapasowa |
| `manifest.webmanifest`, `sw.js`, `icons/` | instalacja jako aplikacja i praca offline; `icons/icon.svg` to źródło ikon |
| `tools/check.mjs` | skrypt kontrolny przed wysłaniem (uruchamia go też lokalny hook `pre-push`) |
| `CLAUDE.md` | kontekst projektu dla Claude Code |
| `docs/` | plan etapów (`PLAN.md`), kierunek wizualny (`STYL.md`), handoffy z sesji |

Dane czytania (tropy, historia, półki, zakreślenia) leżą wyłącznie w pamięci przeglądarki na danym urządzeniu (IndexedDB); przenosi je plik kopii zapasowej z ekranu startowego. Repozytorium zawiera tylko kod.

## Wdrożenie

Push na gałąź `main` → GitHub Pages publikuje w 1–2 minuty. Przed pushem: `node tools/check.mjs` (kod wyjścia 1 = nie wysyłać). Przy każdej zmianie plików aplikacji podbić `CACHE` w `sw.js`.

Instalacja: Android (Chrome) — menu ⋮ → **Zainstaluj aplikację**; iPad (Safari) — Udostępnij → **Do ekranu początkowego**.
