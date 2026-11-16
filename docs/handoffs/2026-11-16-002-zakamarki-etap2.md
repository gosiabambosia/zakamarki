# Handoff: Zakamarki — etap 2 (czytnik i typografia)

**Data:** 2026-11-16
**Następna sesja zaczyna od:** jej wrażeń z telefonu (który motyw, czy dymki i panel są wygodne), poprawek wartości kolorów, potem etap 3.

## Zrobione

- Repo sklonowane do `~/Projekty/zakamarki`; `origin` przestawiony na SSH (`git@github.com:gosiabambosia/zakamarki.git`) — push działa kluczem `~/.ssh/id_ed25519`.
- Uzupełnione brakujące `docs/` i `icons/` (przy wgrywaniu przez przeglądarkę nie trafiły do repo, przez co service worker nie mógł się zainstalować — `cache.addAll` odrzuca całość przy jednym 404).
- **Motywy** jako zestawy tokenów w `style.css` (`html[data-theme=…]`): *Lawendowy zmierzch* (jasny), *Głębina* (granat + turkus), *Mgławica* (fiolet + zieleń, poświata). „Jak telefon” = brak atrybutu → zmierzch / głębina według `prefers-color-scheme`. Każdy motyw ma trzy tony tekstu: `--fg`, `--fg-warm`, `--fg-soft`; artykuł używa `--text`.
- **Panel „Aa”** (arkusz od dołu, przycisk przy „Przypnij”): motyw, krój (Literata, Source Serif 4, Atkinson Hyperlegible, systemowy), kolor tekstu, wielkość 14–26 px, interlinia 1.3–2.1, szerokość kolumny 26–48 rem (działa dopiero na tablecie/komputerze). Zapis w `localStorage` `zakamarki:reader`; inline-skrypt w `<head>` ustawia motyw przed pierwszym rysowaniem.
- **Presety**: nazwane zestawy ustawień, maks. 8, ta sama nazwa nadpisuje; `zakamarki:presets`.
- **Przypisy jako dymki**: stuknięcie w `[n]` pokazuje treść przypisu przy odnośniku (pod nim albo nad, gdy brak miejsca); zamyka stuknięcie obok, Esc lub przewinięcie o >60 px (próg, bo chowający się pasek adresu na Androidzie też wywołuje scroll). Linki w dymku działają i dopisują krok tropu.
- **Zwijany infobox**: `cleanArticle()` owija `table.infobox` w `<details>` z nagłówkiem „W skrócie”; zwinięty na telefonie, otwarty od 900 px.
- `sw.js`: `CACHE = 'zakamarki-v3'`.
- Test lokalny na żywym API (Octopus), widok 375 px: panel, motywy, kroje, presety, dymki, infobox; brak błędów w konsoli.

## Decyzje

1. Czytelność najpierw, paleta w akcentach (nagłówek, trop, linki, panel, dymki).
2. Cztery kroje; wszystkie z Google Fonts w jednym arkuszu (plik fontu pobiera się dopiero przy użyciu).
3. Panel jako arkusz od dołu, bez przyciemniania tekstu nad nim.
4. Nazwa nagłówka infoboksu: „W skrócie” (do zmiany, jeśli jej nie pasuje).

## Do sprawdzenia / otwarte

- Na telefonie: czy stuknięcie w `[n]` jest wystarczająco łatwe (cel dotyku jest mały); ewentualnie powiększyć obszar dotyku.
- Kontrast tonu „Przygaszony” w Mgławicy przy małej czcionce — ocenić na żywo.
- Ikony z etapu 1 są robocze, nie podobają się jej — nowe do zaprojektowania (proponowany kierunek: spójne z wybranym motywem).
- Lokalny serwer: `.claude/launch.json` leży w `~/Projekty` (nie w repo). Przy testach lokalnych service worker cache'uje stare pliki — wyrejestruj go w konsoli albo testuj w oknie prywatnym.

## Następne kroki

Etap 3 — Ślad: IndexedDB, pomiar głębokości czytania, minimapa tropu, kolory linków według stanu, karta hasła pod przytrzymaniem linku, eksport/import kopii zapasowej.
