# Handoff: Zakamarki — start etapu 8 (paleta i nazwa) jako następnego

**Data:** 2026-11-22 (wieczór, po handoffie 012)
**Stan:** `zakamarki-v20` na `main` (etap 4 Trop i Węzły, baza v4, nagłówek hasła T1, hook pre-push). Repo czyste, dokumenty aktualne.
**Zmiana kolejności:** etap 8 (paleta i nazwa) **idzie teraz, przed etapem 5**. Obecne kolory ją irytują.

## Czego chce (jej słowa, streszczone)
1. **Główne tło ekranu trochę jaśniejsze** niż dzisiejsze `#efe2d1` (wcześniejszy sygnał: tło `#F8F4EC`, karty `#FFFCF5`).
2. **Kolory kafelków i miniatur** (okładki bez zdjęcia, dziś tymczasowe Szkliwo `--cover-1…5`, i podobne kafle).
3. **Wybiera kolory sama:** kilka palet z różnymi kolorami, ona zaznacza te, które się jej podobają, a **wizualizacja od razu się aktualizuje** (albo coś podobnego, jeśli tak się nie da). Bez gotowych zestawów od nas i bez rund wariantów — przebodźcowywały (obserwacje O11, O12).
4. **Test stylu z referencji** `.drafts/inspiracje/11-ui-lawendowa-biblioteka.webp` (przysłała ją jeszcze raz): lawendowo-barwinkowe tło, wielki czarny grotesk jako bohater ekranu („You Have 12 New Books Design”), okładki na półce ze szklanym pasem, biała karta na dole z pigułkami-licznikami i wielką liczbą „250”. Chce zobaczyć, czy to się u niej sprawdzi, **tylko nieco jaśniejsze**. (Ta referencja jest już w STYL.md jako źródło półek ze szkłem i wielkich liczb).

## Proponowana kolejność (jedna decyzja naraz)
1. **Próbnik** `.drafts/makiety/probnik.html` (poza gitem): z lewej palety jako rzędy kafli-próbek, z prawej **prawdziwa aplikacja w ramce** (ekran startowy z półkami; ewentualnie druga ramka: Węzły albo czytnik). Zapisy do bazy wyłączone, przykładowe hasła tylko w pamięci (wzór: `seed()` w `.drafts/makiety/karta.html` / `kolory.html`).
   - **Krok A — tło:** jeden rząd jasnych neutralnych (jaśniejszych od `#efe2d1`, w tym `#F8F4EC`, ciepłe biele, bardzo jasna lawenda), jedno stuknięcie = tło w ramce na żywo. Do tego karty (`--surface`) automatycznie o stopień jaśniejsze albo osobny rząd.
   - **Krok B — kafle/okładki:** wszystkie jej palety jako rzędy; stuknięcie zaznacza / odznacza kolor (wielokrotny wybór), zaznaczone od razu stają się kolejnymi `--cover-1…N` w ramce (cyklicznie). Kolejność = kolejność zaznaczania. Widoczna lista wybranych (same próbki, bez nazw), przycisk „wyczyść”. Litera na okładce: automatycznie ciemna albo jasna według kontrastu.
   - Bez słownych nazw kolorów w interfejsie próbnika (tylko próbki; hex w `title`). Wynik: przycisk, który pokazuje gotowe wartości do wklejenia (albo zapis do `localStorage` makiety), żeby wdrożyć wybór.
2. **Wdrożenie** wybranych wartości w `style.css` (`:root`: `--bg`, `--surface`, `--surface-2`, `--rule`, `--cover-1…N`; `COVER_COLORS` w `app.js`, jeśli zmieni się liczba kolorów), noc dopasować do dnia (tu też **szew nocą**: śliwkowy nagłówek nad brązowym Kakao). Sprawdzić: tafle półek zostają jednolite i półprzezroczyste (podobają się), róż tropów `#d98aa3` zostaje, Lampy (zakreślacze) nie powtarzają nowych kolorów, kontrast tekstu.
3. **Test referencji** (osobna decyzja, po palecie): 2–3 warianty ekranu startowego na żywo w wybranej palecie — np. jasna lawenda jako tło ekranu startowego, wielki grotesk w nagłówku (Inter Tight już jest), karta na dole w bieli. Tylko to, co różni się od obecnego wyglądu; reszta bez zmian.
4. **Nazwa „zakamarki”** (osobna decyzja): K1 / K4 / K5 z `.drafts/makiety/typografia.html`, kolor nazwy w nowej palecie.

## Źródła kolorów (iCloud: `~/Library/Mobile Documents/com~apple~CloudDocs/`)
- Palety Procreate (zip z `Swatches.json`, RGB 0–1 albo HSB; czytać `unzip -p plik Swatches.json` + node): `Wes_Anderson.swatches`, `studio_ghibli.swatches`, `Amelie_color_palette.ase.swatches`, `Zakamarki.swatches`, `Zakamarki-wnetrze.swatches`, `Zakamarki_paleta.swatches`, `paleta myslnia.swatches`, `paleta myslnia 2.swatches`.
- Inne: `Palette (1).txt`, `Palette (2).txt`, `Palette (3).txt` (+ PNG), `palette-amelie-obsidian .txt` — format do sprawdzenia; `Palety Zakamarków.html` (wcześniejsze zestawienie: Wnętrze o zachodzie / filmowe / nocą, z kontrastami).
- Jej sygnały z handoffu 011: okładki w stronę złota `#E5C267`, przydymionego różu `#DDA9B8`, szarej oliwki `#66664C`, jakiegoś fioletu; pastele „mdłe”; ranking zestawów z Procreate: Z2 Ogród > Z3 (łagodniej) > Z1 > Z4 > Z5 (szczegóły w `.drafts/makiety/okladki.html`).
- Czytnik to osobna warstwa (tła pod astygmatyzm, kontrast 10–13:1) — w tym etapie zmieniamy paletę aplikacji, nie tła czytnika, chyba że sama poprosi. Przy `#FFFCF5` w czytniku tekst ok. `#3A3530`.

## Uwagi techniczne (z sesji 012)
- Panel przeglądarki: `localhost:8000` przestał się otwierać (stary serwer z IPv6 `*:8000`); działa **`http://[::1]:8000/`**. Service worker w panelu się nie rejestruje (ograniczenie panelu) — nie przeszkadza w makietach.
- Po zapisaniu makiety narzędziem Write panel otwiera ją jako `file://` (puste ramki): **zamknąć tę kartę i pokazać wersję z serwera** (O14). Sprawdzać, co widzi ona (`tabs_context`).
- Obserwacje do stosowania: O10 (jedna decyzja, 2–3 warianty), O11–O12 (palety: próbnik zamiast zestawów), O13 (decyzje przestrzenne od razu na makiecie), O15 (konkret zamiast kodu, poprawka = zamiana, nie dodatek).
- Przy każdej zmianie plików aplikacji podbić `CACHE` (teraz `zakamarki-v20`); push przechodzi przez hook z `check.mjs`.

## Prompt dla kolejnego agenta
```
Pracujemy nad Zakamarkami: osobistym czytnikiem angielskiej Wikipedii (PWA, czysty HTML/CSS/JS, bez frameworka, GitHub Pages). Repozytorium: ~/Projekty/zakamarki (push na main = wdrożenie; hook pre-push uruchamia tools/check.mjs).

Na start:
1. Wywołaj skill task-observer (dziennik: ~/Projekty/.task-observer/observation-log.md); obserwacje OPEN stosuj, zwłaszcza O10–O15.
2. Przeczytaj CLAUDE.md, docs/PLAN.md, docs/STYL.md i handoff docs/handoffs/2026-11-22-013-zakamarki-paleta-start.md (dla kontekstu palety: 011 i 010). Obejrzyj .drafts/inspiracje/11-ui-lawendowa-biblioteka.webp. git status, git log -5.

Zadanie: etap 8 (paleta i nazwa) — teraz, przed etapem 5.
1. Zbuduj próbnik .drafts/makiety/probnik.html (prawdziwa aplikacja w ramce, dane tylko w pamięci): krok A — jaśniejsze tło ekranu (jedno stuknięcie = podgląd na żywo); krok B — kafle/okładki: jej palety z iCloud jako rzędy próbek, zaznaczanie wielu kolorów, ramka aktualizuje się od razu. Bez nazw kolorów w interfejsie, bez gotowych zestawów od Ciebie. Zanim pokażesz: obejrzyj w pełnym i małym rozmiarze, zamknij karty file://, pokaż wersję z serwera (http://[::1]:8000/...).
2. Wdróż jej wybór (dzień + noc, w tym szew nocą Kakao/nagłówek), podbij CACHE, sprawdź 375 px Papier i Kakao, konsola.
3. Potem osobno: test stylu z referencji (jaśniej), potem krój nazwy „zakamarki”.

Zasady: po polsku, krótko, jedna decyzja naraz, 2–3 warianty (nie 5), opcje pokazuj próbką/kształtem/położeniem, bez zdań-pytań w interfejsie. Każdą odpowiedź kończ sekcją „Dalej”. Nigdy nie commituj jej danych. Na koniec handoff docs/handoffs/2026-11-2X-014-…md, aktualizacja PLAN/STYL, commit, push; pokaż obserwacje task-observer.
```
