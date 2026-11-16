# Handoff: Zakamarki — paleta Szkliwo i tła czytnika pod astygmatyzm

**Data:** 2026-11-16
**Następna sesja zaczyna od:** jej wrażeń z telefonu (paleta, które tło i grubość pisma się sprawdzają, czy dymki przypisów są wygodne), potem nowe ikony w palecie Szkliwo, potem etap 3.

## Kontekst

Po etapie 2 przysłała moodboard (szklane lampy-grzybki, salon w terakocie, naiwny obraz w różu i lawendzie, haft z koralików na wrzosowym płótnie, kredkowy las na czekoladzie, salon lat 70. z oliwkowym welurem). Wybrała paletę **Szkliwo**. Ma astygmatyzm; dobrze czyta jej się na tle interfejsu Claude. Zażądała rozdzielenia palety aplikacji od motywów czytnika.

## Zrobione

- Dwie niezależne warstwy kolorów w `style.css`:
  - **Szkliwo** (paleta aplikacji): `--bg #fbf1ee`, `--brand` śliwka, kolory `--glaze-pink/orange/teal/mustard/cobalt/plum/red`. Wersja nocna (`html[data-scheme="dark"]`, tło `#221a2b`) — włącza się, gdy tło czytnika jest ciemne.
  - **Tła czytnika** (`html[data-page]`): Papier 13:1, Len 11:1, Szałwia 11.5:1, Lawendowa mgła 12:1, Grafit 10:1, Kakao 10.7:1. „Jak telefon” = Papier / Grafit.
- Elementy na kartce (`.article`, `.attribution`, `.note`) biorą `--surface/--rule/--muted/--link` z tła czytnika; nagłówek, trop i przyciski — ze Szkliwa. W czytniku `body` ma tło kartki (`html[data-view="reader"]`).
- Akcenty Szkliwa: wielokolorowy pasek postępu, bieżący krok tropu różowy, „Aa” pomarańczowe, „Przypięte” morskie, „Gotowe” śliwkowe, kropki przy nagłówkach ekranu startowego.
- Panel „Aa”: **Tło** (7 opcji) zamiast Motywu; **Grubość** (Lżejsza 360 / Zwykła 400 / Pełniejsza 450 / Mocna 500) zamiast Koloru tekstu. Pogrubienia i nagłówki liczone od `--weight`.
- Kroje w wersjach zmiennych (płynna grubość); Atkinson Hyperlegible → **Atkinson Hyperlegible Next**.
- `theme-color` i manifest: `#fbf1ee`. `sw.js`: `zakamarki-v4`.
- Zasada „każdą odpowiedź kończ rekomendacją następnego kroku” — w CLAUDE.md i w pamięci Claude.

## Decyzje

1. Paleta aplikacji: Szkliwo (jedna, bez przełącznika palet).
2. Tła czytnika: sześć zaproponowanych, bez zmian.
3. Ton tekstu usunięty — każde tło ma własny, dobrany kolor tekstu.
4. Zakaz „beż, nude” dotyczy interfejsu, nie tła czytnika.

## Stan / do sprawdzenia

- Przetestowane lokalnie na żywym API (375 px): Papier, Kakao, panel, grubość, ekran startowy w wersji nocnej; konsola czysta.
- Stare ustawienia z telefonu (`theme`, `tone` w `zakamarki:reader`) są ignorowane; tło startuje jako „Jak telefon”.
- Ekran startowy jest jeszcze skromny (tylko kropki w kolorach szkliwa) — rozbudowa naturalnie w etapie 5 (statystyki).
- Lokalnie: przeglądarka trzyma stare pliki w HTTP cache mimo wyrejestrowania service workera — przed testem `fetch(plik, {cache:'reload'})` dla plików aplikacji albo okno prywatne.

## Następne kroki

1. Ikony w palecie Szkliwo (obecne z etapu 1 są robocze i jej się nie podobają).
2. Etap 3 — Ślad (IndexedDB, pomiar głębokości, minimapa tropu, kolory linków według stanu, karta hasła, kopia zapasowa).

## Poprawka: aktualizacja na telefonie (ta sama sesja)

Na zainstalowanej PWA (Android, Chrome) dalej była stara paleta. Przyczyna: service worker „najpierw pamięć” + `Cache-Control: max-age=600` z GitHub Pages — nowy SW przy instalacji mógł zapisać do pamięci stare pliki z HTTP cache, a nowa wersja pojawiała się dopiero po kilku otwarciach. Zmiana (`sw.js` v5): strategia **najpierw sieć** z `cache: 'no-cache'` (pamięć tylko offline), instalacja z `cache: 'reload'`, a `app.js` przeładowuje stronę raz, gdy nowy SW przejmie kontrolę (`controllerchange`). Telefon ze starym SW potrzebuje jeszcze jednego-dwóch pełnych zamknięć i otwarć, potem aktualizacje są natychmiastowe.
