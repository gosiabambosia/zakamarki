# Handoff: Zakamarki — koncepcja, decyzje, etap 1

**Data:** 2026-11-16
**Następna sesja zaczyna od:** potwierdzenia, że etap 1 działa na telefonie z prawdziwym API (jeśli nie — debug), potem etap 2.

## Zrobione

- Koncepcja i plan (`docs/PLAN.md`), kontekst dla Claude Code (`CLAUDE.md`).
- Etap 1: wyszukiwarka z podpowiedziami, czytnik z czyszczeniem treści, zapis tropu (ścieżka nad tytułem, cofanie skraca trop), historia, przypinanie, ekran startowy, motyw jasny/ciemny, PWA z ikoną.
- Testy w przeglądarce headless na zamockowanych odpowiedziach API. **Na żywym API Wikipedii jeszcze nie testowane** — pierwsza sesja w Claude Code powinna to zrobić lokalnie.

## Decyzje

1. Własna PWA na GitHub Pages zamiast artefaktu Claude (artefakty nie mogą pobierać danych z zewnętrznych API; aplikacja ma być jej własna).
2. Tylko angielska Wikipedia; interfejs po polsku.
3. Czytnik wewnątrz aplikacji, z pasywnym zapisem ścieżki; ustawienia typografii w etapie 2.
4. Nazwy: aplikacja **Zakamarki** (odrzucone „Tunelarnia” — trudna w mowie); tryby **Trop, Węzły, Przejścia, Osobliwości**; **Parametry**; stany **otwarte / przejrzane / doczytane** (mierzone), **Przypnij** (ręcznie).
5. Ona decyduje i rozumie, Claude pisze kod; jedno pojęcie na etap.
6. Od etapu 2 budowa w Claude Code na Macu, podpiętym do tego repozytorium.

## Otwarte pytanie do etapu 2

Kierunki wizualne: wyjść od czytelności z jej paletą (głębiny, lawenda, bioluminescencja) w akcentach, czy od pełnej estetyki z czytelnością dopracowaną na końcu?
