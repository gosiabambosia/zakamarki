# Handoff: Zakamarki — logo i nazwa z gwiazdą; etap 5 ruszył (decyzja: 5a → 5c → 5b)

**Data:** 2026-11-22 (wieczór, po handoffie 014)
**Stan:** `zakamarki-v26` na `main`. Repo czyste po commicie handoffu. Użytkowniczka robi przerwę po tej sesji.
**Następny krok:** etap **5a — Statystyki z własnego śladu**: decyzja (b) „które 3–5 statystyk najpierw” — pokazana próbnikiem na jej prawdziwych liczbach, nie listą.

## Co zrobione
1. **Próbnik logo** `.drafts/makiety/logo-probnik.html` (poza gitem). Litery rysowane jako ścieżki przez opentype.js 1.3.4 (CDN) z lokalnego `.drafts/makiety/fonts/Corben-Bold.ttf` (OFL, z repo google/fonts) — podgląd = plik wynikowy. Konteksty: iPad (zaokrąglony kwadrat), Android (kółko z wersji maskable — widać środkowe 80%), 40/32/16 px, karta przeglądarki, ekran telefonu jasny i ciemny wśród neutralnych ikon, prawdziwy nagłówek aplikacji w ramce. Wybór: kafle **zapisane** (+ zapis bieżącego), **znak** (z · zk · zaka/marki · sama kropka), **kropka** (kropka Corben, gwiazdy ✦ gruba/średnia/cienka, 6 rysowanych: wydłużona, ręczna, wiatraczek, z promykami, miękka, pochylona), kolory z palety, buźka (na kropce), suwaki: wielkość (względem koła, 100% = połowa przekątnej 0,36 ikony), kropka ×, poziom, pion, obrót, odstęp, ✦ poziom/pion (przesuwa tylko gwiazdę, po wyliczeniu środka). W wąskim panelu przyklejony pasek podglądu.
2. **Ikona (v23)** — jej linijka: `znak zakamarki · gwiazda miękka · tło #fffcf5 · litery #d0472f · kropka #05094d · wielkość 113% · kropka ×2,35 · odstęp -0,040 em · ✦ poziom 10 · ✦ pion -20`. Zapasowa (jej poprzedni wybór, zapisany w próbniku): ta sama z gwiazdą cienką ×2,25, bez przesunięcia.
   - Eksport: `logoSVG(false|true)` w próbniku → `fetch` POST do jednorazowego odbiornika `127.0.0.1:8765` (skrypt w scratchpadzie) → `icons/icon.svg`, `icon-maskable.svg`; PNG przez `qlmanage -t -s 512/192/180`. Manifest i nazwy plików bez zmian.
3. **Nazwa „zakamarki✦” (v24–v25):** w `index.html` zamiast `<span class="dot">` inline SVG `.star` (ta sama miękka gwiazda, ścieżka w viewBox `-1.6 -1.9 82.2 100.3`), w CSS 0,7×0,86 em, odstęp 0,16 em, `translateY(-.1em)`, kolor `--pop-orange` (nocą jasny pomidor). Odstęp liter −0,04 em (jak w logo). Pierwsza wersja gwiazdy (0,5 em) „gubiła się”.
4. **Etap 5 — decyzja (a):** kolejność **5a → 5c → 5b** (jej wybór, zgodny z rekomendacją). Zapisane w PLAN.

## Dopisek (v26)
- Odstęp liter w logo i nazwie: −0,04 → **−0,025 em** (zmierzone opentype.js: przy −0,04 pudełka „z” i „a” nachodzą o 2 jednostki/1000, przy −0,025 mają 13 szpary). Logo wyeksportowane z próbnika na nowo, reszta ustawień bez zmian.
- Gwiazda w nazwie wyśrodkowana na **środku małych liter** (x-height 0,633 em → środek 0,317 em nad linią pisma; zmierzone w aplikacji: 7,4 px = 7,4 px).
- CACHE `zakamarki-v26`.

## Następny krok: 5a — które statystyki najpierw
- Dane już są (bez nowych zapytań): wizyty w `history` (czas `ms`, nowe akapity `p`, dzień), `reads` (stany otwarte/przejrzane/doczytane, akapity, czas), `trails` (długość, odgałęzienia, skoki), półki (`saved`), `highlights` (kolory, hasła), Węzły (`computeNodes`).
- Kandydaci z PLAN: czas i słowa, głębokość (doczytane vs przejrzane), najdłuższe tropy, najgęstsze węzły (forma „wiersze zbiegające się w liczbie” z etapu 4), kalendarz aktywności, wzrost mapy. Wzorce: wielkie kobaltowe liczby (każda = pomiar), bloby zarezerwowane na tematy (5c).
- Forma wyboru: **próbnik na prawdziwej aplikacji** (O21) — kafle-statystyki na jej danych w ramce ekranu Statystyki, zaznacza 3–5, kolejność przeciąganiem albo numerem; potem decyzja (c) miejsce: czwarte kółko w dolnym pasku (znak do wyboru kształtem).
- Dane do próbnika czytać z jej IndexedDB na `http://[::1]:8000` tylko w przeglądarce (nic nie zapisywać, nic nie commitować).

## Wnioski o współpracy
- Próbnik od razu zadziałał także dla logo: 1 podejście + 1 prośba o więcej (gwiazdy, położenie gwiazdy). Prośba „bardziej narysowane, nie naive” = proste kształty z jedną świadomą asymetrią; każdą opcję obejrzeć w kaflu, zanim ją pokażę (O24).
- Panel przeglądarki bywa wąski (~480 px) — próbnik musi mieć przyklejony podgląd także w wąskim widoku (O23).
- „Zostaw jako opcję” = zapisany kafel, który przywraca cały układ.

## Uwagi techniczne
- Serwer: python http.server na 8000 już działał (spoza `preview_start`); adres `http://[::1]:8000/`.
- Nawigacja z karty `file://` w batchu przenosi stronę do nowej karty, a dalsze kroki z tym samym tabId trafiają w starą (`data:`) — najpierw zamknąć karty `file://`, potem nawigować (O22).
- Na Androidzie zainstalowana PWA podmienia ikonę z opóźnieniem (do ~doby); szybciej: usunąć skrót i zainstalować ponownie.
- CACHE: `zakamarki-v26`.

## Prompt dla kolejnego agenta
```
Pracujemy nad Zakamarkami: osobistym czytnikiem angielskiej Wikipedii (PWA, czysty HTML/CSS/JS, bez frameworka, GitHub Pages). Repozytorium: ~/Projekty/zakamarki (push na main = wdrożenie; hook pre-push uruchamia tools/check.mjs).

Na start:
1. Wywołaj skill task-observer (dziennik: ~/Projekty/.task-observer/observation-log.md); obserwacje OPEN stosuj, zwłaszcza O10–O24.
2. Przeczytaj CLAUDE.md, docs/PLAN.md (pkt 5), docs/STYL.md i handoff docs/handoffs/2026-11-22-015-zakamarki-logo.md. git status, git log -5.

Zadanie — etap 5a: Statystyki z własnego śladu. Kolejność etapu ustalona: 5a → 5c → 5b.
1. Decyzja (b): które 3–5 statystyk najpierw. Pokaż je próbnikiem na jej prawdziwych danych (IndexedDB na http://[::1]:8000, tylko odczyt, nic nie zapisuj ani nie commituj): kafle-statystyki w ramce ekranu, zaznaczanie i kolejność, linijka „kopiuj”. Bez rund wariantów.
2. Potem decyzja (c): miejsce (czwarte kółko w dolnym pasku — znak kształtem).
3. Wdrożenie ekranu Statystyki, CACHE +1, sprawdzenie na 375 px i w konsoli, commit, push.
Przy relacjach (najgęstsze węzły, tropy) możesz użyć skilla renderownia.

Zasady: po polsku, krótko, jedna decyzja naraz, 2–3 warianty tylko przy wąskich decyzjach, opcje pokazuj próbką/kształtem/położeniem, bez zdań-pytań w interfejsie. Przed pokazaniem makiety: zamknij karty file://, pokaż z http://[::1]:8000/..., sprawdź też wąski panel. Każdą odpowiedź kończ sekcją „Dalej”. Nigdy nie commituj jej danych. Przy zmianie plików aplikacji podbij CACHE. Na koniec handoff docs/handoffs/…-016-…md, aktualizacja PLAN/STYL, commit, push; pokaż obserwacje task-observer.
```
