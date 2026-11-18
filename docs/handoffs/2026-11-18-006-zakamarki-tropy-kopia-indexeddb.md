# Handoff: Zakamarki — runda po teście na telefonie, archiwum tropów, kopia zapasowa, IndexedDB

**Data:** 2026-11-18
**Następna sesja zaczyna od:** jej wrażeń z telefonu po wdrożeniu `zakamarki-v9` (najpierw **Zapisz kopię** na ekranie startowym!), potem **etap 3.3 — pomiar głębokości czytania (akapity)** razem z wariantami trzech półek rozróżnialnych bez słów.

## Zrobione

### Runda A (po teście na Androidzie)
- **Wyszukiwarka**: pole czyści się przy otwarciu i zamknięciu. Wcześniej ukryte pole (`display:none`) trzymało stary tekst.
- **Zdjęcia w artykule na środku** (`figure` jako `display:table` + `margin-inline:auto`, podpis jako `table-caption` pod zdjęciem); obrazy i podpisy w infoboksie wyśrodkowane.
- **Półka**: na kartach bez zdjęcia podpis na dole (był na górze).
- **Archiwum tropów** (jej skarga: „wystarczy, że wyjdę z artykułu, i trop przepada”): `state.trails` z `pos`, odgałęzieniami (`branchOf`) i skokami z wyszukiwarki w czytniku (`j:1`, przerywana ramka). Powrót tylko przesuwa `pos`; kroki „przed tobą” są przygaszone. Przy pierwszym uruchomieniu archiwum odtwarza się z historii (pole `from`). Szczegóły w CLAUDE.md → Tropy.
- **Ekran startowy, wariant H4** (po dwóch rundach makiet): wielka kobaltowa liczba dnia + dwie linijki wyrównane do jej dołu; karta „Czytaj dalej” z miniaturą na całą wysokość; karta „Tropy” (5 ostatnich, 0.1…, „Start → Koniec”, liczba haseł i skoków, kiedy; stuknięcie wznawia trop). Usunięte „Dokąd dziś w głąb?” i „N kroków od hasła”. Pusty stan: pigułka „Szukaj hasła”.
- **Panel „Aa”, wariant C**: presety jako kafle w swoich kolorach, kroju i grubości; „+” zapisuje bieżące ustawienia (sam w rzędzie = cienki pasek); pod „Dostosuj” rzędy próbek bez podpisów (7 teł, 4 kroje „Ag”, 4 grubości „Aa”, suwaki z ikonami; szerokość kolumny tylko ≥ 700 px). Bez presetów „Dostosuj” otwiera się samo. Usuwanie presetu: × na kaflu, widoczne przy otwartym „Dostosuj”.
- **Szybki powrót, wariant F1**: różowa pigułka „← poprzedni krok” + okrągłe „↑”; pokazują się przy przewijaniu w górę (> 300 px od góry), chowają przy czytaniu w dół.

### Etap 3.1 — kopia zapasowa
- Karta „Kopia zapasowa” na końcu ekranu startowego: „Zapisz kopię” (plik `zakamarki-kopia-RRRR-MM-DD.json` w Pobranych), „Wczytaj kopię” (wybór pliku). Zapisuje i pokazuje, kiedy była ostatnia kopia.
- Import **łączy** dane (decyzja: bezpieczniej niż zastępowanie): historia po (tytuł, czas), tropy po id (wygrywa nowszy `end`), suma przypiętych i presetów; ustawienia czytnika z pliku tylko wtedy, gdy w aplikacji są domyślne. Przed importem `confirm()` ze streszczeniem pliku.

### Etap 3.2 — IndexedDB
- Baza `zakamarki` v1: `kv` + `history` (dopisywanie, bez limitu 2000). `store.cache` ładowany raz przy starcie (`store.ready`), potem `route()`.
- Migracja z localStorage w jednej transakcji, `migratedAt` w `kv`; localStorage zostaje nietknięty jako kopia (ale już nieaktualizowany, poza `reader`).
- Tryb zapasowy na localStorage, gdy IndexedDB niedostępne (nietestowany ręcznie — logika prosta).
- Przetestowane lokalnie: migracja 15 wpisów + tropy + presety, zapis nowych otwarć tylko do IDB, przypięcie i trop po przeładowaniu, konsola czysta.

Commity: `7720a87` (runda A + kopia, v8), `b95697c` (IndexedDB, v9), plus ten z dokumentacją.

## Decyzje (2026-11-18)

1. Panel „Aa”: **C** (presety na wierzchu, próbki bez słów). Ona **przetwarza w dużej części pozawerbalnie** — słowne nazwy opcji są przytłaczające. Wpisane do CLAUDE.md i STYL.md.
2. Nagłówek: **H4** (liczba dnia + karta „Czytaj dalej”). Odrzucone: H1 (duży tytuł + miniatura obok „jak źle wstawione zdjęcie w Wordzie”, za duża przerwa), H2, H3, H5, H6.
3. Powrót: **F1**. Tropy: **archiwum + skok w tropie** (wyszukanie z czytnika = skok, ze startu = nowy trop).
4. Głębokość czytania: **akapity na ekranie** (≥ 2 s przy aktywnej karcie; przejrzane ≥ 15%, doczytane ≥ 75%; bez przypisów, „See also”, „References”).
5. Linki: **L2** — kropka po linku (pusty krążek = przejrzane, pełny + przygaszony kolor = doczytane). Makieta `.drafts/linki.html`.
6. Ekran startowy po pomiarze: **trzy półki** — Przypięte (chcę przeczytać, ręcznie) / Czytam (przejrzane, niedoczytane; „Czytaj dalej” = najnowsze, otwiera się na pierwszym nieprzeczytanym akapicie) / Przeczytane. **Warunek od niej: półki mają się różnić bez słów**, bo „Czytaj dalej” i „Chcę przeczytać” są dla niej zbyt podobne; prosi o rozwiązanie unikatowe, z referencji.
7. Mini-etap **3b** po etapie 3, przed Węzłami: zakreślenia (grupowanie: automatycznie po haśle i tropie + automatycznie po wspólnych linkach + ręcznie kolorem zakreślacza; bez tagów), chip „PL” (langlinks), dymek z pl.wiktionary dla pojedynczych słów. Wpisane do PLAN.md.

## Research: tłumaczenie bez serwera i kluczy (sprawdzone 2026-11-18)

- **langlinks** (`prop=langlinks&lllang=pl`) — działa z przeglądarki: Octopus → Ośmiornice, Mycelium → Grzybnia, Garden city movement → Miasto ogród. Polską wersję można wczytać tym samym `action=parse` z `pl.wikipedia.org`.
- **pl.wiktionary** — hasła angielskie mają sekcję `== octopus ({{język angielski}}) ==` z `{{znaczenia}}` → „(1.1) {{zool}} [[ośmiornica]]”. `action=parse&prop=wikitext`, CORS z `origin=*`. en.wiktionary REST `/page/definition/` też ma CORS `*` (definicje angielskie).
- **MinT** (`cxserver.wikimedia.org/v2/translate/en/pl/MinT`) — technicznie odpowiada z dowolnej strony („Ośmiornica ma trzy serca.”), ale dokumentacja: API tylko dla produktów Wikimedia → **odrzucone**.
- **Translator API w Chrome** — tylko desktop; Android w fazie „Intent to Prototype” → **odrzucone na teraz**, warto sprawdzić za kilka miesięcy (wtedy tłumaczenie fraz na urządzeniu, bez wysyłania tekstu).
- Całe frazy teraz: systemowe „Tłumacz” w menu zaznaczenia na Androidzie (aplikacja Tłumacz Google) — bez kodu; **zadanie dla niej: sprawdzić w zainstalowanej PWA**.

## Kierunki na trzy półki bez słów (do makiet w następnej sesji)

1. **Poziom wypełnienia** — każda okładka ma „płyn” do wysokości odsetka przeczytanych akapitów (szklane lampy-grzybki i szklana półka z referencji): pusta szklanka = chcę, do połowy = czytam, pełna = przeczytane. Sam pomiar jest obrazem.
2. **Fizyczna półka książek** — chcę = okładka frontem (jak teraz), czytam = okładka przechylona/otwarta z zakładką, przeczytane = sam grzbiet z pionowym tytułem (wąski, gęsto).
3. **Położenie** — trzy poziomy jednej szafki: góra = czytam (pod kciukiem „dalej”), środek = chcę, dół = przeczytane (mniejsze, archiwum); różne kolory szkła pasów.
Rekomendacja na start rozmowy: 1 (unikatowe, mierzalne, zgodne z referencjami), ewentualnie połączone z 2 dla przeczytanych.

## Wynik testu na telefonie (koniec sesji, 2026-11-18)

- **Kopia zapasowa działa** — plik zapisuje się na telefonie. Od teraz reinstalacja PWA jest bezpieczna (po świeżej kopii).
- **Systemowe „Tłumacz” przy zaznaczeniu tekstu się NIE pojawia** (Android, zainstalowana PWA). Całe frazy nie mają więc rozwiązania „bez kodu”. W 3b przedstawić opcje z rekomendacją, np.: (a) instalacja aplikacji Tłumacz Google — wtedy Chrome zwykle dodaje „Tłumacz” do menu zaznaczenia (do sprawdzenia, czy też w PWA); (b) przycisk w dymku zaznaczenia otwierający translate.google.com z frazą (wychodzi z aplikacji, tekst idzie do Google); (c) tylko słowa i zwroty z Wikisłownika + chip „PL”, frazy później przez Translator API, gdy trafi na Androida. MinT odrzucony (warunki).
- Zapytała, gdzie są tłumaczenie, półki „chcę przeczytać” i zakreślenia — **jeszcze niezbudowane**, tylko zaprojektowane; kolejność: 3.3 → 3.4 → 3.5 → 3b. Zostajemy przy tej kolejności (zakreślenia można przestawić wcześniej, jeśli poprosi).

## Stan / uwagi

- `.claude/launch.json` (lokalny, wykluczony z gita przez `.git/info/exclude`): serwer `python3 -m http.server 8000`.
- Makiety tej sesji (lokalnie, poza gitem): `.drafts/runda-a.html`, `.drafts/runda-a-naglowek.html`, `.drafts/linki.html`.
- Przeładowanie strony z artykułem dopisuje wpis do historii (było tak i wcześniej). Przy pomiarze głębokości warto liczyć **wizyty** (sesje czytania), a nie surowe otwarcia, i nie duplikować wpisu przy przeładowaniu.
- `trail` (stary klucz) zostaje w `kv` po migracji — nieużywany poza jednorazowym odtworzeniem.
- Teraz można bezpiecznie poprosić o reinstalację PWA, ale **dopiero po zrobieniu kopii** na telefonie.

## Kolejne kroki

1. ✅ Kopia na telefonie zapisana; systemowe „Tłumacz” niedostępne. Na start sesji: jej wrażenia z nowego startu, Tropów, panelu „Aa” i pigułki powrotu.
2. **Etap 3.3:** pomiar akapitów (IntersectionObserver, czas aktywnej karty, magazyn na stany haseł, np. `reads` w IndexedDB v2: {title, paragraphs, seen[], state, firstUnread, updatedAt}), miejsce powrotu, makiety trzech półek bez słów → wdrożenie.
3. **Etap 3.4:** linki L2 + minimapa tropu. **3.5:** karta hasła pod przytrzymaniem linku.
4. **3b:** zakreślenia + PL + słownik (przy projektowaniu modelu grupowania i powiązań z Węzłami można użyć skilla renderownia).
5. Potem etap 4 (Trop i Węzły).
