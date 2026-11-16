# Handoff: Zakamarki — ikona „Z z buźką”, stan po etapie 2

**Data:** 2026-11-16
**Następna sesja zaczyna od:** jej wrażeń z telefonu (ekran startowy Krem, półka z miniaturami, ikona), drobnych poprawek, potem **etap 3 — Ślad**, zaczynając od eksportu/importu kopii zapasowej.

## Zrobione w tej sesji

- Wybrała ikonę **bąbelkowe Z z buźką** (z serii „ręcznej”), z uwagami: tło nie ma udawać papieru, ozdobniki nie mogą siedzieć przy krawędziach, ma być czytelna jako logo i zgodna z paletą.
- Przerysowana od zera, czysto: różowe Z (`#f6b3d3`, pociągnięcie 96 px z zaokrąglonymi łączeniami, obrót −6°), buźka atramentem (zamknięte oczy + uśmiech, kreska 15 px — widoczna jeszcze w 32 px), musztardowa iskra i limonkowa kropka **w pustych miejscach po bokach litery**, wszystko w kole r=205 wokół środka.
- Tło: **atrament `#22191f`** — porównane z kobaltem i kremem: kontrast różu do tła ~10:1 (kobalt ~3,6:1, krem — róż ginie). Powtarza atramentowe pigułki interfejsu.
- Pliki: `icons/icon.svg` (źródło), `icon-512.png`, `icon-192.png`, `apple-touch-icon.png` (180), `icon-maskable-512.png` (grafika pomniejszona do 82%), `icons/icon-maskable.svg`. PNG renderowane na Macu przez Quick Look: `qlmanage -t -s 512 -o KATALOG icons/icon.svg`.
- Manifest: ikony `any` + osobna `maskable` + SVG; `index.html`: favicon SVG + PNG; `sw.js` → `zakamarki-v7` z nowymi plikami. Lokalnie sprawdzone: SW instaluje się ze wszystkimi plikami, strona przeładowuje się raz po aktualizacji.

## Stan projektu

- **Etap 1** ✅ szkielet, PWA. **Etap 2** ✅ czytnik i typografia: panel „Aa” (6 teł pod astygmatyzm + „Jak telefon”, 4 kroje, grubość, wielkość, interlinia, szerokość, presety), przypisy jako dymki, zwijany infobox.
- Poza planem, w etapie 2: tożsamość wizualna — paleta Krem, Inter Tight + Fraunces Black Soft, nowy ekran startowy (półka z miniaturami, trop 0.1…, liczby), ikona.
- Szkice i makiety (odrzucone ikony, warianty UI, wideo z inspiracjami) leżą w `.drafts/` — lokalnie, wykluczone z gita.

## Ikona na telefonie

Chrome na Androidzie sam sprawdza manifest zainstalowanej aplikacji (zwykle przy uruchomieniu, najwyżej raz na dobę) i przy zmianie ikony pokazuje okno z prośbą o zgodę na aktualizację. **Nie odinstalowywać aplikacji**, dopóki nie ma eksportu kopii zapasowej (etap 3) — nie mamy pewności, że reinstalacja zachowa dane w pamięci przeglądarki.

## Kolejne kroki (w tej kolejności)

1. **Test na telefonie (ona):** ekran startowy Krem, półka (przypiąć 3–4 hasła), szklany pas na Androidzie, czytelność podpisów na miniaturach, wieczorem tło Kakao/Grafit + „Pełniejsza”; zapisać presety „Dzień”/„Wieczór”; potwierdzić aktualizację ikony, gdy Chrome zapyta.
2. **Poprawki po teście** — krótka sesja.
3. **Etap 3 — Ślad**, proponowana kolejność:
   1. **Eksport/import kopii zapasowej** (plik JSON z historią, tropem, przypiętymi, ustawieniami) — najpierw, bo chroni dane przed wszystkim, co dalej (migracja, reinstalacja, czyszczenie Safari na iPadzie).
   2. Migracja z localStorage do **IndexedDB** (pojęcie etapu) z zachowaniem starych danych.
   3. **Pomiar głębokości czytania**: przewinięcie + czas → otwarte / przejrzane / doczytane; wtedy na ekranie startowym „przeczytanych”, nie tylko „otwartych”.
   4. **Kolory linków według stanu** (przeczytane / nieprzeczytane / węzeł) i **minimapa tropu**.
   5. **Karta hasła pod przytrzymaniem linku** (miniatura, opis, metryki: wersje językowe, długość; które przeczytane tu prowadzą).
4. Później: etap 4 Trop i Węzły (pierwsze rekomendacje z uzasadnieniem), etap 5 Statystyki i Atlas (tu bloby tematów z makiety C), 6 Przejścia/Osobliwości/Parametry, 7 Myślnia.

## Otwarte decyzje na start etapu 3

- Progi stanów czytania (np. „przejrzane” = ≥30% przewinięcia lub ≥45 s; „doczytane” = ≥85% i czas zgodny z długością tekstu) — zaproponować z rekomendacją.
- Kolory linków: trzy stany muszą być rozróżnialne nie tylko kolorem (astygmatyzm, czytelność) — np. kolor + styl podkreślenia.
