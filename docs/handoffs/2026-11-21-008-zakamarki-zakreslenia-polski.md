# Handoff: Zakamarki — etap 3b (zakreślenia i polski) + poprawki czytnika

**Data:** 2026-11-21
**Stan:** kod 3b gotowy i przetestowany lokalnie na żywym API (`zakamarki-v13`, baza IndexedDB **v3**, kopia **v3**). **Push czeka na jej potwierdzenie** po świeżej kopii zapasowej na telefonie (zmiana schematu bazy).
**Następna sesja zaczyna od:** wrażeń z v13 na telefonie (lista niżej), potem etap 4 (Trop i Węzły) — model Węzłów warto rozrysować skillem renderownia.

## Wrażenia z v12 (początek sesji)
- Półki, „Czytaj dalej” z zakładką, kropki przy linkach, karta pod przytrzymaniem linku: **OK**. Linijka „Linkują tu” **zostaje**.
- Mapa tropu: przy jej wzorcu czytania („gwiazda”: z hasła otwiera kolejne linki i wraca czytać pierwotne) chaotyczna, linie za ciężkie; arkusz czasem nie rozwijał się w całości; czytnik czasem szerszy niż ekran (też przy cytatach); lista tropów tylko 5 bez rozwinięcia; numeracja 0.1 dezorientuje.
- Luźne uwagi: (1) powrót z linku do hasła przerzucał na początek, (2) tekst i zdjęcia niewyjustowane, (3) strzałka powrotu za mała / niewyraźna.

## Zrobione
### Poprawki czytnika
- **Powrót do miejsca:** `meter.spotNow()` zapisuje pierwszy akapit przy górnej krawędzi (skrót FNV jak w pomiarze) + odstęp od paska + piksele na zapas jako `rec.spot` w magazynie `reads` (bez zmiany schematu; przetrwa ubicie PWA). `meter.restore()` przy „wstecz”, stuknięciu w trop, pigułce ←, historii. Link w treści otwiera od początku, **chyba że hasło czytane < 30 min temu** (np. link z powrotem do hasła-gwiazdy). `history.scrollRestoration = 'manual'`. Sprawdzone: ten sam akapit, ta sama pozycja co do piksela. Spot zapisywany dopiero 1,5 s po otwarciu (żeby wczytanie na górze nie skasowało miejsca).
- **Justowanie:** `p, li, dd, blockquote, figcaption` wyrównane do obu krawędzi z `hyphens: auto` (`lang` na `#article` i `#article-title` = język hasła). Duże zdjęcia (`figure img` ≥ 160 px, poza tabelami/infoboksem/galerią) na **całą szerokość kolumny**, źródło podmienione na największe z `srcset` (zwykle 500 px), `max-height: 75vh` + `object-fit: contain`.
- **Za szeroki czytnik:** elementy z wpisaną szerokością przycinane do kolumny (`max-width: 100% !important`), ramki cytatów i `floatright` bez pływania, `pre` z zawijaniem, długie wzory MathML (`math[display=block]`) z własnym przewijaniem w bok; `#view-reader { overflow-x: clip }` jako bezpiecznik. Przejrzane: Albert Einstein, Wittgenstein, Bauhaus, Moby-Dick, Pythagorean theorem — nic nie wystaje.
- **Strzałka powrotu:** SVG, kreska 2,8 (zamiast znaku „←”); `aria-label` „Wróć do: …”.
- **Arkusz mapy niepełny — przyczyna:** `.sheet { max-height: 58vh }` stało w CSS po `.map-sheet` i przy tej samej sile selektora wygrywało. Teraz `.sheet.map-sheet { 80dvh }` (i `.sheet.peek`).

### Decyzje z makiety `.drafts/runda-3b.html` (poza gitem)
- **Mapa tropu = M4 Drzewo:** `familyTree()` zbiera kroki całej rodziny tropów w kolejności czasu; pierwsze pojawienie się hasła wyznacza rodzica. Wiersze z wcięciem 20 px na poziom (maks. 6), cienkie przygaszone kreski „└”, znak stanu przed tytułem, bieżące na różowym tle, „przed tobą” przygaszone, skok = przerywana kreska + etykieta. Licznik: hasła · rozwidlenia · skoki. Bieżący wiersz przewijany do widoku.
- **Tropy na starcie = N2 + rodziny:** dzień po lewej (dziś / wczoraj / 18 lis) zamiast 0.1; **jeden wiersz na rodzinę tropu** (dodane ode mnie po teście — przy gwieździe każde wyjście było osobnym wierszem: 14 tropów → 5 rodzin), opis: hasła · odgałęzienia · skoki; nagłówek z okrągłą strzałką rozwija wszystkie (> 5). **Zapytać, czy rodziny zostają.**
- **Zakreślenie = K2** (marker od 30% do 92% wysokości liter, zaokrąglone końce; nie K4 ręczny).
- **Paleta zakreślaczy = P2 „Lampy”:** `--hl-1..5` = morska zieleń `#7ccfb9`, niebieski `#93b6f5`, morela `#f4a77f`, wrzos `#d59be0`, cytryna `#ece06a`; `--hl-a` 55% dzień / 40% ciemne tła. Powód: nie powtarza kolorów interfejsu.
- **Dolny pasek = C1** ze znakiem **Q1 cudzysłów**, przerysowanym z kółek + ogonków (jej uwaga: drobne końcówki w małym rozmiarze wyglądały jak błąd).
- **Pasek zaznaczenia = Z1** (na dole).
- **Frazy = tłumaczenie w pasku:** Google (`translate.googleapis.com … client=gtx`, nieoficjalny) → zapas MyMemory → link „Tłumacz Google ↗”. Wyjaśnione jej: żadna opcja nie zużywa limitu Claude; „nieoficjalny” = Google może zmienić/zablokować adres bez ostrzeżenia, wtedy działa zapas. Tłumaczenie tylko po stuknięciu.

### Etap 3b — kod
- **Baza v3:** magazyn `highlights` (keyPath `id`, indeksy `title`, `at`). Migracja sprawdzona na danych v2 w panelu (42 wizyty, 16 `reads` — nietknięte). `store.putHighlights()`, `store.deleteHighlight()`; tryb zapasowy: localStorage `highlights`.
- **Zakreślenie** `{id, title, trail, text, prefix, suffix, pos, links, color 1–5, at, edited?}`. Zakotwiczenie tekstem (`locate()`): `prefix+text+suffix` w `textContent`, zapas: sam `text` najbliżej `pos`; nieznalezione → `h.lost` (na ekranie Zakreślenia dopisek „fragmentu już nie ma w haśle”). `wrapSpan()` dzieli tylko węzły tekstowe, więc zakreślenie przechodzi przez linki/kursywę; pomiar akapitów nietknięty. `links` = hasła docelowe linków w zaznaczeniu po przekierowaniach (`linkMaps`).
- **Pasek zaznaczenia** (`#selbar`): `selectionchange` (220 ms) → pasek z 5 kolorami; jedno angielskie słowo → **Wikisłownik** (`lookup()`: jedno zapytanie `prop=revisions` o do 10 form: liczba mnoga, -ed, -ing, -ly; `parseWikt()` czyta sekcję `{{język angielski}}` → `{{znaczenia}}`, część mowy z `''…''`); fraza → „Tłumacz”. Sprawdzone: octopuses→octopus, changed→change, Strategies→strategy, hides→hide, gripping, cleavage. Stuknięcie w zakreślenie → ten sam pasek z wciśniętym kolorem i koszem. Dotknięcie paska trzyma go otwartym (telefon może zdjąć zaznaczenie); stuknięcie obok zamyka. Pływające przyciski chowają się, gdy pasek jest otwarty.
- **Chip PL** (`#lang`): `langlinks` w tym samym `action=parse`; polskie hasło w tym samym czytniku jako krok tropu; w polskim haśle chip wciśnięty i prowadzi z powrotem. Klucz `pl:Tytuł` w tropach, historii, `reads`, zakreśleniach; `api(params, lang)`, miniatury grupowane po języku, karta hasła i „Linkują tu” w języku hasła, polskie przestrzenie nazw (Plik:, Kategoria: …) w `NON_ARTICLE`. Tytuł hasła dzieli się (trzy przyciski obok).
- **Ekran Zakreślenia** (`#/zakreslenia`, `renderHighlights()`): wielka liczba, „w N hasłach · M tropach”, filtr: „wszystkie N” + 5 kółek z licznikami; karty grup po **rodzinach tropów** (dzień + trasa), cytat w markerze w kroju czytnika, „hasło · kiedy”; stuknięcie otwiera hasło przewinięte do zakreślenia z błyskiem obrysu (`state.pendingHighlight`). „Prowadzą do tego samego”: cele linków z zakreśleń w ≥ 2 różnych hasłach (sprawdzone: → Cephalopod ink z Octopus i Cephalopod).
- **Dolny pasek** (`#dock`): Biblioteka / Zakreślenia, tylko na starcie i w Zakreśleniach; `main` ma wtedy 110 px zapasu na dole.
- **Kopia v3:** `data.highlights`; import v1–v3, łączenie po id (nowsza zmiana wygrywa); podsumowanie liczy zakreślenia.
- `sw.js` → `zakamarki-v13`. Konsola bez błędów (sprawdzone po przeładowaniu: start, Zakreślenia, polskie hasło, kopia).

## Uwagi techniczne
- Panel przeglądarki: przy teście zaznaczeń tworzę `Range` + `getSelection().addRange()` — prawdziwe przytrzymanie palcem na Androidzie trzeba sprawdzić na telefonie (systemowe menu nad zaznaczeniem + nasz pasek na dole).
- W makiecie zmienna `top` koliduje z `window.top` — nie nazywać tak zmiennych globalnych.
- Lokalna baza w panelu ma testowe zakreślenia (Octopus, Cephalopod) — bez znaczenia dla telefonu.

## Do sprawdzenia na telefonie (v13)
1. Zaznaczenie palcem: czy pasek pojawia się pewnie, czy nie gryzie się z menu Androida, czy kolor zakreśla za pierwszym razem.
2. Słownik i „Tłumacz” na kilku słowach i frazach.
3. Powrót do miejsca przy „gwieździe” (link → wstecz, pigułka ←).
4. Justowanie i zdjęcia na szerokość — czy nie za dużo dziur między słowami na wąskim ekranie.
5. Mapa-drzewo i lista Tropy po rodzinach.
6. Chip PL.

## Kolejne kroki
1. Ona: świeża kopia na telefonie → potwierdzenie → push (v13).
2. Wrażenia z v13 → poprawki.
3. Etap 4: Trop i Węzły. Sygnały gotowe: stan czytania, rodziny tropów (`familyTree`), zakreślenia (`links` → wspólne cele). Do zaprojektowania z nią: wagi, uzasadnienie przy każdej rekomendacji, miejsce w dolnym pasku (trzecie kółko). Model relacji hasło–trop–zakreślenie–cel rozrysować skillem renderownia.
