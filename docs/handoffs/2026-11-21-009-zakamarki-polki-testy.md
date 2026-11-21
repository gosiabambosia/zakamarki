# Handoff: Zakamarki — po v13: runda półek i cudzysłowu, ocena testów automatycznych

**Data:** 2026-11-21
**Stan:** v13 (etap 3b) wdrożona i działa na telefonie. W tej sesji wdrożona tylko drobna poprawka (kolor dni w Tropach, `zakamarki-v14`). Czekają trzy decyzje wyglądu (makieta) i decyzja o etapie 1 testów.
**Następna sesja zaczyna od:** decyzji z makiety `.drafts/runda-polki.html` (A, B, C niżej) → kod; potem, jeśli się zgodzi, etap 1 testów (skrypt kontrolny przed wysłaniem).

## Uwagi z telefonu po v13
1. Znak Zakreśleń (cudzysłów) dalej wygląda „glitchy” w małym rozmiarze — mikro-kawałeczki kształtu.
2. Lista Tropy po rodzinach: **zostaje** („jest git”). Dzień po lewej zlewał się z trasą → **zrobione**: kolor podpisu, odrobinę ciemniejszy (`color-mix(muted 78%, fg)`), pogrubiony (700); to samo na ekranie Zakreślenia.
3. Tytuły na półkach mają różne wielkości czcionki — nie lubi; zapytała, czy białe nie byłyby lepsze; chce kilku opcji.
4. Okładki bez zdjęcia: chce minimalnie bardziej pastelowe (te same barwy), żeby nie zlewały się z taflą.
5. Czytam: przy niektórych hasłach (Anti-realism) nie widać szkła.

## Diagnozy
- **Szkło niewidoczne:** `coverBox()` i `glassLevel()` biorą kolor z tej samej pozycji palety (`COVER_COLORS[i]` i `GLASS[i]`, ten sam indeks) → na różowej karcie różowe szkło. Dotyczy tylko okładek bez zdjęcia. Szkło jest, tylko go nie widać.
- **„Glitch” cudzysłowu:** obecny znak = kółko + osobno doklejony łuk (stroke z okrągłym końcem); na łączeniu powstaje klin/ząbek, w 26 px rysowany jako schodek.
- **Różne wielkości tytułów:** `label()` dodaje `.long` / `.xlong` dla słów > 11 / > 14 liter. Przeglądarka nie dzieli tych słów sama (`hyphens:auto` nie złamało „Correspondence” w 82 px), a `overflow-wrap:anywhere` tnie bez łącznika.

## Makieta `.drafts/runda-polki.html` (poza gitem; używa prawdziwego `../style.css`)
Rekomendacje (do jej decyzji):
- **A · Znak Zakreśleń:** **Q4 Kropla** (rek.) — każdy znak cudzysłowu to jeden zamknięty, wypełniony kształt (kółko przechodzące w ogonek), bez łączeń; ścieżka w makiecie (`tear()`). Alternatywy: Q5 Kreski (dwie grube pochylone kreski ″), Q6 Fraunces (glif “ z kroju logo; w aplikacji jako SVG `<text>` z fontem ładowanym przez `&text=Zakamarki“`).
- **B · Tytuły:** **T1** (rek.) — jedna wielkość (.74rem) wszędzie, atramentowe, do 3 linijek (`-webkit-line-clamp: 3; line-height: 1.08`), `hyphens: manual` + własne miękkie łączniki: funkcja `shy()` w makiecie wstawia `­` w słowach > 11 liter (także w częściach słów z myślnikiem) między dwiema spółgłoskami VC|CV najbliżej środka („Corres-pondence”, „Anti-foun-dationalism”). Na taflach `left/right: 5px`. Alternatywy: T2 białe z cieniem (biel na musztardzie ma ~1,6:1 — bez cienia nieczytelna), T3 białe na przyciemnionej tafli (ochra / śliwka — zmienia charakter półek).
- **C · Okładki bez zdjęcia:** **C1** (rek.) — karta = kolor palety zmieszany z kremem 55% (`color-mix(in srgb, KOLOR 55%, #fff8f0)`), szkło zostaje nasycone w tym samym kolorze → widoczny ciemniejszy poziom, karty nie zlewają się z taflą. Rozwiązuje też problem szkła. Alternatywy: C2 bledsze (40%), C3 pełne karty + szkło z innej barwy (pstrokato).
- Przy wdrażaniu: `shy()` przenieść do `label()` w `app.js` (zamiast klas `.long/.xlong`), usunąć reguły `.long/.xlong` w `style.css`; pastel w `coverBox()` (też `.next-img.no-img`, `.peek-img.no-img`, siatka `.g-cover`); nowa ścieżka cudzysłowu w `#dock` w `index.html`; podbić `CACHE`.

## Ocena: czy warto wdrożyć testy automatyczne (bez zmian w kodzie — tylko ocena)

### Stan projektu
- Czysty HTML/CSS/JS, jeden plik logiki `app.js` (~2000 linii, ~83 funkcje), bez npm i bez kroku budowania; wdrożenie = push na `main` → GitHub Pages w 1–2 min. Jedna użytkowniczka, jeden telefon jako główne urządzenie.
- **Testów brak.** Brak `package.json`, hooków gita, CI (`.github`).
- **Co już pełni rolę zabezpieczeń:**
  - ręczny test każdej zmiany przez Claude na żywym API w panelu przeglądarki (Papier/Kakao, 375 px, konsola) — zasada z CLAUDE.md, stosowana co sesję;
  - `node --check app.js` (składnia) — robione ręcznie, nie zawsze;
  - walidacja importu kopii: odrzucenie obcych plików i nowszej wersji, pomijanie wpisów bez wymaganych pól (`typeof h.title`, `Array.isArray(r.seen)`, `T?.id`…); import tylko łączy, nic nie kasuje;
  - migracje IndexedDB krok po kroku po `oldVersion` (stare magazyny nietknięte), `onblocked` / `onversionchange`;
  - kopia zapasowa jako plik JSON robiona przez nią przed zmianą schematu;
  - zasady w CLAUDE.md (podbij CACHE, DB_VERSION + krok migracji + BACKUP_VERSION) — ale **zależne od pamięci**, nikt ich nie sprawdza automatycznie.

### Co realnie psuło się dotąd
Prawie wszystkie błędy z ostatnich sesji były **wizualne / UX** (znak przesunięcia w powrocie do miejsca — wyłapany testem ręcznym; kaskada CSS `.sheet` vs `.map-sheet`; kolizja kolorów szkła; „glitch” ikony; zalewanie listy tropów). Testy automatyczne nie wyłapałyby żadnego z nich. Ręczna weryfikacja w przeglądarce + jej oko na telefonie są tu właściwym narzędziem i takie zostają.

### Gdzie brak testów może zrobić realną szkodę (ciche błędy w danych)
Błąd w tych miejscach **nie jest widoczny od razu** i niszczy dane, których nie da się odtworzyć:
1. **Łączenie kopii zapasowej** (`mergeBackup`, `mergeRead`, zakreślenia po id) — import starej kopii nie może zgubić ani zdublować wizyt, tropów, stanu czytania, zakreśleń. Ryzyko rośnie z każdą wersją kopii (v1→v2→v3).
2. **`textHash`** — skrót akapitu; każda zmiana funkcji (nawet „kosmetyczna”) unieważnia cały zapisany postęp czytania (`seen`). Jeden test „te 3 teksty dają te 3 skróty” chroni całą historię czytania.
3. **`applyStep` (tropy)** — maszyna stanów (link, powrót, odgałęzienie, skok, wznowienie); zapisuje się na stałe do archiwum tropów; była już kilka razy zmieniana. Błąd psuje tropy po cichu i dopiero mapa/lista to pokaże.
4. **Zakotwiczenie zakreśleń** (`locate`) — błąd = zakreślenia „znikają” z haseł (dane zostają, ale nie widać ich w tekście).
5. **Zasady wdrożeniowe z pamięci** — zapomniany `CACHE` (telefon pokazuje starą wersję), `DB_VERSION` podbite bez kroku migracji albo bez `BACKUP_VERSION`.

### Gdzie testy byłyby nieuzasadnione
- Wygląd, CSS, układ, kolory, ikony — zmieniają się co sesję z jej decyzji; testy zrzutów ekranu = ciągłe przepisywanie wzorców (duży koszt utrzymania, zero korzyści).
- Testy end-to-end (Playwright itp.) — wymagają npm, przeglądarek, zależą od żywej Wikipedii (niestabilne); dla jednoosobowej aplikacji przerost.
- Zapytania do API Wikipedii / Wikisłownika / tłumacza — zewnętrzne, zmienne; mockowanie ich to praca bez wartości.
- `cleanArticle`, pomiar akapitów na ekranie (IntersectionObserver), pasek zaznaczenia — zależne od DOM i dotyku; błędy widać od razu przy ręcznym teście.
- CI na GitHubie, pokrycie kodu, testy „dla zasady”.

### Rekomendacja: tak, ale minimalnie i etapami
**Etap 1 — skrypt kontrolny przed wysłaniem (największa wartość, ~30 min, prawie zero utrzymania).**
`tools/check.mjs` (Node, bez zależności; Node 24 jest na Macu), uruchamiany przez Claude przed każdym push (i opcjonalnie jako hook `pre-push` w `.git/hooks`, który nie trafia do repo):
- składnia `app.js` i `sw.js`;
- jeśli od `origin/main` zmieniły się `app.js` / `style.css` / `index.html` / `sw.js` / `manifest`, to `CACHE` w `sw.js` też musi być inny;
- jeśli zmienił się `DB_VERSION`, to musi zmienić się `BACKUP_VERSION` i musi istnieć krok `oldVersion < DB_VERSION` w `onupgradeneeded`.
Pilnuje reguł, które dziś zależą od pamięci. Nie dotyka architektury aplikacji.

**Etap 2 — testy logiki danych (~1–1,5 h, małe utrzymanie; dopiero po etapie 1 i jej zgodzie).**
Wydzielić czyste funkcje bez DOM do `core.js` (ładowany `<script>` przed `app.js`, eksport dla Node przez `if (typeof module !== 'undefined')`): `textHash`, `firstUnread`, `mergeRead`, czysta wersja łączenia kopii (dane w aplikacji + plik → wynik), `applyStep` z tropami jako parametrem, `trailFamily`/`familyTree`, `locate`, `wordVariants`, `parseWikt`. Testy wbudowanym `node --test` (bez npm), ~20 przypadków na **sztucznych** danych (repo publiczne — nigdy jej prawdziwej kopii): kopie v1/v2/v3, gwiazda tropów, odgałęzienie, skok, wznowienie, zakotwiczenie po edycji sąsiedztwa, „camouflaged → camouflage”. Uruchamiane przez skrypt z etapu 1.
Koszt: jednorazowy refaktor (ryzyko regresji przy przenoszeniu — dlatego testy pisane razem z przenoszeniem, a potem test ręczny w przeglądarce).

**Etap 3 — tylko przy następnej zmianie schematu bazy:** strona testowa migracji w przeglądarce na osobnej bazie (np. `zakamarki-test`) z syntetycznymi danymi starej wersji. Nie wcześniej.

## Zrobione w tej sesji
- `style.css`: dzień w Tropach i na ekranie Zakreślenia — kolor podpisu, ciemniejszy, pogrubiony. `sw.js` → `zakamarki-v14`.
- Makieta `.drafts/runda-polki.html`.
- Dziennik obserwacji task-observer: `~/Projekty/.task-observer/observation-log.md` (poza repo; O1–O6).

## Prompt dla kolejnego agenta
```
Pracujemy nad Zakamarkami (~/Projekty/zakamarki, PWA, czysty HTML/CSS/JS, push na main = wdrożenie).
Na start wywołaj skill task-observer (dziennik: ~/Projekty/.task-observer/observation-log.md — przeczytaj OPEN obserwacje i stosuj je).
Przeczytaj w całości CLAUDE.md, docs/STYL.md i najnowszy handoff docs/handoffs/2026-11-21-009-zakamarki-polki-testy.md. Sprawdź git status i git log -5.
Otwórz w panelu przeglądarki (serwer `zakamarki` z .claude/launch.json) makietę http://localhost:8000/.drafts/runda-polki.html.

1. Zapytaj mnie (gotowe odpowiedzi, rekomendacja pierwsza) o trzy decyzje z makiety: A znak Zakreśleń (rek. Q4 Kropla), B tytuły na półkach (rek. T1 jedna wielkość + miękkie łączniki, 3 linijki), C okładki bez zdjęcia (rek. C1 pastele 55%, nasycone szkło). Zakoduj wybrane według sekcji „Przy wdrażaniu” w handoffie; sprawdź w 375 px na Papierze i Kakao (półki, „Czytaj dalej”, karta hasła, rozwinięta siatka), konsola bez błędów, podbij CACHE.
2. Zapytaj, czy wdrażamy etap 1 testów (skrypt tools/check.mjs z handoffu 009). Jeśli tak: zrób go ze mną, wyjaśniając prosto, co sprawdza i kiedy go uruchamiasz; uruchom przed pushem. Etap 2 (core.js + node --test) tylko po mojej osobnej zgodzie.
3. Zasady jak w CLAUDE.md: po polsku, ja decyduję, warianty na żywo z rekomendacją, czytelność ponad pozawerbalność, każdą odpowiedź kończ sekcją „Dalej”. Na koniec sesji: handoff 010, aktualizacja PLAN/STYL, commit i push (push po moim potwierdzeniu, jeśli zmieniasz schemat bazy — wtedy przypomnij o kopii na telefonie). Na końcu pokaż obserwacje task-observer z tej sesji.
```
