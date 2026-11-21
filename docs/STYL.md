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

## Jak przetwarza (ważne przy każdym ekranie)

- **Przetwarza w dużej części pozawerbalnie.** Słowne nazwy opcji („Lżejsza”, „Pełniejsza”, „Jak telefon”, „Lawendowa mgła”) są dla niej przytłaczające i nieintuicyjne. Opcje pokazuj **próbką** (kolor, „Aa” w danym kroju i grubości, ikona), nazwy zostaw tylko w `aria-label`/`title`.
- Podobnie brzmiące etykiety („Czytaj dalej” / „Chcę przeczytać”) mylą się — rozróżniaj stany **kształtem, położeniem, wypełnieniem**, nie tylko słowem. Mile widziane rozwiązania unikatowe, „szyte na miarę”, czerpiące z referencji.
- Nie lubi zdań-pytań i tekstów, które „brzmią jak AI” („Dokąd dziś w głąb?” — odrzucone).
- **Ale czytelność ponad pozawerbalność (2026-11-18):** projektuj z myślą o dalszym rozwoju — kategorie muszą być czytelne i wygodne, żeby nie pogubić się po dodaniu kolejnych funkcji. Jeśli sygnał bez słów robi chaos, wygrywa **prosta nazwa**. Jedno słowo na jeden stan i to samo wszędzie (półka, przycisk w czytniku, statystyki): *Czytam · Na później · Przeczytane*.

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
   - Akcenty (`--pop-*`): róż `#f6b3d3`, musztarda `#f2c230`, limonka `#c9dd6b`, kobalt `#2d54e0`, pomarańcz `#e8622c`, **liliowy `#b48cf0`** (fiolet ze Szkliwa w wersji pastelowej, od 2026-11-18: półka Przeczytane, karty bez zdjęcia).
   - Nocą: ciepły atrament `#1f1a1c`, pastele bez zmian, atramentowe pigułki odwrócone na krem.
   - Akcenty dawkuj: jeden–dwa na ekran plus miniatury. Tekst na jasnym akcencie — atrament; na kobalcie/pomarańczu/atramencie — krem.
2. **Tło czytnika** — tylko kartka z tekstem, wybierane pod oczy (astygmatyzm): Papier, Len, Szałwia, Lawendowa mgła, Grafit, Kakao. Kontrast 10–13:1 zamiast 21:1, bez czystej bieli i czerni, ciemne tła szarobrązowe z tekstem w kolorze kości słoniowej. Ciemne tło przełącza paletę aplikacji na nocną.

### Typografia
- **Inter Tight** w całym interfejsie. Nagłówki ekranów duże i ciasne (np. 2,4–3,3 rem, `letter-spacing` ok. −0,035em, waga 600), reszta 400–600.
- **Fraunces Black Soft** (waga 900, SOFT 100) tylko w nazwie „Zakamarki” — ładowany z `&text=Zakamarki`.
- W czytniku kroje do wyboru: Literata (domyślna), Source Serif 4, Atkinson Hyperlegible Next, systemowy; płynna grubość.

### Wzorce UI
- Ekran startowy zaczyna się od **wielkiej kobaltowej liczby dnia** („7 haseł dziś”, obok druga linijka „2 tropy · 214 w sumie”; obie linijki wyrównane do dołu liczby), pod nią **karta „Czytaj dalej”**: miniatura na całą wysokość z lewej (jak okładka, nie wklejka), tytuł, „14 min temu · 4. krok tropu”, okrągła atramentowa strzałka. Każda liczba musi być pomiarem — nigdy dekoracją. Odrzucone: duży tytuł + mała miniatura obok („jak źle wstawione zdjęcie w Wordzie”), „N kroków od hasła”.
- **Panel „Aa”**: na wierzchu kafle presetów w ich kolorach, kroju i grubości (nazwy presetów są jej, więc zostają); pod „Dostosuj” rzędy próbek bez podpisów: tła (kafel „Aa” w kolorze tekstu na tle; „Jak telefon” = pół jasny, pół ciemny), kroje („Ag”), grubości („Aa”), suwaki z małą/dużą literą i ikoną interlinii.
- **Pływające przyciski w czytniku (P2):** od 300 px stale różowe kółko z grubą strzałką ← (ikona SVG, nie znak tekstowy — za mało wyraźny) w lewym dolnym rogu; przewijanie w górę rozwija je w pigułkę z nazwą poprzedniego kroku i pokazuje okrągły atramentowy „↑”.
- **Trzy półki na starcie (W7 + O1):** nad półką nazwa, liczba i okrągła strzałka (rozwija siatkę). *Czytam*: okładki napełnione kolorowym szkłem do poziomu przeczytanych akapitów (lampy-grzybki), liczba „22/41” na szkle, deska pod okładkami, tytuł pod okładką. *Na później* (musztarda) i *Przeczytane* (liliowy): okładki z miękkim cieniem za matową taflą plexi, tytuł na szkle, **bez śrub**. Odrzucone: szafka o trzech poziomach, ściana z pinezkami + stos grzbietów, okładki w bałaganie, różne wysokości.
- **Zakładka powrotu:** różowy pionowy znaczek z obrysem w kolorze tekstu na marginesie przy pierwszym nieprzeczytanym akapicie.
- **Mapa tropu (M4 Drzewo, 2026-11-21):** arkusz od dołu jak spis treści — każde hasło stoi pod tym, z którego do niego przyszłaś (wcięcie + cienka, przygaszona kreska „└”), znak stanu przed tytułem, bieżące hasło na różowym tle, skok = przerywana kreska i etykieta „skok”. Odrzucone: linia metra M2 (przy czytaniu „gwiazdą” łuki z jednego punktu nakładały się, linie za ciężkie), gromady M5, lekka linia M6. W karcie Tropy pod każdym tropem rząd kropek.
- **Karta hasła pod przytrzymaniem linku:** mała (≤ 46% ekranu), bez przyciemniania, znika po stuknięciu obok; mała miniatura, opis, dwa zdania wstępu, słowa i czas czytania, Otwórz / Na później. Bez liczby języków i wyświetleń (nie chce).
- **Trop nad artykułem**: bieżący krok różowy, kroki „przed tobą” (po cofnięciu) przygaszone, skok z wyszukiwarki z przerywaną ramką.
- **Linki według stanu hasła** (wdrożone): kropka po linku — pusty krążek = przejrzane, pełny + przygaszony kolor = doczytane (wariant L2). Te same znaki na mapie tropu i w kresce tropu.
- **Miniatury haseł jako okładki** (zdjęcie główne z Wikipedii); brak zdjęcia → karta w kolorze akcentu z pierwszą literą (lubi te losowe kolory z palety).
- **Kolumna wyjustowana (2026-11-21):** tekst wyrównany do obu krawędzi z dzieleniem wyrazów (`lang` na artykule i tytule); duże zdjęcia na **całą szerokość kolumny** (wyrównane do krawędzi tekstu, wysokie najwyżej ¾ ekranu), małe (ikony, herby) na środku w swoim rozmiarze.
- **Lista Tropy (N2, 2026-11-21):** po lewej **dzień** tropu (dziś, wczoraj, 18 lis) zamiast numeru 0.1, 0.2 — numer pozycji niczego nie mierzył i dezorientował. Jeden wiersz na **rodzinę tropu** (trop z odgałęzieniami), z liczbą haseł i odgałęzień; nagłówek rozwija wszystkie. Numeracja 0.1 z inspiracji odrzucona.
- **Karty** `#fff8f0` z dużym zaokrągleniem (ok. 22 px); **pigułki** (czarna = akcja główna, kolorowe = chipy z licznikami); **okrągłe przyciski** z ikoną.
- **Wielkie liczby** w statystykach.
- **Bloby** (organiczne kształty, wielkość = ilość) — zarezerwowane na Statystyki/Atlas, gdy będą prawdziwe dane o tematach.
- **Bez martwych przycisków**: nie dodawać nawigacji do funkcji, których jeszcze nie ma.
- Humor w jednej warstwie (buźka w ikonie, iskra, kropka), reszta porządna i czytelna.

### Zakreślenia i dolny pasek (etap 3b, 2026-11-21)
- **Pasek zaznaczenia (Z1)** od dołu, pod kciukiem: pięć kółek-kolorów bez podpisów, × zamyka; przy jednym angielskim słowie znaczenia z Wikisłownika, przy frazie przycisk „Tłumacz”. Systemowe menu Androida zostaje nad zaznaczeniem.
- **Wygląd zakreślenia (K2):** marker od 1/3 wysokości liter po dolną kreskę, zaokrąglone końce, litery w kolorze tekstu. Odrzucone: B1/K1 (za nisko), B2 (za ciężkie), K3, K4 (ręczny flamaster — podobał się mniej niż równy K2).
- **Paleta zakreślaczy „Lampy” (P2):** morska zieleń `#7ccfb9`, niebieski `#93b6f5`, morela `#f4a77f`, wrzos `#d59be0`, cytryna `#ece06a` — własna rodzina z lamp-grzybków z moodboardu, **nie powtarza akcentów interfejsu** (jej uwaga: te same kolory na miniaturach, półkach i w zakreśleniach to za dużo powtórzeń). Przezroczystość 55% w dzień, 40% na ciemnych tłach.
- **Dolny pasek ekranów (C1):** pływająca pigułka z okrągłymi przyciskami, tylko poza czytnikiem; aktywny ekran = atramentowe kółko. Biblioteka (grzbiety książek) i **Zakreślenia — gruby, okrągły cudzysłów** z dwóch prostych kształtów (kółko + ogonek), bez drobnych końcówek, które w małym rozmiarze wyglądają jak błąd. Kolejne kółka: Węzły, Statystyki.
- **Chip PL** obok „Aa”: obrys w kolorze tekstu w angielskim haśle, wciśnięty (pełny) w polskim.
- **Ekran Zakreślenia:** wielka kobaltowa liczba, filtr kolorem (kółka z licznikami, „wszystkie”), karty grup po tropach z dniem po lewej, cytat w markerze w kroju czytnika, „Prowadzą do tego samego” na dole.

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
