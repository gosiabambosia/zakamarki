# Zakamarki — kierunek wizualny i UX

Ten plik zbiera to, co właścicielka pokazała w referencjach i co z nich wybrała. **Czytaj go przed każdą zmianą wyglądu, nowym ekranem albo nową grafiką.** Jeśli coś tu jest sprzeczne z jej nową prośbą, wygrywa prośba, a ten plik trzeba zaktualizować.

Same obrazki z referencjami leżą lokalnie w `.drafts/inspiracje/` (poza gitem, bo to cudze prace, a repozytorium jest publiczne). Poniżej są opisane słowami, żeby kierunek był dostępny także bez nich.

## W jednym zdaniu

Kremowa, zabawna, redakcyjna: duża pewna typografia, spokojna baza, kolor z treści (miniatury haseł) i z kilku nasyconych akcentów, do tego odrobina humoru (buźki, bloby, iskry) — ale czytnik zawsze najpierw czytelny.

## Co lubi (z referencji)

- **Moodboard 1 (wnętrza, przedmioty):** szklane lampy-grzybki w cukierkowych kolorach, salon w terakocie, naiwny obraz w różu, lawendzie i czerwieni, haft z koralików na wrzosowym płótnie, kredkowy las grzybów na czekoladowym tle, salon lat 70. z oliwkowym welurem i pomidorowymi lampami. Wspólne: ciepło, nasycenie, retro, rękodzieło, przytulność.
- **Moodboard 2 (Cosmos):** kosmos, aury i tęczowe poświaty, stare ryciny astronomiczne (kometa, Plejady), naiwne malarstwo wnętrz, magazyn w stylu A24 z ziarnem i neonem.
- **Inspiracje UI:** aplikacje do czytania i biblioteki: wielki ciasny grotesk jako bohater ekranu („You Have 12 New Books”), okładki stojące na półkach z kolorowego szkła, numerowane listy 0.1 / 0.2, pigułki z licznikami, wielkie liczby, pływające przyciski, aplikacja z blobami z buźkami na kremowym tle.
- **Inspiracje ikon/grafik:** doodle piórkiem (drżąca kreska, rumieńce, postaci z minimum rysów, stemple: kremowa sylwetka na pełnym kolorze), wycinanki w stylu Matisse'a z buźkami, gwaszowe kafle z kwiatami i iskrami.

## Czego nie chce

- Beż-minimalizmu i „nude” w interfejsie (czytnik to wyjątek, patrz niżej).
- Wyglądu „jak z AI”: gładkich gradientów, poświat, cieniowania udającego 3D, idealnie symetrycznych figur, tęcz jako ozdoby, losowych avatarów.
- Faktur udających papier na ikonach i logo.
- Cienkich, eleganckich szeryfów (odrzucone: Instrument Serif) i zwyczajnych groteskow w nazwie (odrzucony: Bricolage Grotesque); tęczowego tekstu.
- Nazw funkcji z „osobowością” (odrzucone: „wessało”, „dzika karta”) — nazwy opisują operację.

## Wybrane rozwiązania

### Dwie warstwy kolorów
1. **Paleta aplikacji „Krem”** — nagłówek, ekran startowy, przyciski, panele.
   - Baza: krem `#f1e7dc`, karty `#fff8f0`, atrament `#22191f` (tekst i czarne pigułki).
   - Akcenty (`--pop-*`): róż `#f6b3d3`, musztarda `#f2c230`, limonka `#c9dd6b`, kobalt `#2d54e0`, pomarańcz `#e8622c`.
   - Nocą: ciepły atrament `#1f1a1c`, pastele bez zmian, atramentowe pigułki odwrócone na krem.
   - Akcenty dawkuj: jeden–dwa na ekran plus miniatury. Tekst na jasnym akcencie — atrament; na kobalcie/pomarańczu/atramencie — krem.
2. **Tło czytnika** — tylko kartka z tekstem, wybierane pod oczy (astygmatyzm): Papier, Len, Szałwia, Lawendowa mgła, Grafit, Kakao. Kontrast 10–13:1 zamiast 21:1, bez czystej bieli i czerni, ciemne tła szarobrązowe z tekstem w kolorze kości słoniowej. Ciemne tło przełącza paletę aplikacji na nocną.

### Typografia
- **Inter Tight** w całym interfejsie. Nagłówki ekranów duże i ciasne (np. 2,4–3,3 rem, `letter-spacing` ok. −0,035em, waga 600), reszta 400–600.
- **Fraunces Black Soft** (waga 900, SOFT 100) tylko w nazwie „Zakamarki” — ładowany z `&text=Zakamarki`.
- W czytniku kroje do wyboru: Literata (domyślna), Source Serif 4, Atkinson Hyperlegible Next, systemowy; płynna grubość.

### Wzorce UI
- Ekran zaczyna się od **dużego zdania z prawdziwych liczb** („6 kroków od hasła „Octopus””). Każda liczba musi być pomiarem — nigdy dekoracją.
- **Miniatury haseł jako okładki** (zdjęcie główne z Wikipedii) na **półce z kolorowego szkła**; brak zdjęcia → karta w kolorze akcentu z tytułem.
- **Numerowane listy 0.1, 0.2…** dla tropu i kolejności; bieżący element wyróżniony akcentem.
- **Karty** `#fff8f0` z dużym zaokrągleniem (ok. 22 px); **pigułki** (czarna = akcja główna, kolorowe = chipy z licznikami); **okrągłe przyciski** z ikoną.
- **Wielkie liczby** w statystykach.
- **Bloby** (organiczne kształty, wielkość = ilość) — zarezerwowane na Statystyki/Atlas, gdy będą prawdziwe dane o tematach.
- **Bez martwych przycisków**: nie dodawać nawigacji do funkcji, których jeszcze nie ma.
- Humor w jednej warstwie (buźka w ikonie, iskra, kropka), reszta porządna i czytelna.

### Grafika i ikony
- **Ikona aplikacji:** bąbelkowe różowe „Z” z buźką (zamknięte oczy, uśmiech) na atramencie, musztardowa iskra i limonkowa kropka po bokach litery. Źródło `icons/icon.svg`.
- Zasady ikon i logo: płaskie, **pełne tło bez faktury**, jeden wyraźny znak, kontrast znaku do tła wysoki (róż/atrament ok. 10:1), **wszystko w środkowym kole** (80% średnicy; Android przycina), wersja maskable pomniejszona do 82%, test czytelności w 32–48 px.
- Inne ilustracje (puste stany, statystyki): kierunek z inspiracji ikon — nierówna, ręczna krawędź, minimum rysów, rumieńce, stemple/wycinanki; bez gradientów i poświat.

### Czytelność ponad wszystko w czytniku
- Estetyka w czytniku tylko w akcentach (trop, przyciski, dymki, panel „Aa”).
- Stany i oznaczenia nie mogą polegać wyłącznie na kolorze (np. kolor + styl podkreślenia), bo właścicielka ma astygmatyzm.

## Jak proponować zmiany wyglądu

- Pokazuj **2–3 konkretne warianty na żywo** (makieta HTML w przeglądarce albo w aplikacji), z rekomendacją, nie opisy.
- Zanim pokażesz, **obejrzyj sama w pełnym i małym rozmiarze** i popraw oczywiste błędy (przycięcia, nachodzenie, nieczytelność).
- Przy nowych referencjach: wyciągnij wspólny język (co łączy obrazy), dopisz do sekcji „Co lubi” i zaproponuj, co z tego przenieść.
