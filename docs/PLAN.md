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
- **Jej ślad:** stany czytania mierzone automatycznie (przewinięcie + czas): *otwarte / przejrzane / doczytane*; ręcznie tylko *Przypnij*.

## Atlas (inspiracja: Film Atlas z Toolboxd)

Mapa jej podgrafu (przeczytane + krawędź), rozłożona według sieci linków, z regionami wykrytymi algorytmem detekcji społeczności. Nazwy regionów nadaje ona albo Claude.

## Etapy

1. **Szkielet i hosting** — ✅ wyszukiwarka, czytnik, zapis tropu i historii, przypinanie, PWA.
2. **Czytnik i typografia** — ✅ panel ustawień: tło, krój, kolor i wielkość czcionki, interlinia, szerokość kolumny, zapisywane presety; 2–3 kierunki wizualne do wyboru; przypisy jako dymki; zwijany infobox.
3. **Ślad** — IndexedDB; pomiar głębokości czytania; minimapa tropu; kolory linków według stanu (przeczytane / nieprzeczytane / węzeł); karta hasła pod przytrzymaniem linku (metryki + które przeczytane tu prowadzą); eksport i import kopii zapasowej.
4. **Trop i Węzły** — z widocznym uzasadnieniem i wagami ustawianymi przez nią.
5. **Statystyki i Atlas** — czas i słowa, głębokość, najdłuższe tropy, najgęstsze węzły, rozkład epok, miejsc i rodzajów haseł, niszowość w czasie, kalendarz aktywności, wzrost mapy.
6. **Przejścia, Osobliwości, Parametry.**
7. **Myślnia** — szablon notatki do Obsidiana z przeczytanego hasła; ewentualnie synchronizacja między urządzeniami (np. prywatny GitHub Gist).

## Do sprawdzenia przy budowie

- Czy API Lift Wing (modele tematu i jakości) przyjmuje zapytania z przeglądarki (CORS).
- Zachowanie pamięci przeglądarki na iPadzie (Safari czyści dane stron niezainstalowanych na ekranie początkowym).
