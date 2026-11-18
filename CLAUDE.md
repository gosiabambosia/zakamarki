# Zakamarki — kontekst dla Claude Code

Przeczytaj ten plik w całości przed pierwszą zmianą. Szczegóły koncepcji i plan etapów: `docs/PLAN.md`. Kierunek wizualny, UX i opis referencji właścicielki: `docs/STYL.md` — **czytaj przed każdą zmianą wyglądu**. Stan prac i ostatnie decyzje: najnowszy plik w `docs/handoffs/`.

## Czym jest projekt

Osobisty czytnik angielskiej Wikipedii z zapisem tropów (ścieżek czytania) i rekomendacjami do dalszego czytania. Rekomendacje opierają się wyłącznie na **mierzalnych właściwościach artykułów i sieci linków, liczonych względem śladu właścicielki**, i każda pokazuje swoje uzasadnienie (liczby + ścieżkę). Świadomy antywzorzec: rekomendatory typu Netflix (filtrowanie kolaboratywne, gatunki, „nastroje”, brak wyjaśnienia).

Właścicielka czyta głównie na telefonie z Androidem (zainstalowana PWA), czasem na iPadzie i Macu. Czyta długo i w głąb jednego wątku, z częstymi skojarzeniowymi przeskokami między tematami. Lubi oglądać statystyki.

## Jak z nią pracować

- Rozmowa **po polsku**: rzeczowo, gęsto, po koleżeńsku. Bez pochwał na wyrost i bez wypełniaczy.
- **Ona podejmuje decyzje, Ty piszesz kod.** W każdym etapie: (1) wyjaśnij krótko jedno pojęcie techniczne, które ten etap wprowadza; (2) przedstaw decyzje do podjęcia (wygląd, nazwy, wagi w algorytmach, wybór statystyk) jako konkretne opcje z rekomendacją; (3) opcjonalnie zaproponuj małe zadanie do samodzielnego wykonania. Etap ma zająć jej 30–60 minut i kończyć się czymś działającym na telefonie.
- **Każdą odpowiedź kończ rekomendacją, co najsensowniej zrobić dalej** — także gdy nie jest jasne, czy to już kolejny etap.
- Prowadź z kierunkiem. Lepiej zaproponować i zrobić niż pytać o każdy szczegół; pytaj o rzeczy, które realnie zmieniają wynik.
- **Przetwarza w dużej części pozawerbalnie**: opcje i stany pokazuj próbką, kształtem, położeniem, a nie słowną nazwą (szczegóły w `docs/STYL.md`).
- **Nazwy funkcji opisują operację.** Bez nazw z „osobowością” czy żartem (odrzucone: „wessało”, „dzika karta”). Nazwa aplikacji: Zakamarki.
- Estetyka aplikacji: paleta **Krem** — kremowa baza (`#f1e7dc`), atramentowe pigułki, zabawne nasycone akcenty (róż, musztarda, limonka, kobalt, pomarańcz); nocą ciepły atrament. Kolor wnoszą też **miniatury haseł** (zdjęcia główne z Wikipedii). Typografia: **Inter Tight** w całym interfejsie (duże, ciasne nagłówki jako „bohater” ekranu), nazwa aplikacji w **Fraunces Black Soft**. Inspiracje: redakcyjne aplikacje do czytania (numerowane listy 0.1, 0.2, półki ze szklanym pasem, wielkie liczby), bloby i kafelki-wybory; wcześniejszy moodboard: szkliwo, glina, haft, kredki, kosmos. **Nie** beż-minimalizm. Ikona: **bąbelkowe różowe „Z” z buźką na atramencie** (`icons/icon.svg` = źródło; PNG renderowane na Macu przez `qlmanage -t -s ROZMIAR -o KATALOG plik.svg`) — płaska, pełne tło bez faktury, wszystko w środkowym kole (80% średnicy), wersja maskable dodatkowo pomniejszona do 82%. **Czytnik jest wyjątkiem:** jego tła wybiera się pod oczy (ma astygmatyzm) — ciepła biel jak w interfejsie Claude, kontrast 10–13:1, bez czystej bieli i czerni; ciemne tła tylko szarobrązowe z tekstem w kolorze kości słoniowej. Paleta aplikacji i tło czytnika to **dwie niezależne warstwy**.
- Na koniec każdej sesji dopisz handoff do `docs/handoffs/RRRR-MM-DD-NNN-slug.md`: co zrobione, decyzje, stan, następne kroki. Ma pozwolić następnej sesji ruszyć bez dopytywania.

## Architektura (etapy 1–3)

Czysty HTML/CSS/JS. **Bez frameworka, bez kroku budowania, bez zależności npm** w aplikacji. Biblioteki, jeśli kiedyś potrzebne (np. do grafu), ładowane z CDN z przypiętą wersją.

| Plik | Rola |
|---|---|
| `index.html` | szkielet: nagłówek z wyszukiwarką, widoki `home`, `results`, `reader` |
| `style.css` | wygląd; wszystkie kolory, kroje i wymiary jako zmienne. Dwie warstwy: paleta aplikacji Krem (`--bg`, `--fg`, `--pop-*`; dzień/noc przez `html[data-scheme]`) i tło czytnika (`--page`, `--text`, `--page-*`; `html[data-page]`: papier, len, szalwia, lawenda, grafit, kakao). Ciemne tło czytnika przełącza paletę na nocną. |
| `app.js` | logika: pamięć (IndexedDB + cache), API, czyszczenie treści, routing, tropy (archiwum, odgałęzienia, skoki), wizyty, pomiar akapitów (`meter`), półki Czytam / Na później / Przeczytane, linki według stanu (L2), mapa tropu, karta hasła pod przytrzymaniem linku, panel „Aa” (presety-kafle, próbki bez podpisów; ustawienia → zmienne CSS na `<html>`), przypisy jako dymki, zwijany infobox, pływający powrót (P2), ekran startowy (liczba dnia, „Czytaj dalej”, półki z miniaturami `prop=pageimages`, Tropy 0.1… z kreską kropek), kopia zapasowa |
| `manifest.webmanifest`, `sw.js`, `icons/` | instalacja jako PWA i cache plików aplikacji (sw: najpierw sieć, pamięć tylko offline; ikony: `icon.svg` + PNG 192/512, `icon-maskable-512.png`, `apple-touch-icon.png` 180) |

- **API:** Action API `https://en.wikipedia.org/w/api.php` z `origin=*` i `formatversion=2` (zapytania anonimowe z przeglądarki, CORS). Podpowiedzi: `generator=prefixsearch` + `prop=description`. Wyszukiwanie: `generator=search`. Artykuł: `action=parse&prop=text|displaytitle&redirects=1&disableeditsection=1&disabletoc=1`. Starsze endpointy REST są częściowo wygaszane — trzymaj się Action API.
- **Routing:** hash `#/wiki/Tytuł`; przycisk „wstecz” działa natywnie.
- **`cleanArticle()`:** DOMParser; usuwa navboxy, ambox, przyciski edycji, `style`/`script`; zdejmuje inline `background`/`color` (psują ciemny motyw); linki `/wiki/` → trasa wewnętrzna z `data-title` (przestrzenie nie-hasłowe jak File:, Category: → zewnętrznie); `a.new` → `span.redlink`; linki `#…` → `data-anchor` z przewijaniem bez zmiany trasy.
- **Tropy:** `state.trails` = lista `{id, steps: [{t, j?}], pos, start, end, branchOf?}`; bieżący trop jest ostatni. `applyStep()`: link z bieżącego kroku dokleja krok (`state.pendingFrom`); powrót („wstecz”, stuknięcie w trop/historię) tylko przesuwa `pos`; nowy link z wcześniejszego kroku tworzy odgałęzienie (nowy trop ze wspólnym początkiem, `branchOf`); wyszukanie z czytnika to skok w tym samym tropie (`j: 1`, `state.searchFrom`); karta „Czytaj dalej” i lista Tropy wznawiają trop (`data-resume` → `state.pendingResume`); wyszukanie ze startu = nowy trop. Przy pierwszym uruchomieniu bez `trails` archiwum odtwarza się z historii (`loadTrails()`).
- **Dane użytkowniczki:** wyłącznie w przeglądarce, w **IndexedDB** (baza `zakamarki` **v2**, migracje w `onupgradeneeded` po `oldVersion`: magazyn `kv` — `trails`, `saved` (półka Na później), `reader`, `presets`, `thumbs`, `backupAt`, `migratedAt`; magazyn `history` — każda **wizyta** {title, at, from, j?, end?, ms?, p?} jako osobny wpis, autoIncrement, indeks `at`, bez limitu; ponowne otwarcie ostatniego hasła < 30 min uzupełnia tę samą wizytę; magazyn `reads` (keyPath `title`) — {title, n, read, seen:[skróty akapitów], first, firstHash, state: open|seen|done, seenAt?, doneAt?, visits, ms, at}). Przy starcie wszystko ładuje się do `store.cache` (`store.ready`), zapisy idą w tle; `store.addHistory()` dopisuje jeden wpis. Pierwsze uruchomienie migruje localStorage (`zakamarki:*`) w jednej transakcji; localStorage zostaje jako kopia. `reader` zapisywany też w localStorage (skrypt w `<head>`). Bez IndexedDB — tryb zapasowy na localStorage (historia maks. 2000). Kopia zapasowa: plik JSON `{app:'zakamarki', version:2, exportedAt, data:{history, trails, saved, reader, presets, reads}}`; import przyjmuje v1 i v2 i łączy (historia po tytuł+czas, tropy po id, suma Na później i presetów, stan czytania hasło po haśle). **Przy każdej zmianie schematu bazy: podbij `DB_VERSION`, dodaj krok w `onupgradeneeded`, podbij `BACKUP_VERSION`, przypomnij jej o świeżej kopii przed pushem.** **Nigdy nie commituj danych użytkowniczki do repozytorium — jest publiczne.**

## Zasady techniczne

- Ścieżki **względne** (`./`, `icons/…`) — aplikacja działa pod podścieżką `https://NAZWA.github.io/zakamarki/`.
- Przy każdej zmianie plików aplikacji **podbij wersję `CACHE` w `sw.js`** (`zakamarki-v2`, `v3`…), inaczej telefon pokaże starą wersję.
- Interfejs po polsku; treść artykułów po angielsku. Język Wikipedii trzymaj jako jedną stałą, żeby dodanie polskiej było trywialne.
- Szanuj API Wikimedia: cache'uj odpowiedzi, nie crawluj masowo, łącz zapytania (np. do 50 tytułów naraz w `prop=…`).
- Licencja treści: stopka czytnika z atrybucją Wikipedii (CC BY-SA 4.0) i linkiem do oryginału — zostaw.
- Testuj na żywym API lokalnie (`python3 -m http.server` w katalogu repo, potem `http://localhost:8000`), także w widoku mobilnym (~400 px szerokości). Przed wysłaniem zmian sprawdź brak błędów w konsoli.
- Wdrożenie: push na `main` → GitHub Pages publikuje automatycznie w 1–2 minuty.
