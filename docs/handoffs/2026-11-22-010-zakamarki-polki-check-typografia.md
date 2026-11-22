# Handoff: Zakamarki — runda półek wdrożona, skrypt kontrolny, analiza nazwy i kolorów

**Data:** 2026-11-22
**Stan:** `zakamarki-v15` wysłana; w drugiej części sesji paleta **Wnętrze o zachodzie** (`zakamarki-v16`). Schemat bazy bez zmian (DB v3, kopia v3).
**Następna sesja zaczyna od:** kroju **samej nazwy** „zakamarki” (nagłówki półek i ekranów zostają w Inter Tight — jej decyzja), już w kolorach Wnętrza: 2–3 warianty z K1/K4/K5, bez przełączników. Jedna decyzja naraz (była przytłoczona stroną z pięcioma kierunkami i przełącznikami).

## Zrobione
- **A · Q4 Kropla:** nowy cudzysłów w `#dock` (`index.html`): dwa zamknięte kształty-krople, bez łączeń. Obejrzany w docelowym rozmiarze — czysty.
- **B · T1:** `label()` w `app.js` wstawia miękki łącznik funkcją `shy()` (słowa > 11 liter, także części słów z myślnikiem; samogłoski z `ąęó` dla polskich haseł). Klasy `.long/.xlong` usunięte. `.r-title`, `.g-title`, `.p-title`: jedna reguła — .74rem, 3 linijki, `line-height: 1.08`, `hyphens: manual`. Tytuł na tafli `left/right: 5px`.
- **C · C1:** `coverBox()` ustawia tylko `--cc` (barwa palety); pastel liczy CSS: `color-mix(in srgb, var(--cc) var(--cover-mix), var(--cover-base))` (`--cover-mix: 55%`, `--cover-base: #fff8f0` w `:root`). To samo w `.next-img.no-img` (róż) i `.peek-img.no-img` (liliowy). Szkło (`GLASS`) bez zmian — nasycone, więc poziom widać.
- Sprawdzone w 375 px na Papierze i Kakao (półki, „Czytaj dalej”, rozwinięta siatka Czytam i Przeczytane; karta hasła — tylko wyliczony kolor, bez otwierania prawdziwej karty), konsola czysta. Dane testowe wstrzyknięte tylko w pamięć (bez zapisu), po przeładowaniu zniknęły.
- **Etap 1 testów — `tools/check.mjs`** (Node, bez zależności), porównuje z `origin/main`:
  1. składnia `app.js` i `sw.js`;
  2. każdy plik z listy `SHELL` w `sw.js` istnieje (brak jednego psuje instalację i tryb offline);
  3. zmienione pliki aplikacji → `CACHE` musi być inny niż na `origin/main`;
  4. zmienione `DB_VERSION` → musi być krok `oldVersion < N` i nowe `BACKUP_VERSION`; wypisuje przypomnienie o kopii na telefonie;
  5. żaden plik `.json` w repo nie wygląda na kopię zapasową (`"app": "zakamarki"`).
  Przetestowany celowymi błędami (stary `CACHE`, `DB_VERSION` 4 bez migracji) — oba złapane, kod wyjścia 1. Zasada dopisana do `CLAUDE.md`. Hook `pre-push` **nie** założony — czeka na jej decyzję.
- `docs/STYL.md`, `docs/PLAN.md`, `CLAUDE.md` zaktualizowane.

## Analiza planszy z nazwą (jej referencja: 15 wersji „zakamarki” w kobalcie na kremie, 4 z pomarańczową kropką)
- **Ulubione (kropki):** „Margith” (nazwa niezweryfikowana: istnieje Margit ze Schriftlabor — płatny, wąski, inspirowany drewnianymi czcionkami; na planszy szeroki, miękki, ciężki szeryf — trzeba ją zapytać, skąd font), **Niamoy Script** (na planszy „Niamey”; darmowa tylko do użytku niekomercyjnego — w publicznym repo i jako webfont ryzykowna), **Paytone One** (Google Fonts, OFL, polskie znaki sprawdzone renderem), **Fraunces SuperSoft Black** z kropką (Google Fonts, OFL, oś SOFT 0–100; już w aplikacji).
- **Wzorzec:** wszystkie ulubione małymi literami; wszystkie wersje z wielkim „Z” bez kropki. Ciężar (black), miękkie / okrągłe zakończenia, niski kontrast kresek, ciepło lat 70. (Fraunces czerpie z Windsor/Souvenir). Kursywa to druga, osobista nuta („ręka” z briefu).
- **Nie wybrane:** didony (wysoki kontrast), fonty z „postarzoną” fakturą, cienka odręczna kreska, neutralny geometryczny grotesk. Zgodne z wcześniejszym odrzuceniem Instrument Serif i Bricolage.
- **Niejednoznaczne:** kropka na końcu (jest tylko w jednym ulubionym); szeryf vs okrągły grotesk vs kursywa — łączy je miękkość, nie klasyfikacja.
- **Makieta `.drafts/makiety/typografia.html`** (poza gitem, prawdziwy `style.css`): K1 Fraunces SuperSoft małymi + kropka w akcencie (rek.), K2 to samo + Fraunces w nagłówkach i liczbie, K3 Paytone One, K4 Playwrite PL (OFL, polska szkolna kursywa; w makiecie pogrubiona `-webkit-text-stroke`, bo font kończy się na 400 — przy wdrożeniu lepiej SVG z obrysem), K5 Fraunces + odręczne dopiski w Playwrite. Przełączniki: kolor nazwy (kobalt / kobalt „o zachodzie” / indygo / atrament), tło (krem / Wnętrze), dzień/noc.
- Kontrast nazwy na kremie: kobalt `#2d54e0` 5,0:1 (na Wnętrzu 4,8 — na granicy), kobalt `#2b46b8` 6,4, indygo `#2f3a7e` 8,5, atrament 14.
- Przy wdrożeniu K1: `index.html` — link Fraunces z `&text=zakamarki.` (małe litery!), tekst `.brand` małymi, kropka w `<span>` w kolorze akcentu, `aria-label` bez zmian; `--brand` na wybrany kolor.

## Kolory: brief „Wnętrze” a bieżące zadania (do jej decyzji)
- Brief (`~/Library/Mobile Documents/com~apple~CloudDocs/brief-wizualny.md`) **jest częściowo sprzeczny z nowszymi decyzjami**: numeracja 0.1/0.2 (odrzucona 2026-11-21), Instrument Serif (odrzucony), beż jako kolor główny (STYL: „nie beż-minimalizm”), indygo zamiast kobaltu (a jej plansza nazwy jest w kobalcie). Wymaga jej rozstrzygnięcia przed makietami całej aplikacji.
- **Trzy wersje akcentu (jasny / pełny / tekst)** z briefu to dokładnie system, który właśnie wszedł w C1: karta = jasny, szkło = pełny. Przy zmianie palety `--cover-mix` można zastąpić jawnymi wartościami „jasny”.
- **Zakreślacze „Lampy”** celowo nie powtarzają akcentów interfejsu; akcenty Wnętrza (Morska, Terakota, Śliwka, Musztarda) nakładają się z Lampami (morska zieleń, morela, wrzos, cytryna) — przy przejściu na Wnętrze trzeba Lampy przesunąć albo świadomie zmienić tę zasadę.
- **Kolory kategorii** (Ludzie, Ruchy, Miejsca… — brief): gdy będą dane z Wikidata (etap 5), kolor okładki bez zdjęcia mógłby oznaczać rodzaj hasła zamiast pozycji na półce — kolor staje się pomiarem (jak liczby).
- **Linki według stanu** (L2: kropki) zostają; brief proponuje kolor dla nowych linków (Śliwka) i węzłów (Pomidor) — zgodne z L2 tylko jeśli kolor jest dodatkiem do kształtu (astygmatyzm: stan nie może polegać tylko na kolorze).
- Zadanie z briefu (3–4 pełne makiety: start, czytnik, statystyki + strona zbiorcza w `.drafts/makiety/`) **nie zostało zrobione** — czeka na rozstrzygnięcie sprzeczności. `.drafts/` jest wykluczone w `.git/info/exclude` (lokalnie), więc `.gitignore` niepotrzebny.

## Prompt dla kolejnego agenta
```
Pracujemy nad Zakamarkami (~/Projekty/zakamarki, PWA, czysty HTML/CSS/JS, push na main = wdrożenie).
Na start wywołaj skill task-observer (dziennik: ~/Projekty/.task-observer/observation-log.md — OPEN obserwacje stosuj).
Przeczytaj CLAUDE.md, docs/STYL.md i handoff docs/handoffs/2026-11-22-010-zakamarki-polki-check-typografia.md. git status, git log -5.
Otwórz w panelu (serwer `zakamarki`) http://localhost:8000/.drafts/makiety/typografia.html.
1. Zapytaj o kierunek nazwy (K1–K5) i kolor nazwy; wdroż według sekcji „Przy wdrożeniu K1” (lub odpowiednio), sprawdź 375 px Papier/Kakao.
2. Zapytaj o sprzeczności briefu „Wnętrze” z STYL (numeracja, beż, indygo vs kobalt, Lampy vs akcenty), potem ewentualnie makiety całej aplikacji z briefu.
3. Przed pushem: node tools/check.mjs. Na koniec handoff 011, STYL/PLAN, commit, push; pokaż obserwacje task-observer.
```

## Druga część sesji: kolory (2026-11-22)
- Na jej prośbę kolejność: **najpierw kolory, potem krój nazwy**; nagłówki „Czytam / Na później / Przeczytane” zostają bez zmian (K2 i K3 z makiety typografii odpadają w tej formie).
- Makieta `.drafts/makiety/kolory.html`: trzy ramki z **prawdziwą aplikacją** (iframe `index.html`, nadpisane zmienne, przykładowe hasła tylko w pamięci, zapisy do bazy wyłączone), Krem / Wnętrze filmowe / Wnętrze o zachodzie, przycisk „Pokaż nocą”.
- **Wybór: Wnętrze o zachodzie**, z jedną poprawką — tafla Na później delikatnie jaśniejsza (`#e8c96f` zamiast pełnej musztardy; kontrast tytułów jak na tafli morskiej ~11:1).
- Wdrożone (`zakamarki-v16`): `:root` i `:root[data-scheme="dark"]` w `style.css` (wartości i role w STYL), nowe zmienne `--slab-later`, `--slab-done`, `--chip-bg`; `GLASS_TEXT` + `--gt` w `glassLevel()` (liczba „22/41” jasna na ciemnej śliwce/pomidorze); `theme-color` w `index.html` i kolory w `manifest.webmanifest` → `#efe2d1`.
- Sprawdzone 375 px Papier/Kakao: start, półki, Tropy, czytnik; konsola czysta.
- Zauważone, nie ruszane: (1) w czytniku długi tytuł obok PL / Aa / Na później łamie się bez łącznika („Letchwor-th” bez kreski) — stary problem, nie od palety; można użyć tego samego `shy()`; (2) nocą nagłówek jest śliwkowy, a tło Kakao brązowe — lekki szew kolorystyczny między warstwami.
