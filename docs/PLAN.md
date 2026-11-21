# Zakamarki — koncepcja i plan

## Model: mapa zamiast listy

Czytanie to rosnący podgraf Wikipedii z trzema strefami: **przeczytane**, **krawędź** (nieprzeczytane hasła, do których prowadzą linki z przeczytanych) i **reszta**. Każda rekomendacja to operacja na tej mapie i pokazuje swoje uzasadnienie, np. „4 z przeczytanych linkuje tutaj · 31 wersji językowych · 212 przypisów · ~900 wyświetleń/mies.”.

## Tryby rekomendacji

- **Trop** — dalej bieżącą ścieżką: sąsiedzi ostatniego hasła ważeni liczbą linków wspólnych z całą ścieżką (nie tylko z ostatnim krokiem), żeby wątek się nie rozmywał.
- **Węzły** — nieprzeczytane hasła, do których prowadzą przeczytane artykuły z kilku *różnych* tropów. Ranking: liczba niezależnych tropów, które się tam zbiegają.
- **Przejścia** — hasła blisko w sieci linków (≤ 2 kroki), ale daleko tematycznie. Temat: model Wikimedia „language-agnostic link-based article topic” (Lift Wing) albo, jeśli niedostępny z przeglądarki, kategorie i Wikidata.
- **Osobliwości** — losowanie z list prowadzonych przez wikipedystów (Wikipedia:Unusual articles, Featured/Good articles, archiwum „Did you know…”), przefiltrowanych przez niszowość i Parametry.
- **Parametry** — suwaki i filtry zamiast kategorii: niszowość, długość, heterogeniczność, epoka, miejsce, rodzaj hasła.

## Sygnały

- **Z artykułu:** długość, liczba przypisów, liczba wersji językowych (langlinks), wyświetlenia (API pageviews), jakość (status GA/FA albo model jakości Wikimedia), liczba edytorów, rozmiar strony dyskusji, data powstania.
- **Pochodne:** *ukryty klejnot* = jakość ÷ popularność; *heterogeniczność* = odsetek linków wychodzących do innych tematów niż temat hasła; *rozgałęzialność* = liczba linków do obszernych haseł.
- **Z Wikidata (jako filtry):** epoka, miejsce, rodzaj hasła (osoba, ruch, dzieło, obiekt, miejsce, zdarzenie, organizacja).
- **Clickstream (późna faza, opcjonalnie):** comiesięczne zrzuty rzeczywistych przejść między hasłami; wielogigabajtowe, przetwarzane raz offline.
- **Jej ślad:** stany czytania mierzone automatycznie (akapity na ekranie): *otwarte / przejrzane / doczytane*; ręcznie tylko *Na później* i zakreślenia (od 3b: 5 kolorów, linki w zaznaczeniu jako hasła docelowe). Wizyty z czasem aktywnego czytania i liczbą nowo przeczytanych akapitów (pod statystyki). Tropy z odgałęzieniami i skokami z wyszukiwarki (archiwum tropów od 2026-11-18).

## Atlas (inspiracja: Film Atlas z Toolboxd)

Mapa jej podgrafu (przeczytane + krawędź), rozłożona według sieci linków, z regionami wykrytymi algorytmem detekcji społeczności. Nazwy regionów nadaje ona albo Claude.

## Etapy

1. **Szkielet i hosting** — ✅ wyszukiwarka, czytnik, zapis tropu i historii, przypinanie, PWA.
2. **Czytnik i typografia** — ✅ panel ustawień: tło, krój, kolor i wielkość czcionki, interlinia, szerokość kolumny, zapisywane presety; 2–3 kierunki wizualne do wyboru; przypisy jako dymki; zwijany infobox.
3. **Ślad** — ✅ (2026-11-18, `zakamarki-v12`).
   1. ✅ Eksport i import kopii zapasowej (JSON; import łączy, nic nie usuwa; wersja pliku 2 z `reads`, import przyjmuje v1).
   2. ✅ IndexedDB (v1: `kv`, `history`; v2: `reads`).
   3. ✅ Pomiar głębokości czytania — akapity na ekranie ≥ 2 s przy aktywnej karcie (bez przypisów, „See also”, „References”, tabel, infoboksu). *Przejrzane* ≥ 15%, *doczytane* ≥ 75%. Uzasadnienie „22/41” na okładkach i „24 z 62 akapitów” w „Czytaj dalej”; miejsce powrotu = pierwszy nieprzeczytany akapit (pojedyncze dziury pomijane) z różową zakładką. Historia liczy **wizyty** (przeładowanie nie dubluje wpisu).
   4. ✅ Linki według stanu (L2: pusty / pełny krążek, przekierowania przez `generator=links`), mapa tropu jak linia metra (arkusz z czytnika) i kreska tropu w karcie Tropy.
   5. ✅ Karta hasła pod przytrzymaniem linku: mała, bez przyciemniania — opis, dwa zdania wstępu, słowa i czas czytania, stan, „Linkują tu” z przeczytanych, Otwórz / Na później.
   - Ekran startowy: **trzy półki z nazwami** — *Czytam* (okładki napełnione szkłem do poziomu akapitów, na desce), *Na później* (ręcznie; musztardowa tafla plexi), *Przeczytane* (liliowa tafla); stuknięcie rozwija siatkę. Hasło z Na później przechodzi dalej, gdy zaczniesz czytać. Tylko otwarte nie trafiają na półki.
3b. **Zakreślenia i polski** — ✅ (2026-11-21, `zakamarki-v13`, baza v3, kopia v3). Szczegóły: handoff 008.
   - Zakreślenia w magazynie `highlights` (zakotwiczenie tekstem: fragment + 32 znaki przed i po), pasek zaznaczenia na dole (Z1), marker K2 w palecie **Lampy** (morska zieleń, niebieski, morela, wrzos, cytryna), stuknięcie w zakreślenie = zmiana koloru / usunięcie.
   - Jedno angielskie słowo → polskie znaczenia z **pl.wiktionary** (formy odmienione sprowadzane do hasła); fraza → przycisk **Tłumacz** (Google, zapas MyMemory; po wyczerpaniu obu link do Tłumacza Google).
   - **Chip PL** (langlinks w zapytaniu `parse`): polskie hasła w tym samym czytniku, klucz `pl:Tytuł`, trasa `#/pl/wiki/…`.
   - Ekran **Zakreślenia** w dolnym pasku (C1, znak: cudzysłów): wielka liczba, filtr kolorem, grupy po tropach (rodzinach), „Prowadzą do tego samego” (cel linków z zakreśleń w ≥ 2 hasłach — kandydaci na Węzły).
   - Przy okazji: powrót do miejsca w haśle, wyjustowany tekst i zdjęcia na szerokość kolumny, mapa tropu jako drzewo (M4), lista Tropy po rodzinach z dniem zamiast 0.1 (N2).
4. **Trop i Węzły** — następny. Z widocznym uzasadnieniem i wagami ustawianymi przez nią; sygnały: przeczytane, zakreślenia (wspólne cele linków), rodziny tropów.
5. **Statystyki i Atlas** — czas i słowa, głębokość, najdłuższe tropy, najgęstsze węzły, rozkład epok, miejsc i rodzajów haseł, niszowość w czasie, kalendarz aktywności, wzrost mapy.
6. **Przejścia, Osobliwości, Parametry.**
7. **Myślnia** — szablon notatki do Obsidiana z przeczytanego hasła; ewentualnie synchronizacja między urządzeniami (np. prywatny GitHub Gist).

## Do sprawdzenia przy budowie

- Czy API Lift Wing (modele tematu i jakości) przyjmuje zapytania z przeglądarki (CORS).
- Zachowanie pamięci przeglądarki na iPadzie (Safari czyści dane stron niezainstalowanych na ekranie początkowym).
