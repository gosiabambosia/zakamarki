# Handoff: Zakamarki — więcej okładek ze zdjęciami, tymczasowe Szkliwo, paleta odłożona

**Data:** 2026-11-22 (wieczór, ciąg dalszy sesji 010)
**Stan:** `zakamarki-v17`. Schemat bazy bez zmian (DB v3, kopia v3). `node tools/check.mjs` — wszystko OK.
**Następna sesja zaczyna od:** przeglądu **etapu 4 (Trop i Węzły)** według `docs/PLAN.md`. **Paleta na sam koniec** — nie proponować nowych wariantów kolorów, dopóki sama nie wróci do tematu.

## Zrobione
- **Więcej okładek ze zdjęciami** (`app.js`):
  1. `prop=pageimages` z `pilicense: 'any'` — Wikipedia domyślnie pomija zdjęcia z licencją nie-wolną (okładki, plakaty, logotypy).
  2. `fallbackThumbs()` — gdy brak zdjęcia głównego: `prop=images` → największe zdjęcie z hasła (jpg/png/webp, ≥ 200 px, bez ikon szablonów: `ICON_FILE`), `prop=imageinfo` z `iiurlwidth=300`, paczki po 50 tytułów.
  3. `coverFromArticle()` — przy czytaniu pierwsze zdjęcie z treści (≥ 100×100, bez SVG).
  - W `state.thumbs`: `null` = stary wpis z pamięci (sprawdzany jeszcze raz), `false` = hasło naprawdę bez zdjęć (wiele pojęć filozoficznych). Pomocnicza `needThumb()`.
- **Okładki bez zdjęcia — Szkliwo (tymczasowo):** nowe zmienne `--cover-1…5` i `--cover-ink` w `style.css` (dzień i noc), `COVER_COLORS`/`GLASS` w `app.js` biorą je zamiast `--pop-*`. Akcenty palety (róż kropek tropów, musztarda przycisków) **bez zmian** — chciała zachować róż tropów. Pełne barwy (koniec pasteli i `--cover-mix`/`--cover-base`), litera zawsze ciemna; szkło na okładce bez zdjęcia = jasna mgła. „Czytaj dalej” bez zdjęcia = `--cover-1`, karta hasła = `--cover-4`.
- **Jedna tafla:** `--slab` (dzień `#faf2e8`, noc `#efe2cf` mocno rozcieńczony) dla Na później i Przeczytane; mleczne szkło `blur(16px) saturate(1.15)`, biała krawędź, tytuły `var(--fg)`. Usunięte `--slab-later`, `--slab-done`.
- Sprawdzone 375 px Papier/Kakao (dane testowe tylko w pamięci), konsola czysta. STYL, PLAN, CLAUDE.md zaktualizowane.

## Paleta — co wiemy (na koniec projektu)
- Przebodźcowały ją kolejne rundy wariantów (O1–O3, B1–B3, Z1–Z6, R1–R4, T1–T4 w `.drafts/makiety/okladki.html`, poza gitem). **Chce sama wybrać pojedyncze kolory i złożyć paletę.** Propozycja na wtedy: prosta strona-próbnik — ona klika kolory (z jej palet), prawdziwa aplikacja w ramce przyjmuje je na żywo; bez naszych wariantów.
- Jej sygnały: tło `#F8F4EC`, karty `#FFFCF5`; okładki w stronę `#E5C267` (złoto), `#DDA9B8` (przydymiony róż), `#66664C` (szara oliwka) + jakiś fiolet. Ranking zestawów z palet Procreate: Z2 Ogród > Z3 (ale łagodniej) > Z1 > Z4 > Z5; Z6 i B3 za głośne/ciężkie. Zachować róż tropów `#d98aa3`. Pastele = „mdłe”.
- Jej palety Procreate (iCloud): `Amelie_color_palette.ase.swatches`, `studio_ghibli.swatches`, `Wes_Anderson.swatches` — to zipy z `Swatches.json` (RGB 0–1), czytelne przez `unzip` + node.
- `#FFFCF5` w czytniku: z tekstem `#2D2C28` kontrast 13,6:1 (jej zakres 10–13) — przy wdrożeniu rozjaśnić tekst do ok. `#3A3530` (11,8:1).
- Tafla Na później była blisko złotych okładek — przy palecie ze złotem tafla musi zostać neutralna (jak teraz).

## Następne etapy (z PLAN.md) — do przejrzenia
- **4. Trop i Węzły** (następny): rekomendacje z widocznym uzasadnieniem i wagami ustawianymi przez nią. *Trop* = sąsiedzi ostatniego hasła ważeni linkami wspólnymi z całą ścieżką; *Węzły* = nieprzeczytane hasła, do których prowadzą przeczytane z kilku różnych tropów (ranking: liczba niezależnych tropów). Sygnały: przeczytane, zakreślenia („Prowadzą do tego samego” już liczy wspólne cele), rodziny tropów. Decyzje dla niej: gdzie to się pokazuje (kółko „Węzły” w dolnym pasku jest już zaplanowane), jak wygląda uzasadnienie (liczby + ścieżka), domyślne wagi.
- **5. Statystyki i Atlas** — czas i słowa, głębokość, najdłuższe tropy, węzły, epoki/miejsca/rodzaje (Wikidata), kalendarz, wzrost mapy.
- **6. Przejścia, Osobliwości, Parametry.** **7. Myślnia** (notatka do Obsidiana, synchronizacja).
- Do sprawdzenia przy budowie: CORS Lift Wing; czyszczenie pamięci w Safari na iPadzie.

## Otwarte, poza etapami
- Krój samej nazwy „zakamarki” (K1/K4/K5 w `.drafts/makiety/typografia.html`) — też raczej po etapach.
- Czytnik: długi tytuł obok PL / Aa / Na później łamie się bez łącznika — użyć `shy()`.
- Nocą szew: śliwkowy nagłówek vs brązowe Kakao.
- Hook `pre-push` z `check.mjs` — czeka na decyzję. Etap 2 testów — tylko za jej zgodą.

## Prompt dla kolejnego agenta
```
Pracujemy nad Zakamarkami (~/Projekty/zakamarki, PWA, czysty HTML/CSS/JS, push na main = wdrożenie).
Na start wywołaj skill task-observer (dziennik: ~/Projekty/.task-observer/observation-log.md — OPEN obserwacje stosuj).
Przeczytaj CLAUDE.md, docs/PLAN.md, docs/STYL.md i handoff docs/handoffs/2026-11-22-011-zakamarki-okladki-szkliwo.md. git status, git log -5.
Zaczynamy etap 4 (Trop i Węzły). Kolorów i palety NIE ruszamy — zostawione na koniec, wybierze sama.
1. Wyjaśnij krótko jedno pojęcie, które etap wprowadza; pokaż 2–3 decyzje (gdzie, jak wygląda uzasadnienie, wagi) z rekomendacją — jedna decyzja naraz.
2. Przed pushem: node tools/check.mjs. Na koniec handoff 012, PLAN/STYL, commit, push; pokaż obserwacje task-observer.
```
