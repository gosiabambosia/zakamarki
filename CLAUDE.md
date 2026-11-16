# Zakamarki — kontekst dla Claude Code

Przeczytaj ten plik w całości przed pierwszą zmianą. Szczegóły koncepcji i plan etapów: `docs/PLAN.md`. Stan prac i ostatnie decyzje: najnowszy plik w `docs/handoffs/`.

## Czym jest projekt

Osobisty czytnik angielskiej Wikipedii z zapisem tropów (ścieżek czytania) i rekomendacjami do dalszego czytania. Rekomendacje opierają się wyłącznie na **mierzalnych właściwościach artykułów i sieci linków, liczonych względem śladu właścicielki**, i każda pokazuje swoje uzasadnienie (liczby + ścieżkę). Świadomy antywzorzec: rekomendatory typu Netflix (filtrowanie kolaboratywne, gatunki, „nastroje”, brak wyjaśnienia).

Właścicielka czyta głównie na telefonie z Androidem (zainstalowana PWA), czasem na iPadzie i Macu. Czyta długo i w głąb jednego wątku, z częstymi skojarzeniowymi przeskokami między tematami. Lubi oglądać statystyki.

## Jak z nią pracować

- Rozmowa **po polsku**: rzeczowo, gęsto, po koleżeńsku. Bez pochwał na wyrost i bez wypełniaczy.
- **Ona podejmuje decyzje, Ty piszesz kod.** W każdym etapie: (1) wyjaśnij krótko jedno pojęcie techniczne, które ten etap wprowadza; (2) przedstaw decyzje do podjęcia (wygląd, nazwy, wagi w algorytmach, wybór statystyk) jako konkretne opcje z rekomendacją; (3) opcjonalnie zaproponuj małe zadanie do samodzielnego wykonania. Etap ma zająć jej 30–60 minut i kończyć się czymś działającym na telefonie.
- **Każdą odpowiedź kończ rekomendacją, co najsensowniej zrobić dalej** — także gdy nie jest jasne, czy to już kolejny etap.
- Prowadź z kierunkiem. Lepiej zaproponować i zrobić niż pytać o każdy szczegół; pytaj o rzeczy, które realnie zmieniają wynik.
- **Nazwy funkcji opisują operację.** Bez nazw z „osobowością” czy żartem (odrzucone: „wessało”, „dzika karta”). Nazwa aplikacji: Zakamarki.
- Estetyka aplikacji: paleta **Szkliwo** (szklane lampy-grzybki: róż, pomarańcz, morska zieleń, musztarda, kobalt, śliwka, czerwień na różowawej bieli; nocą śliwkowy atrament). Moodboard: nasycone, ciepłe, retro, ilustracyjne (szkliwo, glina, oliwkowy welur, haft z koralików, kredki). **Nie** beż i minimalizm w interfejsie. **Czytnik jest wyjątkiem:** jego tła wybiera się pod oczy (ma astygmatyzm) — ciepła biel jak w interfejsie Claude, kontrast 10–13:1, bez czystej bieli i czerni; ciemne tła tylko szarobrązowe z tekstem w kolorze kości słoniowej. Paleta aplikacji i tło czytnika to **dwie niezależne warstwy**.
- Na koniec każdej sesji dopisz handoff do `docs/handoffs/RRRR-MM-DD-NNN-slug.md`: co zrobione, decyzje, stan, następne kroki. Ma pozwolić następnej sesji ruszyć bez dopytywania.

## Architektura (etapy 1–2)

Czysty HTML/CSS/JS. **Bez frameworka, bez kroku budowania, bez zależności npm** w aplikacji. Biblioteki, jeśli kiedyś potrzebne (np. do grafu), ładowane z CDN z przypiętą wersją.

| Plik | Rola |
|---|---|
| `index.html` | szkielet: nagłówek z wyszukiwarką, widoki `home`, `results`, `reader` |
| `style.css` | wygląd; wszystkie kolory, kroje i wymiary jako zmienne. Dwie warstwy: paleta aplikacji Szkliwo (`--bg`, `--fg`, `--glaze-*`; dzień/noc przez `html[data-scheme]`) i tło czytnika (`--page`, `--text`, `--page-*`; `html[data-page]`: papier, len, szalwia, lawenda, grafit, kakao). Ciemne tło czytnika przełącza paletę na nocną. |
| `app.js` | logika: API, czyszczenie treści, routing, trop, historia, przypięte, panel „Aa” (ustawienia → zmienne CSS na `<html>`, presety), przypisy jako dymki, zwijany infobox |
| `manifest.webmanifest`, `sw.js`, `icons/` | instalacja jako PWA i cache plików aplikacji |

- **API:** Action API `https://en.wikipedia.org/w/api.php` z `origin=*` i `formatversion=2` (zapytania anonimowe z przeglądarki, CORS). Podpowiedzi: `generator=prefixsearch` + `prop=description`. Wyszukiwanie: `generator=search`. Artykuł: `action=parse&prop=text|displaytitle&redirects=1&disableeditsection=1&disabletoc=1`. Starsze endpointy REST są częściowo wygaszane — trzymaj się Action API.
- **Routing:** hash `#/wiki/Tytuł`; przycisk „wstecz” działa natywnie.
- **`cleanArticle()`:** DOMParser; usuwa navboxy, ambox, przyciski edycji, `style`/`script`; zdejmuje inline `background`/`color` (psują ciemny motyw); linki `/wiki/` → trasa wewnętrzna z `data-title` (przestrzenie nie-hasłowe jak File:, Category: → zewnętrznie); `a.new` → `span.redlink`; linki `#…` → `data-anchor` z przewijaniem bez zmiany trasy.
- **Trop:** `state.pendingFrom` ustawiane przy kliknięciu linku w artykule; `updateTrail()` dokleja krok, skraca przy powrocie albo zaczyna nowy trop (wejście z wyszukiwarki lub listy).
- **Dane użytkowniczki:** wyłącznie w przeglądarce (localStorage, prefiks `zakamarki:`; klucze `trail`, `history` = {title, at, from} maks. 2000, `saved`, `reader`, `presets`). W etapie 3 migracja do IndexedDB. **Nigdy nie commituj danych użytkowniczki do repozytorium — jest publiczne.**

## Zasady techniczne

- Ścieżki **względne** (`./`, `icons/…`) — aplikacja działa pod podścieżką `https://NAZWA.github.io/zakamarki/`.
- Przy każdej zmianie plików aplikacji **podbij wersję `CACHE` w `sw.js`** (`zakamarki-v2`, `v3`…), inaczej telefon pokaże starą wersję.
- Interfejs po polsku; treść artykułów po angielsku. Język Wikipedii trzymaj jako jedną stałą, żeby dodanie polskiej było trywialne.
- Szanuj API Wikimedia: cache'uj odpowiedzi, nie crawluj masowo, łącz zapytania (np. do 50 tytułów naraz w `prop=…`).
- Licencja treści: stopka czytnika z atrybucją Wikipedii (CC BY-SA 4.0) i linkiem do oryginału — zostaw.
- Testuj na żywym API lokalnie (`python3 -m http.server` w katalogu repo, potem `http://localhost:8000`), także w widoku mobilnym (~400 px szerokości). Przed wysłaniem zmian sprawdź brak błędów w konsoli.
- Wdrożenie: push na `main` → GitHub Pages publikuje automatycznie w 1–2 minuty.
