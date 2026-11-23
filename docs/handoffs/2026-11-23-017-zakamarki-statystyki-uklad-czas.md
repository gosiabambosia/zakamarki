# Handoff: Zakamarki — 5a: układ ekranu Statystyki i formy „Czasu i rytmu”

**Data:** 2026-11-23
**Stan:** `zakamarki-v29` na `main` (bez zmian w plikach aplikacji — tylko dokumenty). Użytkowniczka kończy sesję.
**Następny krok:** przerobić heatmapę czasu (mniej pustych kratek), potem kolejne pigułki grupy 1; przed wdrożeniem ekranu — zapis `słowa`.

## Co zrobione
1. **Układ ekranu** — makieta `.drafts/makiety/statystyki-uklad.html` (3 układy × „na wejściu / po stuknięciu”, liczby z jej kopii). **Wybrała 2: pigułki grup u góry, jedna grupa naraz.** Pigułki bez liczników („3/3” ją gubiło; to nie pomiar jej czytania), grupa bez danych = przerywany obrys. Grupa Wikidata = **„Tematyka”** (jej słowo).
2. **Wspólny moduł makiet** `.drafts/makiety/stat-dane.js`: wczytanie kopii (trzymana w `sessionStorage` karty, wspólna dla makiet), IndexedDB, liczby 25 statystyk (grupy 2–5 jako „jeszcze bez danych”), `synth()` = sztuczny ślad 10 tygodni (test skali), `addD()` = krok dnia przez kalendarz.
3. **Próbnik „Czas i rytm”** `.drafts/makiety/statystyki-czas.html` (rundy: `-r1` 9 form, `-r2` pola koloru, obecny = runda 3). Każdy kafel: co mierzy · od kiedy, mianownik, wniosek z porównaniem; telefon z pigułkami na dole.
4. **Błąd złapany na sztucznym śladzie:** dni liczone `± n × 24 h` po zmianie czasu (25 paź) nie trafiały w północ → puste tygodnie. W makietach naprawione (`addD`). **W aplikacji (ekran Statystyki) liczyć dni tylko przez `addD`/`sod`**, różnice dni przez `Math.round(Δ/DAY)`.

## Decyzje
- Układ: pigułki (wyżej). Kafel = pełne pole jednego koloru palety; liczby w formie zawsze w jednym rzędzie/miejscu; jednostki „hasła / minuty / dni”, nie „otwarcia”; ułamek → „10,8 hasła”.
- **czas czytania → heatmapa dni × godzin** — pomysł zostaje, **do przerobienia**: nie kratka na każdą godzinę każdego dnia (po kilku miesiącach ogromna, większość pusta — w dzień jest w pracy). Kierunki do pokazania: wiersz = tydzień albo dzień tygodnia (zsumowane), kolumny = pory/bloki godzin (np. 3-godzinne) zamiast 24; tylko godziny, w których kiedykolwiek czytała; okno „ostatnie N tygodni”.
- **dni tygodnia → rozeta** (pomidor, kremowe płatki-krople, najdłuższy musztardowy, gwiazda z logo, liczby w jednym kręgu). Liczy **różne hasła dziennie**, średnio na dzień danego typu, mianownik „z N poniedziałków”.
- Odłożone na później: kalendarz (nić miesięcy, kartka z kalendarza), słupki/paski dni, wycinanki, gwiazdy, kamyki. Odrzucone: bloby dziś/7 dni/razem, klocki dni, serie (niezrozumiałe), taśma wizyt, siatka tygodni, bloby z losowym kształtem.
- **Chce sama pokombinować z kolorami** (kafle, heatmapa) — zrobić próbnik kolorów (kafle-próbki z palety, podgląd na żywo).

## Nie zrobione z planu sesji
- Zapis `słowa` (nowy magazyn IndexedDB: `DB_VERSION` 5, krok migracji, `BACKUP_VERSION`, przypomnienie o kopii) — odłożony na jej prośbę („na razie układ i pierwsza grupa”). Zrobić przed wdrożeniem ekranu, żeby dane zaczęły się zbierać.
- Decyzja (c) — znak czwartego kółka w pasku; wdrożenie `#/statystyki`.

## Uwagi techniczne
- Makiety dołączające `style.css` aplikacji: klasy z prefiksem `mk-` (`.cols`, `.chev` kolidowały — O29).
- Kopię do sprawdzenia przez siebie wczytywałam do `sessionStorage` karty z pliku tymczasowego w `.drafts/` (od razu usuniętego). Jej dane nigdzie nie trafiły do repo.
- Zrzuty po przewinięciu: `scrollIntoView` + `wait 1` dają aktualny obraz; akcja `scroll` w wąskim panelu bywała pusta.
- Serwer podglądu: `preview_start {name: "zakamarki"}` działał od razu (fetch `/README.md` = 200).

## Prompt dla kolejnego agenta
```
Pracujemy nad Zakamarkami: osobistym czytnikiem angielskiej Wikipedii (PWA, czysty HTML/CSS/JS, bez frameworka, GitHub Pages). Repozytorium: ~/Projekty/zakamarki (push na main = wdrożenie; hook pre-push uruchamia tools/check.mjs).

Na start:
1. Wywołaj skill task-observer (dziennik: ~/Projekty/.task-observer/observation-log.md); obserwacje OPEN stosuj, zwłaszcza O13–O31.
2. Przeczytaj CLAUDE.md, docs/STYL.md (sekcja Statystyki), docs/STATYSTYKI.md i handoff docs/handoffs/2026-11-23-017-zakamarki-statystyki-uklad-czas.md. git status, git log -5.
3. Podgląd: preview_start {name: "zakamarki"}; fetch('/README.md', {cache:'no-store'}) w karcie musi dać 200. Makiety: http://[::1]:8000/.drafts/makiety/statystyki-czas.html (kopię wczytuje sama przyciskiem „wczytaj kopię”; „10 tygodni” = sztuczny ślad).

Zadanie — etap 5a, ciąg dalszy:
1. Heatmapa czasu czytania do przerobienia: mniej pustych kratek i skala na miesiące (nie 24 kolumny × każdy dzień). 2–3 kierunki w próbniku, na jej kopii i na 10 tygodniach.
2. Próbnik kolorów (chce sama kombinować): kafle-próbki z palety dla tła kafla i skali heatmapy, podgląd na żywo, linijka „kopiuj”.
3. Potem kolejne pigułki grupy 1: Tropy, Hasła, Półki i zakreślenia — po jednej pigułce, formy jak ustalone w STYL (pole koloru, liczby w jednym rzędzie, jednostki „hasła”).
4. Przed wdrożeniem ekranu: zapis `słowa` (DB_VERSION, migracja, BACKUP_VERSION, przypomnienie o kopii), znak czwartego kółka w pasku, #/statystyki, CACHE +1.

Zasady: po polsku, krótko, jedna decyzja naraz, opcje próbką/kształtem/położeniem. Przed pokazaniem makiety: karty tylko http://[::1]:8000/..., wąski panel (~480 px). Każdą odpowiedź kończ sekcją „Dalej”. Nigdy nie commituj jej danych ani plików kopii. Na koniec handoff 018, aktualizacja PLAN/STYL, commit, push; pokaż obserwacje task-observer.
```
