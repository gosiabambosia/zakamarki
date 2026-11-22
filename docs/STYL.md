# Zakamarki — kierunek wizualny i UX

Ten plik zbiera to, co właścicielka pokazała w referencjach i co z nich wybrała. **Czytaj go przed każdą zmianą wyglądu, nowym ekranem albo nową grafiką.** Jeśli coś tu jest sprzeczne z jej nową prośbą, wygrywa prośba, a ten plik trzeba zaktualizować.

Same obrazki z referencjami leżą lokalnie w `.drafts/inspiracje/` (poza gitem, bo to cudze prace, a repozytorium jest publiczne). Poniżej są opisane słowami, żeby kierunek był dostępny także bez nich.

## W jednym zdaniu

Ciepła, wnętrzarska, redakcyjna: duża pewna typografia, beżowa baza z postarzonymi akcentami (paleta Wnętrze o zachodzie), kolor z treści (miniatury haseł) i z kilku nasyconych akcentów, do tego odrobina humoru (buźki, bloby, iskry) — ale czytnik zawsze najpierw czytelny.

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

- Beż-minimalizmu i „nude” **bez akcentów** (beżowa baza Wnętrza jest w porządku, bo niesie wyraźne akcenty i miniatury).
- Wyglądu „jak z AI”: gładkich gradientów, poświat, cieniowania udającego 3D, idealnie symetrycznych figur, tęcz jako ozdoby, losowych avatarów.
- Faktur udających papier na ikonach i logo.
- Cienkich, eleganckich szeryfów (odrzucone: Instrument Serif) i zwyczajnych groteskow w nazwie (odrzucony: Bricolage Grotesque); tęczowego tekstu.
- Nazw funkcji z „osobowością” (odrzucone: „wessało”, „dzika karta”) — nazwy opisują operację.

## Wybrane rozwiązania

### Dwie warstwy kolorów
1. **Paleta aplikacji (wybrana sama, kolor po kolorze, 2026-11-22, próbnik `.drafts/makiety/probnik.html`; `zakamarki-v21`).** Kolory z jej palet Procreate i z Figmy. Zastąpiła „Wnętrze o zachodzie” (historia niżej).
   - Dzień: Tło `#fffcf5`, Kartka `#fffdf7` (prawie zlewa się z tłem), Piasek `#ece7df` i Linia/deska `#d7cfc5` (tło z brązem 12% i 26%), Tusz **granat `#05094d`** (tekst, nazwa, przyciski główne), Szept `#495a87` (granat rozjaśniony tłem), liczby w kobalcie `#2b46b8`.
   - Akcenty bez zmian: trop `#d98aa3`, Aa pomidor `#d0472f`, Na później musztarda `#d6a11e`. Usunięte nieużywane: oliwka i śliwka `--pop-*`, chipy.
   - **Okładki bez zdjęcia: sześć barw kolejno** (`--cover-1…6`, `COVER_COLORS` w `app.js`): róż `#f6b3d3`, kobalt `#2b46b8`, pomidor `#d0472f`, musztarda `#d6a11e`, oliwka `#75852b`, lawenda `#afa2f6`. Litera i liczba na szkle według kontrastu (`--cover-ink-N`: krem na kobalcie i pomidorze, granat na reszcie).
   - **Szkło (wariant 1):** szkło ma barwę okładki, 88% krycia — na zdjęciu i bez zdjęcia ten sam odcień (jej prośba: jedna barwa = jedno szkło, jak na Letchworth). Okładka bez zdjęcia pod szkłem rozjaśniona (barwa 42% + `--cover-wash`), szkło pełne: dolna jasna, wierzchnia pełna.
   - Zakreślacze (wybrane w próbniku): chaber `#7b98e5`, róż `#e99fb6`, łosoś `#ffaf9e`, morela `#f6d19a`, szałwia `#adbb7c`. Róż i morela są blisko akcentów (trop, musztarda) — na żywo jej to nie przeszkadzało.
   - **Noc: granat** (wybrany z 3 wariantów w `.drafts/makiety/noc.html`: ciepły grafit, granat, śliwka): Tło `#0f1230`, Kartka `#191d3a`, Głębia `#222741`, Linia `#30344d`, tekst krem `#f2ead9`, liczby `#9fb0f0`; okładki rozjaśnione w tej samej barwie, litery granatowe; okładka pod szkłem rozjaśniana kolorem karty, nie bielą.
   - **Szew nocą rozwiązany:** w czytniku nocą nagłówek i pasek telefonu biorą kolor kartki (Kakao, Grafit); na starcie granat (`syncThemeColor()` w `app.js`).
   *Historia — „Wnętrze o zachodzie” (2026-11-22, krótko):* Tło `#efe2d1`, Kartka `#faf2e8`, Tusz `#2a1c17`, akcenty postarzone, okładki Szkliwo (`#d48e98`, `#d4a965`, `#81b297`, `#6e97bb`, `#c0765d`), szkło na okładce bez zdjęcia jako jasna mgła; noc śliwkowa `#1a1420`; zakreślacze Lampy.
   - **Uwaga:** brief ma też elementy wcześniej odrzucone (numeracja 0.1, Instrument Serif) — te odrzucenia obowiązują dalej.

   *Historia — paleta „Krem” (do 2026-11-22):* nagłówek, ekran startowy, przyciski, panele.
   - Baza: krem `#f1e7dc`, karty `#fff8f0`, atrament `#22191f` (tekst i czarne pigułki).
   - Akcenty (`--pop-*`): róż `#f6b3d3`, musztarda `#f2c230`, limonka `#c9dd6b`, kobalt `#2d54e0`, pomarańcz `#e8622c`, **liliowy `#b48cf0`** (fiolet ze Szkliwa w wersji pastelowej, od 2026-11-18: półka Przeczytane, karty bez zdjęcia).
   - Nocą: ciepły atrament `#1f1a1c`, pastele bez zmian, atramentowe pigułki odwrócone na krem.
   - Akcenty dawkuj: jeden–dwa na ekran plus miniatury. Tekst na jasnym akcencie — atrament; na kobalcie/pomarańczu/atramencie — krem.
2. **Tło czytnika** — tylko kartka z tekstem, wybierane pod oczy (astygmatyzm): Papier, Len, Szałwia, Lawendowa mgła, Grafit, Kakao. Kontrast 10–13:1 zamiast 21:1, bez czystej bieli i czerni, ciemne tła szarobrązowe z tekstem w kolorze kości słoniowej. Ciemne tło przełącza paletę aplikacji na nocną.

### Typografia
- **Inter Tight** w całym interfejsie. Nagłówki ekranów duże i ciasne (np. 2,4–3,3 rem, `letter-spacing` ok. −0,035em, waga 600), reszta 400–600.
- **Nazwa „zakamarki✦” (2026-11-22, `zakamarki-v24`–`v25`):** **Corben Bold** 700, 23,5 px, **odstęp −0,025 em (jak w logo; v26 — przy −0,04 „z” i „a” zachodziły)**, małymi, granat `--brand`; zamiast kropki **miękka gwiazda z ikony** (inline SVG `.brand .star`, 0,7×0,86 em, odstęp 0,16 em — v25, bo mniejsza „gubiła się”; środek gwiazdy = środek małych liter (x-height Corben 0,633 em), v26; ten sam kształt co w `icon.svg`) w pomidorze (`--pop-orange`; nocą krem i jasny pomidor). Do v23: kropka i odstęp −0,005 em. Ładowany z `&text=zakamarki.`. Wybrana sama w próbniku `.drafts/makiety/nazwa-probnik.html` (49 krojów, suwaki wielkości i odstępu, kolor nazwy i kropki, dzień/noc). Słowo bez dolnych wydłużeń → `.brand` przesunięta o 0,1 em w dół, żeby tusz stał na środku lupy. Wcześniej: Fraunces Black Soft „Zakamarki”.
- **Opcje zapasowe nazwy (jej wybory z próbnika, wszystkie granat + kropka `#d0472f`):**
  - Poppins 800 · 27 px · odstęp +0,02 em
  - Playfair Display 900 · 30 px · +0,02 em
  - Abril Fatface 400 · 30 px · +0,02 em
  - Fraunces 820 (opsz 144, SOFT 100, WONK 0) · 32,5 px · +0,02 em
  - Wcześniej też podobały się: Gluten 800 (26,5 px), Bricolage Grotesque 800 (wcięcia w łukach — „koncept”), Unbounded 700. Odrzucone jako mało czytelne: Ultra, Shrikhand, Bagel Fat One, Syne, Recursive Casual, Playwrite PL.
- **Plansza nazwy (2026-11-22, jej referencja):** ulubione = Fraunces SuperSoft Black z kropką „zakamarki.”, Paytone One, Niamoy Script, „Margith” (nazwa niezweryfikowana). Wspólne cechy: **małe litery** (wszystkie wersje z wielkim Z bez kropki), duża grubość, miękkie/okrągłe zakończenia, niski kontrast kresek, ciepło lat 70.; ręka (kursywa) jako druga, osobista nuta. Nie wybrane: wysoki kontrast (didony), faktura „postarzona”, cienka odręczna kreska, neutralny geometryczny grotesk. Kolor nazwy na planszy: kobalt. Kierunki K1–K5 w `.drafts/makiety/typografia.html` (zamknięte próbnikiem nazwy, wyżej).
- W czytniku kroje do wyboru: Literata (domyślna), Source Serif 4, Atkinson Hyperlegible Next, systemowy; płynna grubość.

### Wzorce UI
- Ekran startowy zaczyna się od **wielkiej kobaltowej liczby dnia** („7 haseł dziś”, obok druga linijka „2 tropy · 214 w sumie”; obie linijki wyrównane do dołu liczby), pod nią **karta „Czytaj dalej”**: miniatura na całą wysokość z lewej (jak okładka, nie wklejka), tytuł, „14 min temu · 4. krok tropu”, okrągła atramentowa strzałka. Każda liczba musi być pomiarem — nigdy dekoracją. Odrzucone: duży tytuł + mała miniatura obok („jak źle wstawione zdjęcie w Wordzie”), „N kroków od hasła”.
- **Panel „Aa”**: na wierzchu kafle presetów w ich kolorach, kroju i grubości (nazwy presetów są jej, więc zostają); pod „Dostosuj” rzędy próbek bez podpisów: tła (kafel „Aa” w kolorze tekstu na tle; „Jak telefon” = pół jasny, pół ciemny), kroje („Ag”), grubości („Aa”), suwaki z małą/dużą literą i ikoną interlinii.
- **Pływające przyciski w czytniku (P2):** od 300 px stale różowe kółko z grubą strzałką ← (ikona SVG, nie znak tekstowy — za mało wyraźny) w lewym dolnym rogu; przewijanie w górę rozwija je w pigułkę z nazwą poprzedniego kroku i pokazuje okrągły atramentowy „↑”.
- **Trzy półki na starcie (W7 + O1):** nad półką nazwa, liczba i okrągła strzałka (rozwija siatkę). *Czytam*: okładki napełnione kolorowym szkłem do poziomu przeczytanych akapitów (lampy-grzybki), liczba „22/41” na szkle, deska pod okładkami, tytuł pod okładką. *Na później* (musztarda) i *Przeczytane* (liliowy): okładki z miękkim cieniem za matową taflą plexi, tytuł na szkle, **bez śrub**. Odrzucone: szafka o trzech poziomach, ściana z pinezkami + stos grzbietów, okładki w bałaganie, różne wysokości.
- **Zakładka powrotu:** różowy pionowy znaczek z obrysem w kolorze tekstu na marginesie przy pierwszym nieprzeczytanym akapicie.
- **Mapa tropu (M4 Drzewo, 2026-11-21):** arkusz od dołu jak spis treści — każde hasło stoi pod tym, z którego do niego przyszłaś (wcięcie + cienka, przygaszona kreska „└”), znak stanu przed tytułem, bieżące hasło na różowym tle, skok = przerywana kreska i etykieta „skok”. Odrzucone: linia metra M2 (przy czytaniu „gwiazdą” łuki z jednego punktu nakładały się, linie za ciężkie), gromady M5, lekka linia M6. W karcie Tropy pod każdym tropem rząd kropek.
- **Karta hasła pod przytrzymaniem linku:** mała (≤ 46% ekranu), bez przyciemniania, znika po stuknięciu obok; mała miniatura, opis, dwa zdania wstępu, słowa i czas czytania, Otwórz / Na później. Bez liczby języków i wyświetleń (nie chce).
- **Nagłówek hasła (T1, 2026-11-22):** tytuł na całą szerokość, pod nim przyciski PL / Aa / Na później; tytuł **nigdy się nie dzieli** (odrzucone: dzielenie z łącznikiem „Letch-worth”, przyciski nad tytułem T2, zmniejszanie tytułu T3).
- **Trop nad artykułem**: bieżący krok różowy, kroki „przed tobą” (po cofnięciu) przygaszone, skok z wyszukiwarki z przerywaną ramką.
- **Linki według stanu hasła** (wdrożone): kropka po linku — pusty krążek = przejrzane, pełny + przygaszony kolor = doczytane (wariant L2). Te same znaki na mapie tropu i w kresce tropu.
- **Miniatury haseł jako okładki** (zdjęcie główne z Wikipedii); brak zdjęcia → karta w kolorze akcentu z pierwszą literą (lubi te losowe kolory z palety). **Od 2026-11-22 (C1):** karta to barwa palety zmieszana z kremem 55% (`--cover-mix`, `--cover-base` w `style.css`), a szkło poziomu czytania zostaje nasycone w tym samym kolorze — zasada warstw: **dolna jasna, wierzchnia pełna**, nigdy ten sam ton na tym samym tonie. **Od 2026-11-22 wieczorem (`zakamarki-v17`, zastąpione w v21):** pastele były „mdłe i wyblakłe” → okładki w pełnych barwach zestawu **Szkliwo** (`--cover-1…5`: różowa glina `#d48e98`, miód `#d4a965`, seladon `#81b297`, gołębi błękit `#6e97bb`, rdza `#c0765d`; nocą jaśniejsze), litera zawsze ciemna; szkło na okładce bez zdjęcia = **jasna mgła** (`rgb(250 242 232 / .5)`), nie kolor. Barwy okładek są osobne od akcentów palety, więc róż kropek tropów i przyciski się nie zmieniły. Obie tafle (Na później, Przeczytane) **jedna, jasna, półprzezroczysta** (`--slab`, mleczne szkło z rozmyciem 16 px), tytuły w kolorze tekstu. **Od `zakamarki-v21`: okładki i szkło według palety wybranej w próbniku (wyżej, „Dwie warstwy kolorów”)** — rundy wariantów (O1–O3, B1–B3, Z1–Z6, R1–R4, T1–T4) przebodźcowywały.
- **Tytuły na półkach (T1, 2026-11-22):** jedna wielkość pisma wszędzie (.74rem), do 3 linijek, długie słowa (> 11 liter) dzielone miękkim łącznikiem między dwiema spółgłoskami najbliżej środka (`shy()` w `app.js`, „Corres-pondence”). Odrzucone: mniejsze pismo dla długich słów (różne wielkości), białe tytuły z cieniem, przyciemnione tafle.
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
- **Paleta zakreślaczy „Lampy” (P2, zastąpiona w v21 — nowe kolory wyżej):** morska zieleń `#7ccfb9`, niebieski `#93b6f5`, morela `#f4a77f`, wrzos `#d59be0`, cytryna `#ece06a` — własna rodzina z lamp-grzybków z moodboardu, **nie powtarza akcentów interfejsu** (jej uwaga: te same kolory na miniaturach, półkach i w zakreśleniach to za dużo powtórzeń). Przezroczystość 55% w dzień, 40% na ciemnych tłach.
- **Dolny pasek ekranów (C1):** pływająca pigułka z okrągłymi przyciskami, tylko poza czytnikiem; aktywny ekran = atramentowe kółko. Biblioteka (grzbiety książek) i **Zakreślenia — cudzysłów „Kropla” (Q4, 2026-11-22)**: każdy znak to jeden zamknięty, wypełniony kształt (kółko przechodzące w ogonek), bez łączeń. Odrzucone: kółko + doklejony łuk (ząbek na łączeniu w 26 px), dwie kreski ″, glif z Fraunces. Trzecie kółko: Węzły (2026-11-22); kolejne: Statystyki.
- **Chip PL** obok „Aa”: obrys w kolorze tekstu w angielskim haśle, wciśnięty (pełny) w polskim.
- **Ekran Zakreślenia:** wielka kobaltowa liczba, filtr kolorem (kółka z licznikami, „wszystkie”), karty grup po tropach z dniem po lewej, cytat w markerze w kroju czytnika, „Prowadzą do tego samego” na dole.

### Trop i Węzły (etap 4, 2026-11-22)
- **Miejsce (A):** Trop = karta „Dalej tym tropem” na końcu hasła, przed stopką; Węzły = trzecie kółko w dolnym pasku (znak: większa kropka z trzema mniejszymi wokół), osobny ekran z wielką kobaltową liczbą.
- **Lista (N1):** wiersz = okładka 48×64, tytuł, pod nim **jedna nazwa w linijce, równa lewa krawędź** (Węzeł: dzień tropu + najmocniejsze hasło + „+k”; najwyżej 3 linijki i „+N tropów”; Trop: połączone kroki), po prawej wielka kobaltowa liczba (Węzeł: liczba tropów; Trop: połączone kroki).
- **Rysunek uzasadnienia** (arkusz po stuknięciu w wiersz, forma z renderowni — „zbieżność”, „ciągłość wątku”): wiersze z lewej (tropy z dniem albo kroki na pionowej nici jak w mapie tropu; połączone pogrubione, reszta przygaszona), linie z prawej **zbiegają się w kobaltowym kółku z liczbą**. **Jedna grubość linii, bez grotów i kropek na liniach, tekst zawsze poziomo**; skaluje się: najwyżej 6 tropów / 8 kroków, nadmiar jako „+N” (przerywana linia).
- Odrzucone: kropki ścieżki (nieintuicyjne wizualnie — „niejasne” znaczyło *nieintuicyjne*, nie *bez objaśnienia*), nazwy przy kropkach, miniatury jako źródła (nic nie mówią, część haseł bez zdjęć), piktogramy progu 2/3/4 (przebodźcowujące), wachlarz K2, gwiazda R1 (kropki nachodzą na strzałki), kolumny R2 (zderzają się przy wielu hasłach), linie o różnej grubości („znowu chaos”). Liczby i nazwy zamiast „może Ci się spodobać”.

### Grafika i ikony
- **Ikona aplikacji (2026-11-22, `zakamarki-v23`, wybrana sama w próbniku `.drafts/makiety/logo-probnik.html`):** „zaka / marki” na dwie linie w **Corben Bold**, litery pomidor `#d0472f` na kremie `#fffcf5`, obok granatowa (`#05094d`) **miękka gwiazda** (4 ramiona, pionowe dłuższe, lekko obłe czubki) zamiast kropki. Linijka z próbnika: `znak zakamarki · gwiazda miękka · wielkość 113% · kropka ×2,35 · odstęp −0,025 em · ✦ poziom 10 · ✦ pion −20` (v26; wybrany odstęp −0,04 zmieniony na jej prośbę, bo „z” i „a” zachodziły — −0,025 to pierwszy, przy którym mają szparę). Litery jako ścieżki (opentype.js + `Corben-Bold.ttf` w `.drafts/makiety/fonts/`), eksport SVG z próbnika (`logoSVG()`), PNG przez `qlmanage`. Zapasowa: ta sama, gwiazda cienka (symetryczna ✦), ×2,25, bez przesunięcia. Wcześniej: różowe bąbelkowe „Z” z buźką na atramencie.
- Zasady ikon i logo: płaskie, **pełne tło bez faktury**, jeden wyraźny znak, kontrast znaku do tła wysoki (róż/atrament ok. 10:1), **wszystko w środkowym kole** (80% średnicy; Android przycina), wersja maskable pomniejszona do 82%, test czytelności w 32–48 px.
- Inne ilustracje (puste stany, statystyki): kierunek z inspiracji ikon — nierówna, ręczna krawędź, minimum rysów, rumieńce, stemple/wycinanki; bez gradientów i poświat.

### Czytelność ponad wszystko w czytniku
- Estetyka w czytniku tylko w akcentach (trop, przyciski, dymki, panel „Aa”).
- Stany i oznaczenia nie mogą polegać wyłącznie na kolorze (np. kolor + styl podkreślenia), bo właścicielka ma astygmatyzm.

## Jak proponować zmiany wyglądu

- Pokazuj **2–3 konkretne warianty na żywo** (makieta HTML w przeglądarce albo w aplikacji), z rekomendacją, nie opisy.
- Zanim pokażesz, **obejrzyj sama w pełnym i małym rozmiarze** i popraw oczywiste błędy (przycięcia, nachodzenie, nieczytelność).
- Przy nowych referencjach: wyciągnij wspólny język (co łączy obrazy), dopisz do sekcji „Co lubi” i zaproponuj, co z tego przenieść.
