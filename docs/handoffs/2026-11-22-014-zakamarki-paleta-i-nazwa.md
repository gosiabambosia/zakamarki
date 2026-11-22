# Handoff: Zakamarki — etap 8 zamknięty (paleta, noc, nazwa)

**Data:** 2026-11-22 (noc, po handoffie 013)
**Stan:** `zakamarki-v22` na `main` (commity `c33e8cb` paleta, `5791861` nazwa). Nazwa potwierdzona na telefonie. Repo czyste po commicie handoffu.
**Następny krok:** **logo / ikona aplikacji** w kroju nazwy (próbnik interaktywny, jej prośba po zamknięciu etapu 8), potem etap 5 — Statystyki i Atlas.

## Co zrobione
1. **Próbnik palety** `.drafts/makiety/probnik.html` (poza gitem): prawdziwa aplikacja w ramce, dane tylko w pamięci (zapis `store` wyłączony). Sekcja A — tło (kafle tła z kartą); B — **role** (okładki, liczby, tekst, trop, Aa, na później, zakreślacze) z paskiem „obecny → nowy”, rząd „obecna” jako odniesienie, jej palety z iCloud i Figmy, **tonacje** (odmiany jej kolorów w OKLCH, nie koło barw); ramka sama przełącza start/czytnik według roli; C — dwa warianty szkła. Wynik: linijka „kopiuj”.
2. **Paleta wdrożona (v21)** — jej linijka: tło `#fffcf5`, okładki `#f6b3d3 #2b46b8 #d0472f #d6a11e #75852b #afa2f6`, tekst `#05094d`, zakreślacze `#7b98e5 #e99fb6 #ffaf9e #f6d19a #adbb7c`, szkło 1. Liczby, trop, Aa, na później bez zmian.
   - `style.css`: Kartka/Piasek/Linia wyliczone z tła (mieszanie z `#6b5848` 12% i 26%); `--cover-1…6` + `--cover-ink-1…6` (kontrast); `--cover-wash`; szkło 88% w barwie okładki (na zdjęciu i bez), okładka bez zdjęcia pod szkłem rozjaśniona (42%). Usunięte nieużywane `--pop-lime`, `--pop-lilac`, `.chip`.
   - `app.js`: `COVERS = 6`, `COVER_COLORS`/`COVER_INKS` generowane; `coverBox` ustawia `--cc` i `--ci`.
   - `theme-color` i manifest na `#fffcf5`.
3. **Noc**: najpierw ciepły grafit — „do poprawki”; makieta `.drafts/makiety/noc.html` z 3 wariantami (grafit / granat / śliwka) → **granat `#0f1230`** (Kartka `#191d3a`, Głębia `#222741`, Linia `#30344d`, tekst `#f2ead9`).
4. **Szew nocą**: wybrała „w kolor kartki” — `:root[data-scheme="dark"][data-view="reader"] .bar` bierze `--page`; nowa `syncThemeColor()` (wołana z `show()` i `applyReader()`) ustawia pasek telefonu tak samo.
5. **Nazwa**: rundy wariantów (K1/K4/Paytone → +3 ozdobne → +3 czytelne → groteski → ręczne/funky) nie trafiały; przełom dał **próbnik nazwy** `.drafts/makiety/nazwa-probnik.html` (49 krojów z Google Fonts przez `&text=zakamarki.`, grupy, auto-wielkość do ~165 px, suwaki wielkości i odstępu, kolor nazwy i kropki, dzień/noc). Wybór: **Corben 700 · 23,5 px · −0,005 em · granat · kropka `#d0472f`** (v22). `.brand` przesunięta `translateY(.1em)` — słowo bez dolnych wydłużeń siedziało 2,4 px nad środkiem lupy (zmierzone canvasem: środek tuszu 30,9 vs lupa 31). Opcje zapasowe zapisane w `STYL.md` (Typografia).
6. **Test z referencji 11** — odłożony (PLAN pkt 8, ⏸). Wyjaśnione jej, czym był; nie była pewna, czy potrzebny.

## Następny krok: logo (ikona aplikacji) — próbnik
Jej prośba (2026-11-22, po zamknięciu etapu): logo **na bazie obecnego kroju nazwy** (Corben Bold), zrobione **tak jak próbniki** — sama wybiera na interaktywnej makiecie.
- **Dziś:** `icons/icon.svg` (+ `icon-maskable.svg`, PNG 192/512/maskable-512, `apple-touch-icon.png`) — różowe odręczne „z” z buźką na ciemnym `#22191f`: stara paleta, inny krój. Manifest i `sw.js` (lista plików) wskazują te pliki.
- **Próbnik** `.drafts/makiety/logo-probnik.html` (poza gitem), wzór: `nazwa-probnik.html`. Podgląd na żywo w kontekstach, w których logo żyje: ikona na ekranie telefonu (siatka kilku ikon, zaokrąglony kwadrat iOS, jasny i ciemny ekran), ikona w maskowanym kółku (Android), mała 32 px (karta przeglądarki), plus nagłówek aplikacji obok.
- **Elementy do wyboru (kafle-próbki, bez nazw słownych):** znak — „z”, „z.”, „zk”, „zakamarki.” na dwie linie, sama kropka; tło ikony z jej palety (granat, krem, kobalt, pomidor, róż, lawenda, musztarda, oliwka) i kolor znaku/kropki; suwaki: wielkość znaku, położenie (pion/poziom), obrót (lekko, jak w starym logo), odstęp; przełącznik kropki; ewentualnie buźka/rumieńce z dzisiejszej ikony jako opcja (humor w jednej warstwie — STYL). Corben ładować pełny (nie `&text=`), bo litery się zmieniają.
- **Wynik:** linijka „kopiuj” z ustawieniami → wdrożenie: SVG z literami zamienionymi na ścieżki (żeby ikona nie zależała od fontu; np. opentype.js z CDN w makiecie do eksportu ścieżek albo ręczne wyrysowanie w skrypcie node), potem PNG 192/512/maskable 512/apple-touch 180 (np. `sips`/`rsvg-convert`/node canvas — sprawdzić, co jest w systemie), manifest bez zmian nazw plików, **CACHE +1**, sprawdzić `theme_color`.
- Zasady jak zawsze: jedna decyzja naraz, próbnik zamiast rund (O21), obejrzeć w dużym i małym rozmiarze przed pokazaniem, wersja z serwera `http://[::1]:8000/`.

## Wnioski o współpracy (do stosowania)
- **Próbnik zamiast rund** działa też dla krojów, nie tylko kolorów: po 5 rundach wariantów od nas sama wybrała w 1 podejściu. Przy każdej decyzji „gustu” z dużą przestrzenią — od razu próbnik (O11/O12 potwierdzone).
- Referencja typograficzna dotyczy **kształtu liter**, nie koloru ani nastroju; ozdobne kroje odpadają jako nieczytelne (O20).
- Gdy coś „do poprawki” bez opisu — pokazać 3 kierunki tej jednej rzeczy obok siebie na prawdziwej aplikacji (noc: zadziałało od razu).
- „Zostaw X i Y” = reszta wypada; potwierdzać w odpowiedzi, co wypadło (np. 3 przy rundzie nazw).

## Uwagi techniczne
- Serwer z `.claude/launch.json` (`zakamarki`, python http.server 8000); w panelu adres **`http://[::1]:8000/`** (localStorage próbników jest przypisany do tego adresu).
- Testy w prawdziwej aplikacji: najpierw podmienić funkcje `store` na no-op zwracające `[]` dla `all*/get*` (inaczej `links.load` sypie „all is not iterable”), potem `setReader`/dane w pamięci. Zmiana samego hasha nie przeładowuje strony — do czystego testu `location.reload()`.
- Każdy Write/Edit makiety może otworzyć kartę `file://`/`data:` — sprawdzać `tabs_context` i zwracać `location.href` w wynikach JS (O18).
- CACHE: `zakamarki-v22`.

## Prompt dla kolejnego agenta
```
Pracujemy nad Zakamarkami: osobistym czytnikiem angielskiej Wikipedii (PWA, czysty HTML/CSS/JS, bez frameworka, GitHub Pages). Repozytorium: ~/Projekty/zakamarki (push na main = wdrożenie; hook pre-push uruchamia tools/check.mjs).

Na start:
1. Wywołaj skill task-observer (dziennik: ~/Projekty/.task-observer/observation-log.md); obserwacje OPEN stosuj, zwłaszcza O10–O21.
2. Przeczytaj CLAUDE.md, docs/PLAN.md, docs/STYL.md i handoff docs/handoffs/2026-11-22-014-zakamarki-paleta-i-nazwa.md (sekcja „Następny krok: logo”). Obejrzyj icons/icon.svg i .drafts/makiety/nazwa-probnik.html (wzór próbnika). git status, git log -5.

Zadanie 1 — logo (ikona aplikacji) w kroju nazwy (Corben Bold):
1. Zbuduj próbnik .drafts/makiety/logo-probnik.html (poza gitem), na wzór nazwa-probnik.html: podgląd na żywo w prawdziwych kontekstach (ikona na ekranie telefonu wśród innych, jasny i ciemny ekran, maska kółka Androida, 32 px w karcie, obok nagłówek aplikacji). Do wyboru kaflami/suwakami: znak („z”, „z.”, „zk”, „zakamarki.” na dwie linie, sama kropka), tło i kolor znaku/kropki z palety aplikacji, wielkość, położenie, lekki obrót, kropka tak/nie, opcjonalnie buźka z obecnej ikony. Linijka „kopiuj” z ustawieniami. Przed pokazaniem: obejrzyj w dużym i małym rozmiarze, zamknij karty file://, pokaż z http://[::1]:8000/....
2. Po jej wyborze: SVG z literami jako ścieżkami (niezależny od fontu), PNG 192/512/maskable 512/apple-touch 180, manifest i sw.js bez zmian nazw plików, podbij CACHE, sprawdź na 375 px i w konsoli, commit, push.

Zadanie 2 (potem, najlepiej po krótkim handoffie, jeśli kontekst się wydłuży) — etap 5: Statystyki i Atlas. Zacznij od decyzji z PLAN (pkt 5, „Do ustalenia przed startem”), jedna naraz. Gdzie decyzja jest gustem z dużą przestrzenią — próbnik na prawdziwej aplikacji, nie rundy wariantów.

Zasady: po polsku, krótko, jedna decyzja naraz, 2–3 warianty tylko przy wąskich decyzjach, opcje pokazuj próbką/kształtem/położeniem, bez zdań-pytań w interfejsie. Każdą odpowiedź kończ sekcją „Dalej”. Nigdy nie commituj jej danych. Przy zmianie plików aplikacji podbij CACHE. Na koniec handoff docs/handoffs/…-015-…md, aktualizacja PLAN/STYL, commit, push; pokaż obserwacje task-observer.
```
