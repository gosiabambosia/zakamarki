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

Kolejność od 2026-11-22: 1–4 ✅ → 8 ✅ (paleta, nazwa, logo) → **5 (5a → 5c → 5b)** → 6 → 7.


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
   - Po 3b (2026-11-22, `zakamarki-v15`): cudzysłów Kropla, tytuły na półkach jedną wielkością z miękkimi łącznikami, pastelowe okładki bez zdjęcia (szkło widoczne). **Skrypt kontrolny `tools/check.mjs`** (etap 1 testów) uruchamiany przed każdym pushem. Etap 2 testów (`core.js` + `node --test`) czeka na jej zgodę. Wieczorem (`zakamarki-v17`): więcej okładek ze zdjęciami (także zdjęcia z licencją nie-wolną, największe zdjęcie z hasła, pierwsze zdjęcie z treści przy czytaniu), tymczasowe barwy okładek Szkliwo i jedna jasna tafla. **Paleta odłożona na koniec** — wybierze sama.
4. **Trop i Węzły** — ✅ (2026-11-22, `zakamarki-v18`, baza **v4**, kopia v4). Szczegóły: handoff 012.
   - **Indeks odwrotny:** dla każdego przeczytanego hasła pamięć linków **z samej treści** (magazyn `links`): z czytnika po przekierowaniach albo z wikitekstu (po 10 haseł na zapytanie, bez szablonów, przypisów i sekcji „See also”/„References”). Navboxy odrzucone — zalewały Węzły hasłami z tabelek (Rococo, Biedermeier…).
   - **Trop** (koniec hasła, liczony przy zbliżaniu się do stopki): linki ostatniego kroku; +1 za każdy wcześniejszy krok, który tu linkuje, +1 za każdy wcześniejszy krok, do którego kandydat linkuje (`prop=links` + `pltitles`, 50 kandydatów na zapytanie), +0,5 za link z powrotem do ostatniego hasła. Pokazane 3.
   - **Węzły** (trzecie kółko w dolnym pasku, `#/wezly`): nieprzeczytane cele z ≥ **3 rodzin tropów** (hasło liczy się do rodziny, w której pojawiło się najwcześniej); kolejność: tropy, zakreślenia, liczba haseł; przekierowania wyrównane `resolveTitles()` (50 na zapytanie). Wagi stałe, bez ustawień (jej decyzja).
   - Do obserwacji: ogólniki (Turin, World War I) wchodzą, gdy linkuje do nich treść z kilku tropów — ewentualny filtr po rodzaju hasła z Wikidata w etapie 5.
5. **Statystyki i Atlas** — czas i słowa, głębokość, najdłuższe tropy, najgęstsze węzły, rozkład epok, miejsc i rodzajów haseł, niszowość w czasie, kalendarz aktywności, wzrost mapy.
   - ✅ **(a) Kolejność (2026-11-22, jej decyzja): 5a → 5c → 5b** — najpierw statystyki z własnego śladu (bez nowych zapytań), potem Wikidata, na końcu Atlas (regiony łatwiej nazwać z rodzajami haseł z 5c).
   - **(b) w toku (2026-11-22, sesja 016):** próbnik form na jej kopii (10 kafli, `.drafts/makiety/statystyki-probnik.html`) → jej prośba: najpierw **lista statystyk „co mierzą”** do zaznaczenia (42 pozycje w 7 grupach, ze źródłem danych i „od kiedy”; `.drafts/makiety/statystyki-lista.html`), wygląd wybieramy potem razem. Część pozycji wymaga **nowego zapisu** (wznowienia tropów, czas na Na później, sprawdzane słowa) albo nowych zapytań (5c Wikidata; kategorie, niszowość, długość w słowach, wiek hasła).
   - **Do ustalenia dalej** (jedna decyzja naraz, makiety na prawdziwych danych; gust → próbnik): (a) podział na 5a *Statystyki z własnego śladu* (bez nowych zapytań: czas i akapity z wizyt, tropy, półki, zakreślenia, kalendarz) i 5b *Atlas* (mapa podgrafu: układ siłowy + regiony) oraz 5c *Wikidata* (epoka, miejsce, rodzaj hasła — `pageprops` → `wbgetentities` po 50); (b) które 3–5 statystyk najpierw; (c) gdzie się pokazują (czwarte kółko w dolnym pasku); (d) Atlas: własny układ czy biblioteka z CDN (przypięta wersja); nazwy regionów — jej czy Claude'a.
   - Z etapu 4: forma „wiersze zbiegające się w liczbie” jako wzór dla najgęstszych węzłów; filtr ogólników w Węzłach (kraje, miasta, wojny) po rodzaju hasła z 5c.
6. **Przejścia, Osobliwości, Parametry.** Przed startem sprawdzić CORS Lift Wing (niżej).
7. **Myślnia** — szablon notatki do Obsidiana z przeczytanego hasła; ewentualnie synchronizacja między urządzeniami (np. prywatny GitHub Gist).
8. ✅ **Korekta wyglądu: paleta i nazwa** — zrobione 2026-11-22 przed etapem 5 (handoffy 013, 014). Szczegóły w `docs/STYL.md`.
   - ✅ **Paleta (`zakamarki-v21`)** wybrana sama w próbniku `.drafts/makiety/probnik.html`: tło `#fffcf5`, granatowy tusz `#05094d`, sześć barw okładek, szkło w barwie okładki, nowe zakreślacze; noc granatowa `#0f1230` (z 3 wariantów, `.drafts/makiety/noc.html`).
   - ✅ **Szew nocą** (zaległość C2) — nocą w czytniku nagłówek i pasek telefonu w kolorze kartki.
   - ✅ **Nazwa „zakamarki.”** w Corben Bold z pomidorową kropką (`zakamarki-v22`), wybrana sama w próbniku `.drafts/makiety/nazwa-probnik.html`, potwierdzona na telefonie; opcje zapasowe w `docs/STYL.md` (Typografia).
   - ✅ **Logo / ikona (`zakamarki-v23`)** wybrana sama w próbniku `.drafts/makiety/logo-probnik.html`: „zaka/marki” w Corben Bold, pomidor na kremie, granatowa miękka gwiazda; nazwa w nagłówku „zakamarki✦” z tą samą gwiazdą w pomidorze, odstęp −0,025 em, gwiazda na środku małych liter (v24–v26). Handoff 015.
   - ⏸ **Test stylu z referencji 11** (lawendowe tło, wielki tytuł ekranu, biała karta z licznikami) — odłożony: półki ze szkłem i wielkie liczby już są, a kolorowe tło przestawiłoby świeżo wybraną paletę. Wrócić tylko na jej prośbę.

## Do sprawdzenia przy budowie

- Czy API Lift Wing (modele tematu i jakości) przyjmuje zapytania z przeglądarki (CORS).
- Zachowanie pamięci przeglądarki na iPadzie (Safari czyści dane stron niezainstalowanych na ekranie początkowym).
