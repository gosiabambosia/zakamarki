# Handoff: Zakamarki — drobne poprawki (v27–v29) i etap 5a: od próbnika form do listy statystyk

**Data:** 2026-11-22 (wieczór, po handoffie 015)
**Stan:** `zakamarki-v29` na `main`. Repo czyste po commicie handoffu. Użytkowniczka robi przerwę.
**Decyzja (b) zamknięta:** wybrała **25 z 42** statystyk (lista, wybór i kolejność budowy: `docs/STATYSTYKI.md`; opcje zostają, może coś dodać).
**Następny krok:** **razem wygląd** wybranych statystyk — po jednej (albo po grupie), na jej kopii, formy z próbnika jako punkt wyjścia; potem (c) czwarte kółko w pasku i wdrożenie.

## Co zrobione
1. **v27 — odstęp liter:** „hasła dziś” (`.hero-unit span`) i tytuł karty „Czytaj dalej” (`.next-t`) z −0,035/−0,03 na **−0,01 em**. Zmierzone pikselowo (każda litera na osobnym canvasie, najmniejsza szpara w rzędach pikseli): przy −0,035 kreska „ł” wchodziła w „a” o 0,018 em; szpara pojawia się od −0,015.
2. **v28:**
   - **Znak Węzłów: „część wspólna”** (dwa koła z obrysem 2, wypełnione przecięcie) — wybrany w `.drafts/makiety/wezly-znak.html` (obecny, gwiazda z logo, sieć, supeł, część wspólna, rozeta; 1. runda — zbieżność, skrzyżowanie, trzy koła, obręcz — odrzucona: „muszą być intuicyjne i spójne z estetyką”).
   - **Gwiazda w nazwie** na środku tuszu słowa: od linii pisma do góry „k” (0,921 em) — `translateY(-.031em)`; zmierzone w aplikacji 0,73 px nad linią pisma i 0,71 px pod górą „k”. Wcześniej schodziła 0,11 em pod linię.
   - **Tytuł „Czytaj dalej” przez `shy()`** — „Correspondence” nie mieściło się już przy −0,03 (166 px na 161 px kolumny przy 375 px) i łamało się bez łącznika („Correspondenc|e”); teraz „Corres-pondence”.
3. **v29 — pasek postępu czytania** (`#progress`) w kobalcie `--pop-cobalt` zamiast tęczowego gradientu ze starej palety (jej prośba).
4. **5a, próbnik form** `.drafts/makiety/statystyki-probnik.html` (poza gitem): 10 kafli liczonych z jej kopii (IndexedDB tej przeglądarki albo plik kopii, tylko w pamięci karty; nie zakłada pustej bazy). Formy: zegar czytania (sektor nocy, płatki, gwiazda z logo), dzień po dniu (klocki w barwach tropów), tropy jako nici (drzewo w pasach), jak długo zostajesz (kropka = wizyta, skala log), Na później (grzbiety na desce), hasła jak słoje, lejek głębokości, powroty (kropki), hasła-mosty (linie zbiegają się w liczbie), ostatnie zakreślenie (cytat w markerze, Literata). Wybór do 5, kolejność pigułkami, „kopiuj”, telefon z podglądem (szeroko) / pigułki przyklejone (wąsko). Pierwsza runda (12 kafli „liczba + słupki”) była za płaska.
5. **5a, lista statystyk** `.drafts/makiety/statystyki-lista.html` (jej prośba po próbniku): 42 pozycje w 7 grupach — Czas i rytm, Tropy, Hasła, Półki i zakreślenia, Mapa linków, Wikidata (5c), Wikipedia (nowe zapytania). Każda: nazwa, jedno zdanie „co mierzy”, źródło danych i od kiedy (pomarańczowe „nowy zapis” = trzeba zacząć zapisywać, wynik dopiero od wdrożenia). Kółka do zaznaczenia, licznik, linijka „kopiuj” w kolejności zaznaczania.

## Jej wybór (decyzja (b), 2026-11-22)
```
statystyki · czas, dni-tyg, kalendarz, długość, tropy, kształt, daleko, mosty, nowe, porzucone, akapity, zakreślenia, dokąd, słowa, później, węzły, brzeg, gęstość, wzrost, epoki, miejsca, rodzaje, ludzie, kategorie, niszowość
```
„Na razie to — ale zapamiętaj te opcje, bo może będę chciała coś dodać” → wszystkie 42 opcje z zaznaczeniem w `docs/STATYSTYKI.md` (wygenerowane z `statystyki-lista.html`, ten sam opis i źródło). Niewybrane (17): typowa wizyta, pora dnia, sesje, dzień po dniu, skoki, wracanie do tropów, głębokość czytania, długość a przeczytanie, powroty, droga do końca, najdłużej czytane, tempo, angielskie i polskie, jak długo czeka, ostatnie zakreślenie, wiek hasła, długość w słowach. **Uwaga:** w próbniku form najmocniejsze wglądy dały „pora dnia” (88% nocą) i „długość a przeczytanie” (47% vs 3%) — nie wybrała ich; nie przemycać, najwyżej raz przypomnieć przy wyglądzie.

Podział według budowy (szczegóły w `docs/STATYSTYKI.md`):
1. z danych, które już są: czas, akapity, dni-tyg, kalendarz, nowe, wzrost, długość, tropy, kształt, daleko, mosty, porzucone, zakreślenia, dokąd, później;
2. z pamięci linków: węzły, brzeg, gęstość;
3. nowy zapis (zacząć jak najwcześniej): słowa — sprawdzane słowa i frazy (Wikisłownik, tłumacz);
4. 5c Wikidata: epoki, miejsca, rodzaje, ludzie;
5. nowe zapytania do Wikipedii: kategorie, niszowość (wyświetlenia — w karcie hasła ich nie chciała, tu wybrała sama).

25 statystyk to dużo na jeden ekran → przy wyglądzie zaproponować układ ekranu (np. grupy jak na liście, rozwijane) — jedna decyzja naraz.

## Jej dane (kopia z 22.11, tylko do orientacji — nic nie zapisane)
131 otwarć w 7 dniach (16–22 lis), 53 różne hasła, akapity zmierzone w 20 hasłach, czas w 49 wizytach (pomiar od 18 lis 4:29), 32 rodziny tropów (44 tropy, 12 odgałęzień), 37 na później, 1 zakreślenie. Wyraźne wzory: **88% otwarć między 22:00 a 5:00** (szczyt 4:00), 27 z 32 tropów kończy się na 1–2 hasłach, czytanie „gwiazdą” (Anti-realism: 8 odgałęzień), krótkie hasła (≤ 27 akapitów) czytane średnio w 47%, dłuższe w 3%, typowa wizyta 17 s. Pole `first` w `reads` to nie czas (nie używać do „drogi do końca” — liczyć od pierwszej wizyty w `history`); `from` w historii ma tytuł tylko przy przejściu linkiem (92 ze 131 to `null`).

## Decyzje
- Znak Węzłów: część wspólna (v28). Gwiazda w nazwie: wyśrodkowana na literach (v28). Pasek postępu: kobalt (v29).
- 5a (b): najpierw lista „co mierzy”, wygląd potem razem — nie rundy form.

## Wnioski o współpracy
- „Precyzyjnie” = przy liczbie mianownik i od kiedy; wniosek z porównaniem, bez interpretacji (O28).
- Znaki: zaczynać od obrazów już coś znaczących (Venn, sieć), oglądać w 24 px w prawdziwym pasku (O27).
- Minimalne poprawki typografii też mierzyć i sprawdzić najdłuższe słowo w najwęższej kolumnie (O26).

## Uwagi techniczne
- **Serwer podglądu:** stary serwer na 8000 z poprzedniej sesji (sierota) sprawiał, że panel widział tylko cache service workera (każde nowe żądanie: „denied or failed”, `Failed to fetch`). Zabiła go sama (`lsof -ti tcp:8000 | xargs kill`), potem `preview_start {name: "zakamarki"}` — adres `http://[::1]:8000/` działa też z tego serwera (O25). Na start sesji sprawdź `fetch('/README.md', {cache:'no-store'})` w karcie.
- Dane panelu (`[::1]:8000`) to tylko 3 wizyty testowe; jej prawdziwy ślad jest na telefonie → do próbników wczytuje plik kopii. Między przeładowaniami próbnika kopię da się przenieść przez `window.name` (czyścić po użyciu); po przeładowaniu przez nią — wczytuje ponownie.
- Zrzuty panelu bywają nieaktualne po `scrollTo` z JS — przewijać akcją `scroll` albo czytać DOM.
- Zapas na zrzuty bez panelu: Chrome headless (`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --screenshot=… --window-size=…`).
- CACHE: `zakamarki-v29`.

## Prompt dla kolejnego agenta
```
Pracujemy nad Zakamarkami: osobistym czytnikiem angielskiej Wikipedii (PWA, czysty HTML/CSS/JS, bez frameworka, GitHub Pages). Repozytorium: ~/Projekty/zakamarki (push na main = wdrożenie; hook pre-push uruchamia tools/check.mjs).

Na start:
1. Wywołaj skill task-observer (dziennik: ~/Projekty/.task-observer/observation-log.md); obserwacje OPEN stosuj, zwłaszcza O10–O28.
2. Przeczytaj CLAUDE.md, docs/PLAN.md (pkt 5), docs/STYL.md (sekcja Statystyki) i handoff docs/handoffs/2026-11-22-016-zakamarki-statystyki-lista.md. git status, git log -5.
3. Podgląd: preview_start {name: "zakamarki"}; sprawdź w karcie fetch('/README.md', {cache:'no-store'}) — jeśli pada, a curl działa, stary serwer blokuje port (patrz handoff, uwagi techniczne).

Zadanie — etap 5a, ciąg dalszy:
1. Wybór statystyk jest zamknięty: docs/STATYSTYKI.md (25 z 42; opcje zostają — jeśli coś doda/zmieni, aktualizuj [x] w tym pliku). Najpierw wdroż sam „nowy zapis” dla `słowa` (sprawdzane słowa i frazy), żeby dane zaczęły się zbierać — przy nowym magazynie: DB_VERSION, krok migracji, BACKUP_VERSION, przypomnienie o kopii.
2. Wygląd razem, grupa po grupie (najpierw grupa 1 z docs/STATYSTYKI.md — dane już są): forma z próbnika .drafts/makiety/statystyki-probnik.html albo nowa, pokazana na jej kopii (wczytuje plik kopii z telefonu), przy każdej liczbie mianownik i „od kiedy”. 25 pozycji na jeden ekran to dużo — zacznij od decyzji o układzie ekranu (np. grupy jak na liście). Grupy 2–5 (linki, 5c, zapytania) w swoich krokach.
3. Decyzja (c): miejsce — czwarte kółko w dolnym pasku (znak kształtem, w 24 px obok Biblioteki, Kropli i „części wspólnej”).
4. Wdrożenie ekranu Statystyki (#/statystyki), CACHE +1, 375 px i konsola, commit, push.

Zasady: po polsku, krótko, jedna decyzja naraz, opcje próbką/kształtem/położeniem, bez zdań-pytań w interfejsie. Przed pokazaniem makiety: zamknij karty file://, pokaż z http://[::1]:8000/..., sprawdź wąski panel (~480 px, podgląd przyklejony u góry). Każdą odpowiedź kończ sekcją „Dalej”. Nigdy nie commituj jej danych ani plików kopii. Przy zmianie plików aplikacji podbij CACHE. Na koniec handoff docs/handoffs/…-017-…md, aktualizacja PLAN/STYL, commit, push; pokaż obserwacje task-observer.
```
