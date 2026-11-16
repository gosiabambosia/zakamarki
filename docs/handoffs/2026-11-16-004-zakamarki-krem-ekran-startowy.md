# Handoff: Zakamarki — paleta Krem, typografia, nowy ekran startowy

**Data:** 2026-11-16
**Następna sesja zaczyna od:** wyboru ikony spośród 8 płaskich wariantów (`.drafts/plaskie.html`, lokalnie, poza gitem), wygenerowania PNG (192, 512, maskable, apple-touch 180) i ponownej instalacji PWA; potem jej wrażenia z telefonu i etap 3.

## Kontekst

Po Szkliwie przysłała drugi moodboard (Cosmos: kosmos, aury, naiwne malarstwo) i potem inspiracje UI aplikacji do czytania (wielki grotesk, okładki na szklanych półkach, numerowane listy 0.1, bloby z buźkami, pigułki). Z trzech makiet (A lawendowa redakcja, B galeria, C zabawa) wybrała: **kolorystykę i wrażenie C**, **miniatury z A/B**, **typografię A**.

## Zrobione

- Paleta aplikacji **Krem** zamiast Szkliwa (`--pop-pink/orange/mustard/cobalt/lime/ink`, `--on-pop`, `--on-pop-light`, `--surface-2`); wersja nocna (ciepły atrament, `--pop-ink` odwrócony na krem). Tła czytnika bez zmian.
- Kroje: **Inter Tight** (interfejs), **Fraunces Black Soft** tylko dla „Zakamarki” (`&text=Zakamarki`, kilka KB).
- Nagłówek: nazwa + okrągła atramentowa lupa; pole wyszukiwania rozwija się w miejscu nazwy (`.bar.is-searching`), zwija po wejściu w hasło i Esc.
- Ekran startowy: duży nagłówek z mierzonych liczb („6 kroków od hasła „Octopus””, pusto → „Dokąd dziś w głąb?”), pigułka „Czytaj dalej”, **półka przypiętych z miniaturami** (`prop=pageimages`, cache w `zakamarki:thumbs`, brak zdjęcia → kolorowa karta), karta „Ostatni trop” jako lista 0.1… z wyróżnionym bieżącym krokiem, liczba otwartych haseł + chip „N w tym tygodniu”, karta „Ostatnio otwarte”.
- Odmiana liczebników (`plural()`): krok/kroki/kroków, hasło/hasła/haseł.
- `sw.js` → `zakamarki-v6`; manifest i `theme-color` → `#f1e7dc`.
- CLAUDE.md: nowa estetyka (Krem, Inter Tight + Fraunces, płaskie ikony).

## Decyzje

1. Liczby na ekranie startowym tylko mierzone: „otwartych haseł”, nie „przeczytanych” (głębokość czytania dopiero w etapie 3).
2. Bez dolnego paska nawigacji, dopóki nie ma Węzłów/Statystyk (żadnych martwych przycisków).
3. Bloby tematów z makiety C — dopiero przy Statystykach (wymagają modelu tematów).
4. Ikony: płaskie, jeden kolor tła + prosty znak (odrzuciła ilustracyjne i „AI-owe”).

## Ikony do wyboru (lokalnie, `.drafts/plaskie/*.svg`)

Oko z dziurką od klucza (kobalt) · Blob z uśmiechem (musztarda) · Gwiazda-naklejka (róż) · Zakamarek, łuk w łuku (pomarańcz) · Trop do celu (limonka) · Łodzik jedną linią (kobalt) · Grzybek (atrament) · Z we Fraunces (musztarda). Odrzucone wcześniej: ilustracyjne (łodzik, lampa, okno, kometa, grzybnia), gradientowe (aura, portal, planeta, iskra), schodkowe łuki. Kroje odrzucone: Instrument Serif, Bricolage, tęczowy Fraunces.

## Do sprawdzenia

- Szklany pas półki na Androidzie (backdrop-filter) i czytelność podpisów na miniaturach.
- `.drafts/` jest wykluczone z gita (`.git/info/exclude`) — to robocze szkice i makiety.
