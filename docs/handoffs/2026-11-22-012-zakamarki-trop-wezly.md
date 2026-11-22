# Handoff: Zakamarki — etap 4: Trop i Węzły

**Data:** 2026-11-22
**Stan:** etap 4 wysłany (`zakamarki-v18`, baza IndexedDB **v4**, kopia **v4**; kopia na telefonie zrobiona przed pushem), potem nagłówek hasła T1 (`zakamarki-v19`). `node tools/check.mjs` — OK.
**Następna sesja zaczyna od:** wrażeń z v18–v19 na telefonie (lista niżej), potem C2 (szew nocą) albo etap 5.

## Wrażenia z v15–v17 (początek sesji)
Okładki ze zdjęciami — dobrze. Szkliwo i jasna tafla — zostają do zmiany palety na końcu; **podobają się jednolite, półprzezroczyste tafle**. Kropla — czysta. Tytuły na półkach — dobrze. Nic do poprawy.

## Zrobione
### Silnik (app.js)
- **Pojęcie etapu: indeks odwrotny** — z „hasło → dokąd linkuje” robimy „cel → kto tu linkuje” i liczymy, z ilu rodzin tropów przyszły linki.
- **Baza v4:** magazyn `links` (keyPath `title`) `{title, out, src, at}` — pamięć podręczna, odtwarzalna, **poza kopią**; `store.allLinks()`, `store.putLinks()`; ładowany leniwie (`links.load()`), nie przy starcie. `BACKUP_VERSION` 4 (dane jak w v3; check.mjs wymaga podbicia). Migracja v3→v4 sprawdzona na danych z panelu (57 wizyt, 21 haseł, 2 zakreślenia — nietknięte).
- **Tylko linki z treści.** Pierwsza wersja brała `generator=links` (wszystkie linki strony) — navboxy zalewały Węzły (Rococo, Biedermeier, Adam style z tabelki „Architectural styles”). Teraz:
  - `recordBodyLinks()` — po otwarciu hasła: linki z akapitów, które liczy pomiar (`measureUnits`), po przekierowaniach (`src: 'body'`); obietnica w `links.pending`, żeby Trop na nią poczekał;
  - `fetchWikiLinks()` + `wikiLinks()` — dla haseł spoza czytnika: wikitekst po 10 haseł (`prop=revisions`), ucięty na pierwszej sekcji z `STOP_SECTIONS`, bez komentarzy, `<ref>`, szablonów `{{…}}` (`src: 'wt'`); rekordy `src: 'api'` z pierwszej próby są ignorowane;
  - `resolveTitles()` — przekierowania celów z ≥ 2 haseł, 50 tytułów na zapytanie, do końca sesji (`aliasOf`, `canon`);
  - `JUNK` — identyfikatory (ISBN, doi…), lata, daty.
- **Trop** `computeTrop(T)`: kandydaci = linki ostatniego kroku (bez przeczytanych i kroków tropu); `from` = wcześniejsze kroki, które tu linkują (z pamięci linków), `to` = kroki, do których kandydat linkuje (`prop=links&pltitles=<ścieżka>`, 50 kandydatów na zapytanie). Wynik = 1·from + 1·to(bez ostatniego) + 0,5·link do ostatniego (`REC_W`; samo „linkuje z powrotem do Letchworth” wyciągało wioski Hertfordshire). Cache w pamięci po ścieżce. Test: Arts and Crafts → Garden city → Letchworth daje Raymond Unwin, Richard Barry Parker, Ebenezer Howard, Welwyn Garden City (5 zapytań, < 1 s).
- **Węzły** `computeNodes()`: cele z przeczytanych (seen/done), rodzina = korzeń łańcucha `branchOf` (`familyOf()`; hasło liczy się do rodziny, w której pojawiło się najwcześniej), próg **≥ 3 rodziny** (`REC_W.nodeMin`), kolejność: rodziny, zakreślenia z linkiem do celu, liczba haseł. `backfillLinks()` dociąga brakujące (do 300 najnowszych). Test na 4 przykładowych rodzinach (11 haseł): 6 zapytań, 2 s; przy progu 3: Modernism, Modern architecture, William Morris, Hermann Muthesius, John Ruskin, Turin, Philip Webb, Viollet-le-Duc, Pevsner.
### Interfejs
- `#trop-next` na końcu hasła — liczony dopiero, gdy stopka jest ≤ 900 px od ekranu (`IntersectionObserver`), 3 wiersze. „Otwórz” w arkuszu dokleja krok tropu (`state.pendingFrom = hasło`).
- `#view-nodes` (`#/wezly`), trzecie kółko w `#dock`; komunikat postępu „Pobieram linki z przeczytanych haseł: i z n”; pusty stan opisuje warunek.
- Wiersz (N1) `recRow()`/`recLine()`; arkusz `#why` z rysunkiem `whySvg()`.
- **C1 → T1 (v19):** najpierw tytuł dzielony łącznikiem (`shy` z niższym progiem, v18); jej prośba: nie dzielić tytułu wcale → makieta `.drafts/makiety/tytul.html` (T1 przyciski pod tytułem, T2 nad, T3 zmniejszanie). **Wybrane T1**: `.reader-head` w kolumnie, `#article-title` bez `hyphens`; `shy()` wróciło do wersji tylko dla półek.
- `sw.js` → `zakamarki-v18`. Sprawdzone 375 px: Węzły (Papier i Kakao), arkusz, Trop na końcu Letchworth, „Otwórz” dokleja krok; konsola bez błędów aplikacji.

## Decyzje (z makiet w `.drafts/makiety/`, poza gitem)
1. **Miejsce = A** (`miejsce.html`): Trop na końcu hasła, Węzły za trzecim kółkiem.
2. **Karta:** po rundach `karta.html` (K1 kropki → nazwy przy kropkach → miniatury → N1/N2 → N1 uporządkowane) i `renderownia.html` (R1 gwiazda, R2 warstwy → wiersze): **lista N1 + rysunek wierszami w arkuszu**. N1 sam w sobie „w miarę spoko” — zapamiętany jako opcja (jest teraz listą).
3. **Wagi:** bez ustawień, próg 3 tropy na stałe.
- Odrzucone i dlaczego: w STYL.md („Trop i Węzły”). Najważniejsze: kropki nieintuicyjne wizualnie, miniatury nic nie mówią, piktogramy progu 2/3/4 przebodźcowują, różne grubości linii = chaos, rysunek musi skalować się na dużo haseł.

## Uwagi techniczne
- **Panel przeglądarki:** `localhost:8000` przestał się otwierać w panelu w trakcie sesji (serwer z poprzedniej sesji, PID 64118, słucha tylko na IPv6 `*:8000`); działa `http://[::1]:8000/`. Pod `[::1]` i `127.0.0.1` panel **nie rejestruje żadnego service workera** (nawet jednolinijkowego) — to ograniczenie panelu, nie kodu; na telefonie (https) bez zmian. Starego serwera nie zamykałam (odmowa uprawnień); można go zamknąć ręcznie i wystartować `zakamarki` z `.claude/launch.json`.
- Makiety w ramkach: po każdym zapisie pliku makiety panel otwiera ją jako `file://` (puste ramki) — zamknąć tę kartę i pokazać wersję z serwera.
- Lokalna baza w panelu (`[::1]`) ma tylko pamięć linków z testów; dane przykładowe były tylko w pamięci.

## Do sprawdzenia na telefonie (v18–v19)
1. Po aktualizacji: dane na miejscu (baza v4 migruje się przy pierwszym otwarciu).
2. Ekran Węzły: ile węzłów przy prawdziwych danych, czas pierwszego pobrania linków (jednorazowo), czy nie ma śmieci (ogólniki typu Turin, World War I).
3. Trop na końcu hasła: czy propozycje trzymają wątek; czy pojawia się na czas.
4. Arkusz z rysunkiem: czytelność na telefonie, „Otwórz”.
5. Nagłówek hasła T1: tytuł bez dzielenia, przyciski pod nim.

## Kolejne kroki
1. Wrażenia z v18 → poprawki. Możliwe: filtr ogólników (kraje, miasta, wojny) przez Wikidata (etap 5), Węzły z zakreśleń przy niższym progu.
2. **C2 → etap 8:** nocą szew między śliwkowym nagłówkiem a brązowym tłem Kakao — przeniesiony do etapu 8 (paleta), bo rozwiązuje go nocna paleta.
3. **C3 ✅:** hook `.git/hooks/pre-push` uruchamia `check.mjs` i zatrzymuje push przy błędzie (sprawdzony testem negatywnym: zmiana `app.js` bez podbicia CACHE → exit 1). Lokalny, poza repo.
4. Etap 5: Statystyki i Atlas (rysunek z etapu 4 — wiersze zbiegające się w liczbie — może być wzorem dla „najgęstszych węzłów”).

## Prompt dla kolejnego agenta
```
Pracujemy nad Zakamarkami (~/Projekty/zakamarki, PWA, czysty HTML/CSS/JS, push na main = wdrożenie).
Na start wywołaj skill task-observer (dziennik: ~/Projekty/.task-observer/observation-log.md — OPEN obserwacje stosuj).
Przeczytaj CLAUDE.md, docs/PLAN.md, docs/STYL.md i handoff docs/handoffs/2026-11-22-012-zakamarki-trop-wezly.md. git status, git log -5.
1. Zapytaj o wrażenia z v18–v19 (Węzły, Trop, arkusz z rysunkiem, nagłówek hasła T1) — pytania z gotowymi odpowiedziami; popraw.
2. Przed etapem 5: decyzje z listy „Do ustalenia przed startem” w PLAN.md, jedna naraz. Szew nocą i paleta — etap 8 (na koniec).
Palety nie ruszamy. Makiety: prawdziwa aplikacja w ramkach, oglądane przez serwer, karty file:// zamykać.
```

## Dopisek (ta sama sesja, później)
- Przegląd repo: README zaktualizowany (był z etapu 2), komentarze o mapie „linia metra M2” → drzewo M4 (`zakamarki-v20`, tylko komentarze).
- PLAN.md: **etap 8 — Korekta wyglądu: paleta i nazwa** (na koniec projektu; próbnik kolor po kolorze, typografia nazwy K1/K4/K5, szew nocą); przy etapie 5 lista decyzji przed startem.
