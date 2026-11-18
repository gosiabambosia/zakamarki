# Handoff: Zakamarki — pomiar akapitów, trzy półki, kropki przy linkach, mapa tropu, karta hasła

**Data:** 2026-11-18
**Następna sesja zaczyna od:** decyzji 3b z makiety `.drafts/zakreslenia.html` (4 pytania niżej, sekcja „Otwarte decyzje 3b”), potem kod 3b. Wcześniej krótko: jej wrażenia z telefonu po v12 (półki, „Czytaj dalej” z zakładką, kropki przy linkach, mapa tropu, karta pod przytrzymaniem linku).

## Zrobione (wdrożone, `zakamarki-v12`)

### A. Wrażenia z v9
Start H4, karta Tropy, panel „Aa” — **zostają bez zmian**. Pigułka powrotu pokazywała się **za rzadko** → wariant **P2** (niżej).

### Etap 3.3 — pomiar głębokości czytania (commit `a8ddb7c`, v10)
- **Jednostki pomiaru** (`measureUnits()`): najbardziej zewnętrzne `p, ul, ol, dl, blockquote` z ≥ 20 znakami tekstu; bez tabel, infoboksu, figur, galerii, przypisów, hatnote, i bez sekcji po h2 typu See also / References / Notes / Further reading / External links (`STOP_SECTIONS`). „Octopus” = 62 akapity.
- **Pomiar** (`meter`): IntersectionObserver (rootMargin minus wysokość paska) zbiera akapity na ekranie; co 0,5 s licznik dokłada czas, jeśli karta jest widoczna, panel „Aa” zamknięty, a akapit widać w ≥ 60% wysokości (długi: ≥ połowa ekranu). ≥ 2 s łącznie = przeczytany. Akapity zapisane jako skrót tekstu FNV-1a (base36), więc edycje hasła nie przesuwają zapisu. Czas wizyty liczony tylko do 3 min bez dotyku/przewijania.
- **Stany:** przejrzane ≥ 15%, doczytane ≥ 75%; stan tylko rośnie (`seenAt`, `doneAt`).
- **Miejsce powrotu:** pierwszy nieprzeczytany akapit, **pojedyncza dziura między przeczytanymi nie zatrzymuje** (decyzja). „Czytaj dalej” i okładki z półki Czytam otwierają hasło na tym akapicie i stawiają **różową zakładkę na marginesie** (`.resume`, obrys w kolorze tekstu — widoczna na Papierze i Kakao).
- **Wizyty zamiast otwarć:** ponowne otwarcie hasła, które jest ostatnim wpisem historii i było czytane < 30 min temu (przeładowanie, restart PWA, powrót przez „Czytaj dalej”), **nie dopisuje wpisu** — uzupełnia ten sam (`end`, `ms`, `p`). Przetestowane: przeładowanie 21 → 21 wpisów.
- **IndexedDB v2:** nowy magazyn `reads` (keyPath `title`), migracja w `onupgradeneeded` po `e.oldVersion` (kv i history nietknięte); `onblocked` pokazuje komunikat, `onversionchange` zamyka bazę i przeładowuje. Przetestowane na prawdziwych danych v1 (20 wpisów, 4 przypięte, 7 tropów — wszystko zostało).
- **Kopia zapasowa v2:** `data.reads` dochodzi; import przyjmuje v1 i v2, odrzuca nowsze. Łączenie stanu czytania: suma skrótów akapitów, dalszy stan, większe liczniki (dokładne liczby przeliczą się przy następnym otwarciu hasła). Ta sama wizyta w obu źródłach → wygrywa dłuższa (`ms`).
- **Ekran startowy — trzy półki z nazwami** (decyzje po 4 rundach makiet, `.drafts/polki.html`):
  - **Czytam** — okładki napełnione kolorowym szkłem do poziomu przeczytanych akapitów (jak szklane lampy-grzybki), liczba „22/41” na szkle, okładki stoją na desce (`--plank`), tytuł pod okładką.
  - **Na później** — okładki z miękkim cieniem za **musztardową** taflą plexi, tytuł na szkle (ona: „jak teraz, jakby stały na plexi”). **Bez śrub** na taflach (wprowadzały chaos).
  - **Przeczytane** — to samo na **liliowej** tafli (`--pop-lilac: #b48cf0`, fiolet ze Szkliwa w pastelowej wersji; też kolor kart bez zdjęcia).
  - Nad każdą półką **nazwa + liczba + okrągła strzałka**; stuknięcie w nazwę albo w półkę **rozwija siatkę** wszystkich haseł (3 kolumny, ≥ 560 px — 4), drugie zwija.
  - Hasło z Na później, które zaczniesz czytać, **przechodzi dalej** (Czytam → Przeczytane); hasła tylko otwarte nie trafiają na półki.
  - „Czytaj dalej” = najnowsze z Czytam (miniatura też ze szkłem, „24 z 62 akapitów · 14 min temu”); dopóki nic nie jest przejrzane — stare zachowanie (miejsce w bieżącym tropie).
- **Nazwy (decyzja):** **Czytam · Na później · Przeczytane** — „Przypięte” i „Przeczytane” brzmiały podobnie. Przycisk w czytniku: „Na później” / wciśnięty „✓ Na później” na musztardzie.
- **Pigułka powrotu P2:** od 300 px w lewym dolnym rogu stale różowe kółko „←”; przewijanie w górę rozwija je w pigułkę z nazwą poprzedniego kroku i pokazuje „↑”.

### Etap 3.4 — linki według stanu + minimapa (commity `ecb13d5`, `d67038f`)
- **L2:** pusty krążek po linku do hasła przejrzanego; pełny krążek + przygaszony kolor (`color-mix(link 45%, page-muted)`) po linku do doczytanego. Przekierowania („Octopoda” → Octopus) rozwiązuje **jedno zapytanie na hasło** `generator=links&gplnamespace=0&gpllimit=max&redirects=1` (mapa w `linkMaps` do końca sesji). Sprawdzone na Papierze i Kakao.
- **Mapa tropu (M2):** okrągły atramentowy przycisk przed pigułkami tropu otwiera arkusz od dołu: rodzina tropu (tropy połączone `branchOf`) jak linia metra — bieżący trop to główna linia, odgałęzienia skręcają w bok od hasła, w którym się rozeszły (ogon po wspólnym początku, bez duplikatów, max 8), skok przerywany, kroki „przed tobą” przygaszone, przy przystanku pomiar „r/n”, legenda znaków. Stuknięcie w przystanek otwiera hasło; na odgałęzieniu wznawia ten trop (`data-resume`).
- **Kreska tropu (M3):** pod każdym tropem w karcie Tropy rząd kropek (stan każdego hasła, przerywany odcinek = skok, różowa = `pos`); długi trop: 5 pierwszych, „⋯”, 9 ostatnich.

### Etap 3.5 — karta hasła pod przytrzymaniem linku
- Przytrzymanie linku (480 ms, ruch > 10 px albo przewinięcie anuluje) albo prawy przycisk / systemowy `contextmenu` (zablokowany na linkach) → **mała karta od dołu bez przyciemniania** (max 46vh), zamyka się stuknięciem obok, Esc, nawigacją. Puszczenie palca po przytrzymaniu nie otwiera hasła.
- Zawartość (po jej uwagach do K1: „za duże”, „bez języków i wyświetleń”, „coś, co szybko daje kontekst”, „miniatura mniejsza”, „nie upierdliwe”): miniatura 60 px, tytuł, krótki opis Wikipedii, **dwa pierwsze zdania wstępu** (`prop=extracts&exsentences=2`, oczyszczone z resztek wymowy), **liczba słów i czas czytania** (`list=search&srwhat=nearmatch&srprop=wordcount`, 230 słów/min), stan czytania jeśli jest, linijka **„Linkują tu: …” z przeczytanych haseł** (tylko gdy coś jest; `prop=links&pltitles=X&titles=<do 50 przeczytanych>`), przyciski **Otwórz** (krok tropu) i **Na później**.
- Linijkę „Linkują tu” dodałam od siebie (z planu „które przeczytane tu prowadzą”) — **zapytać, czy zostaje**.

## Decyzje i zasady z tej sesji (wpisane do STYL.md)
1. **Bierz pod uwagę dalszy rozwój** — kategorie muszą być czytelne i wygodne, żeby nie pogubić się po dodaniu kolejnych funkcji. **Jeśli sygnalizowanie bez słów robi chaos, wygrywa prosta nazwa.** Jedno słowo na jeden stan, wszędzie to samo (półka, przycisk w czytniku, statystyki).
2. Ekran startowy = biblioteka (Czytaj dalej, trzy półki, Tropy, Ostatnio otwarte, Kopia). Kolejne sekcje nie dokładają się w dół — propozycja: dolny pasek (C1 w makiecie 3b).
3. Półki: W7 + O1 (szczegóły wyżej). Odrzucone: W2 szafka, W3 ściana/stos, O2 bałagan, O3 różne wysokości, śruby na taflach.

## Otwarte decyzje 3b (makieta `.drafts/zakreslenia.html`, przełącznik Papier/Kakao)
Pytanie wysłane, **bez odpowiedzi** (skończył się jej limit). Rekomendacje:
- **A. Zaznaczenie:** **Z1 pasek na dole** (5 kółek-kolorów: róż, musztarda, limonka, liliowy, pomarańcz; × zamyka; przy jednym słowie znaczenia z Wikisłownika pod kolorami; przy frazie przycisk tłumaczenia) vs Z2 dymek przy zaznaczeniu.
- **B. Wygląd zakreślenia:** **B1 marker** na dolnej połowie linii (litery bez zmian) vs B2 pełne tło vs B3 kolor + kształt.
- **C. Miejsce ekranu Zakreślenia:** **C1 pływający dolny pasek** z okrągłymi przyciskami (biblioteka, zakreślenia; potem Węzły, Statystyki; tylko poza czytnikiem) vs C2 karta na starcie.
- **D. Frazy:** **przycisk „Tłumacz frazę”** otwierający Tłumacza Google z frazą (`https://translate.google.com/?sl=en&tl=pl&op=translate&text=…`; na Androidzie zwykle otwiera aplikację; fraza idzie do Google tylko po stuknięciu) vs „na razie tylko słowa” vs „najpierw sprawdzę aplikację Tłumacz”.
- Ekran Zakreślenia w makiecie: duża liczba „23 zakreślenia”, filtr kolorem (kółka z licznikami), grupy po tropach (0.1…), sekcja „Prowadzą do tego samego” = hasła docelowe linków z zakreśleń w ≥ 2 różnych hasłach (kandydaci na Węzły). Diagram modelu na dole makiety.
- Chip **„PL”** obok „Aa” (obrys; w polskim widoku wciśnięty) — zdecydowany wcześniej.

## Sprawdzone dane do 3b
- pl.wiktionary: `action=parse&page=WORD&prop=wikitext&origin=*` → sekcja `== WORD ({{język angielski}}) ==` → `{{znaczenia}}` → linie `: (1.1) [[kamuflaż]]`; część mowy w `''rzeczownik''`. Przykłady: camouflage → kamuflaż; gripping → fascynujący, pasjonujący; cleavage → podział, rozłam / dekolt. Formy odmienione (octopuses, changed) zwykle nie mają hasła → próbować małą literą i bez końcówek -s/-es/-ed/-ing.
- langlinks: `prop=langlinks&lllang=pl` (sprawdzone w handoffie 006).

## Plan kodu 3b (do zrobienia po decyzjach)
1. **Baza v3**: magazyn `highlights` (keyPath `id`, indeksy `title`, `at`): `{id, title, lang, trail, text, prefix, suffix, links:[docelowe tytuły], color, at}`; zakotwiczenie przez wyszukanie tekstu z prefiksem/sufiksem po wczytaniu hasła. Kopia v3 (+highlights), import v1–v3. **Przypomnieć o kopii przed wdrożeniem.**
2. Pasek zaznaczenia (`selectionchange` + `getSelection()` w `#article`), kolory → zapis + `<mark class="hl c-…">` przez `Range.surroundContents`/podział węzłów tekstu; stuknięcie w zakreślenie → zmiana koloru / usunięcie.
3. Słownik: jedno słowo → pl.wiktionary (cache w pamięci), część mowy + znaczenia.
4. Chip PL: `prop=langlinks&lllang=pl` przy otwarciu; trasa `#/pl/wiki/Tytuł`; API i baza linków jako parametr języka (`API`, `WIKI` → funkcje od `lang`); stan czytania i tropy dla polskich haseł z prefiksem `pl:` w kluczu (do ustalenia).
5. Ekran Zakreślenia + (jeśli C1) dolny pasek; grupowanie: tropy, kolor, wspólne linki.
6. `sw.js` → v13, test na Papierze i Kakao, 375 px, konsola.

## Stan / uwagi techniczne
- `.claude/launch.json`: serwer `zakamarki` (python3 -m http.server 8000).
- **Panel przeglądarki:** karta w tle nie rysuje się, więc IntersectionObserver w niej milczy — przy teście pomiaru wyciągnij kartę na wierzch (`tabs_select`). Emulacja rozmiaru zawyża `innerHeight` (944 przy widocznych 844), przez co elementy `position: fixed` przy dole wypadają poza ekran — to artefakt emulacji, nie błąd.
- Odświeżając pliki do testu, pobierz też `/` (nie tylko `/index.html`) z `cache: 'reload'` — to osobne wpisy w pamięci HTTP.
- Lokalna baza testowa w przeglądarce panelu ma sztuczne dane (Squid doczytane z importu itd.) — nie ma znaczenia dla telefonu.
- Makiety tej sesji (poza gitem): `.drafts/polki.html` (4 rundy półek + pigułka), `.drafts/mapa-karta.html` (M1–M3, K1–K2), `.drafts/zakreslenia.html` (3b).
- Renderownia (skill) — nie użyta; zaproponowana do modelu Węzłów w etapie 4.

## Kolejne kroki
1. Ona: test v12 na telefonie (półki po kilku hasłach czytanych ≥ 15%, „Czytaj dalej” z zakładką, kropki przy linkach, mapa tropu na tropie z odgałęzieniem, przytrzymanie linku — czy nie wyskakuje przypadkiem), decyzja, czy zostaje linijka „Linkują tu”.
2. Decyzje 3b (A–D) → kod 3b według planu wyżej.
3. Etap 4: Trop i Węzły (z zakreśleniami jako sygnałem; renderownia do modelu).
