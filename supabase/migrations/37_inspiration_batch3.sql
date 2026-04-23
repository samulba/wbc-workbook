-- ============================================================================
-- Inspiration Pool — +40 weitere kuratierte Unsplash-Bilder
-- ----------------------------------------------------------------------------
-- Fokus dieser Batch:
--   · Mehr Abdeckung für bislang dünn gesäte Raumtypen:
--     Keller, Wellness, Yogaraum, Flur, Esszimmer, Kinderzimmer, Büro, Studio
--   · Stil-Diversität: Japandi, Industrial, Mid-Century, Vintage, Rustic,
--     Mediterran, Maximalism, Tropical
--   · Alle fünf Wirkungen bekommen zusätzliche Karten
--
-- Idempotent via UNIQUE(image_url) + ON CONFLICT DO NOTHING aus Migration 36.
-- ============================================================================

INSERT INTO public.inspiration_images
  (image_url, title, description, room_effect, room_type, colors, tags)
VALUES

-- ── Ruhe & Erholung ─────────────────────────────────────────────────────────
('https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80',
 'Stilles Atelier',
 'Nordlicht, Naturholz und ein Leinensessel – der perfekte Ort für bewusstes Pausieren.',
 'ruhe_erholung', 'studio',
 ARRAY['#E8E0D5','#8B7355','#F5F0E8'], ARRAY['atelier','nordlicht','leinen','naturholz','pause']),

('https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&q=80',
 'Mediterranes Badezimmer',
 'Terrakotta-Fliesen, Kalk-Wand und ein Olivenzweig – Urlaub in Italien zu Hause.',
 'ruhe_erholung', 'badezimmer',
 ARRAY['#C4956A','#F0E6D3','#8B7355'], ARRAY['mediterran','terrakotta','kalk','olive','italien']),

('https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?w=800&q=80',
 'Zen-Yogaraum',
 'Tatami, Schiebetüren und ein Bonsai – konzentrierte Achtsamkeit im eigenen Raum.',
 'ruhe_erholung', 'yogaraum',
 ARRAY['#E8E0D5','#8B7355','#C8D5B9'], ARRAY['zen','tatami','schiebetür','bonsai','meditation']),

('https://images.unsplash.com/photo-1604014056465-7a60a28b4f29?w=800&q=80',
 'Sauna-Keller',
 'Zirbelkiefer, warmes Licht und ein Wasserspender – tägliches Kurz-Spa im Kellergeschoss.',
 'ruhe_erholung', 'keller',
 ARRAY['#D4B896','#8B7355','#F0E6D3'], ARRAY['sauna','zirbel','licht','keller','spa']),

('https://images.unsplash.com/photo-1522444195799-478538b28823?w=800&q=80',
 'Meditationskissen-Ecke',
 'Niedrige Sitzgelegenheit, sanfte Stoffe und ein Duft-Diffusor – Rückzugsort mit Ritual.',
 'ruhe_erholung', 'wohnzimmer',
 ARRAY['#F0E6D3','#8B9E7A','#D4C5B0'], ARRAY['meditation','kissen','ritual','diffuser','bewusst']),

('https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&q=80',
 'Zweites Schlafzimmer',
 'Gastzimmer in Champagner- und Blautönen, ideal für erholsame Übernachtungen.',
 'ruhe_erholung', 'schlafzimmer',
 ARRAY['#F5F0E8','#A6B8C4','#D4C5B0'], ARRAY['gastzimmer','champagner','blau','weich','hell']),

('https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&q=80',
 'Lesesessel am Fenster',
 'Ein Velours-Sessel mit Sonnenlicht und Buch – der Ort für langsame Nachmittage.',
 'ruhe_erholung', 'wohnzimmer',
 ARRAY['#C4956A','#F0E6D3','#8B9E7A'], ARRAY['sessel','velours','lesen','licht','langsam']),

-- ── Fokus & Konzentration ───────────────────────────────────────────────────
('https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
 'Grünes Home-Office',
 'Dunkle Wand, Messinglampe, üppige Monstera – konzentriertes Arbeiten mit Charakter.',
 'fokus_konzentration', 'buero',
 ARRAY['#2D5A4F','#C4956A','#F0E6D3'], ARRAY['dunkelgrün','messing','pflanze','büro','fokussiert']),

('https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80',
 'Reading Room',
 'Dunkelgrüne Wand, goldene Akzente, vollgestopftes Bücherregal – Vertiefung garantiert.',
 'fokus_konzentration', 'arbeitszimmer',
 ARRAY['#2D5A4F','#C4956A','#4A5568'], ARRAY['lesen','bücher','dunkelgrün','intimate','retro']),

('https://images.unsplash.com/photo-1631049035182-249067d7618e?w=800&q=80',
 'Klar gegliederter Arbeitsplatz',
 'Holz-Schreibtisch, Task-Lampe, minimal Deko – alles dient dem Fokus.',
 'fokus_konzentration', 'arbeitszimmer',
 ARRAY['#F5F0E8','#8B7355','#4A5568'], ARRAY['holz','schreibtisch','lampe','clean']),

('https://images.unsplash.com/photo-1524758870432-af57e54afa26?w=800&q=80',
 'Industrielles Büro',
 'Sichtbeton, Stahlregal, Edison-Lampe – raue Kulisse für klares Denken.',
 'fokus_konzentration', 'buero',
 ARRAY['#4A5568','#D4C5B0','#C4956A'], ARRAY['industrial','beton','stahl','edison','loft']),

('https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
 'Minimalist-Büro weiß',
 'Alles weiß, einziger Farbtupfer: eine Topfpflanze. Der Raum atmet mit dir mit.',
 'fokus_konzentration', 'arbeitszimmer',
 ARRAY['#FFFFFF','#E8E0D5','#8B9E7A'], ARRAY['minimal','weiß','pflanze','ruhig','modern']),

-- ── Energie & Aktivität ────────────────────────────────────────────────────
('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
 'Frischer Start-Tag-Raum',
 'Große Fenster, Pflanzen, offene Flächen – ein Raum der sofort wach macht.',
 'energie_aktivitaet', 'wohnzimmer',
 ARRAY['#FFFFFF','#C8D5B9','#C4956A'], ARRAY['morgens','pflanzen','fenster','energie','offen']),

('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
 'Citrus-Küche',
 'Zitronen, gelbe Akzente, cleane Arbeitsplatte – Kochen fühlt sich wie Sommer an.',
 'energie_aktivitaet', 'kueche',
 ARRAY['#FFD166','#FFFFFF','#2D5A4F'], ARRAY['gelb','zitrone','sommer','kochen','aktiv']),

('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
 'Aktives Wohnzimmer',
 'Ein Trampolin für die Kids, offene Regale, Sportequipment in Griffnähe.',
 'energie_aktivitaet', 'wohnzimmer',
 ARRAY['#C96A50','#F0E6D3','#2C3E50'], ARRAY['aktiv','familie','sport','offen','dynamisch']),

('https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&q=80',
 'Tanzstudio zu Hause',
 'Spiegelwand, Holzparkett, Sound-Anlage – die Wohnung zum Ballroom machen.',
 'energie_aktivitaet', 'studio',
 ARRAY['#FFFFFF','#D4B896','#4A5568'], ARRAY['tanz','spiegel','parkett','sound','bewegung']),

('https://images.unsplash.com/photo-1617103996702-96ff29b1c467?w=800&q=80',
 'Pop-of-Color Esszimmer',
 'Pink-Stühle, Marmortisch, moderne Kunst – Esszeit wird zum Fest.',
 'energie_aktivitaet', 'esszimmer',
 ARRAY['#F2B5D4','#FFFFFF','#2C3E50'], ARRAY['pink','marmor','kunst','fest','modern']),

('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80',
 'Outdoor-Küche',
 'Offene Grillecke, Barhocker, mediterrane Fliesen – kochen heißt hier feiern.',
 'energie_aktivitaet', 'kueche',
 ARRAY['#C96A50','#F5F0E8','#2D5A4F'], ARRAY['outdoor','grill','mediterran','feier','sozial']),

-- ── Kreativität & Inspiration ──────────────────────────────────────────────
('https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800&q=80',
 'Maximalist-Wohnzimmer',
 'Samtsessel, Pflanzendschungel, Galerie-Wand, Teppich-Mix – jedes Stück erzählt.',
 'kreativitaet_inspiration', 'wohnzimmer',
 ARRAY['#2D5A4F','#C96A50','#C4956A'], ARRAY['maximal','samt','dschungel','galerie','geschichten']),

('https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80',
 'Studio mit Staffelei',
 'Große Staffelei, Lichtkuppel, aufgerollte Leinwände – Kreativität hat Platz.',
 'kreativitaet_inspiration', 'studio',
 ARRAY['#F5F0E8','#C4956A','#2C3E50'], ARRAY['staffelei','kunst','leinwand','licht','atelier']),

('https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=800&q=80',
 'Tropical Wohnzimmer',
 'Rattan, Monstera, Palmenblatt-Tapete – der Dschungel zieht ein.',
 'kreativitaet_inspiration', 'wohnzimmer',
 ARRAY['#2D5A4F','#C8D5B9','#C4956A'], ARRAY['tropical','dschungel','rattan','monstera','vibrant']),

('https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
 'Vintage-Schlafzimmer',
 '60er-Jahre-Kommode, Retro-Tapete, Lampe mit Fransenschirm – ein Zeitreise-Raum.',
 'kreativitaet_inspiration', 'schlafzimmer',
 ARRAY['#C4956A','#2D5A4F','#F0E6D3'], ARRAY['vintage','retro','60er','tapete','zeitreise']),

('https://images.unsplash.com/photo-1595407753234-0882f1e77954?w=800&q=80',
 'Vinyl-Keller',
 'Plattenregal, Sofa, gedämpftes Licht – Klangwelten zum Eintauchen.',
 'kreativitaet_inspiration', 'keller',
 ARRAY['#4A5568','#C4956A','#F0E6D3'], ARRAY['vinyl','platten','musik','keller','audio']),

('https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&q=80',
 'Eklektisches Esszimmer',
 'Möbel aus vier Jahrzehnten, harmonisch arrangiert – ein kuratiertes Fundstück-Paradies.',
 'kreativitaet_inspiration', 'esszimmer',
 ARRAY['#C4956A','#F5F0E8','#2C3E50'], ARRAY['eklektisch','fundstück','mix','kuratiert','charakter']),

-- ── Begegnung & Austausch ──────────────────────────────────────────────────
('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
 'Offene Kochinsel',
 'Die Küche als Treffpunkt: Freunde sitzen am Tresen, während du kochst.',
 'begegnung_austausch', 'kueche',
 ARRAY['#FFFFFF','#8B7355','#2D5A4F'], ARRAY['kochinsel','tresen','sozial','offen','treffen']),

('https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&q=80',
 'Farmhouse-Esszimmer',
 'Langer Holztisch, verschiedene Stühle, Country-Charme – einladend für jede Runde.',
 'begegnung_austausch', 'esszimmer',
 ARRAY['#8B7355','#F0E6D3','#C4956A'], ARRAY['farmhouse','country','langtisch','rustikal','gastfreundlich']),

('https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
 'Lounge-Bar zu Hause',
 'Tresen aus Nussholz, Samt-Hocker, Wand voller Flaschen – Cocktails für Freunde.',
 'begegnung_austausch', 'wohnzimmer',
 ARRAY['#2C3E50','#C4956A','#F0E6D3'], ARRAY['bar','lounge','cocktails','abend','urban']),

('https://images.unsplash.com/photo-1588854671070-c3ee17c1082f?w=800&q=80',
 'Großfamilie-Wohnzimmer',
 'Großes L-Sofa, bequeme Sessel, Kuscheldecken – hier wird gelacht und gespielt.',
 'begegnung_austausch', 'wohnzimmer',
 ARRAY['#C4956A','#F0E6D3','#8B9E7A'], ARRAY['familie','sofa','gesellig','decken','warm']),

('https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
 'Eingangsflur mit Bank',
 'Eine gemeinsame Bank zum Schuhe-Anziehen, Garderobe für alle – Willkommens-Zone.',
 'begegnung_austausch', 'flur',
 ARRAY['#F0E6D3','#8B7355','#C8D5B9'], ARRAY['eingang','bank','garderobe','willkommen']),

('https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800&q=80',
 'Spielecke Kinderzimmer',
 'Buntes Teppichchaos, Lesezelt, Bücher in Reichweite – hier wird Freundschaft gelebt.',
 'begegnung_austausch', 'kinderzimmer',
 ARRAY['#F2B5D4','#C8D5B9','#FFD166'], ARRAY['kinder','spielzelt','bunt','freundschaft']),

-- ── Gemischt / Zusatz ───────────────────────────────────────────────────────
('https://images.unsplash.com/photo-1595428780717-57e9ec6e4a26?w=800&q=80',
 'Scandi-Badezimmer',
 'Weiße Fliesen, helles Holz, schlichte Armaturen – klare Linien, klare Stimmung.',
 'ruhe_erholung', 'badezimmer',
 ARRAY['#FFFFFF','#D4B896','#E8E0D5'], ARRAY['scandi','fliesen','holz','klar','rein']),

('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
 'Cozy Reading Nook',
 'Kissen-Ecke am Fenster, Bücher stapelweise, dimmbare Lampe – dein Rückzugsort.',
 'ruhe_erholung', 'wohnzimmer',
 ARRAY['#F0E6D3','#C4956A','#8B9E7A'], ARRAY['nook','kissen','bücher','rückzug','dimmbar']),

('https://images.unsplash.com/photo-1616137133836-5a3ec25f4745?w=800&q=80',
 'Urban Industrial Loft',
 'Sichtbeton-Wand, Stahlträger, schwarze Fenster – Großstadt-Energie in den eigenen vier Wänden.',
 'energie_aktivitaet', 'wohnzimmer',
 ARRAY['#4A5568','#FFFFFF','#C4956A'], ARRAY['urban','industrial','loft','stahl','beton']),

('https://images.unsplash.com/photo-1560185008-a33f5c7b1844?w=800&q=80',
 'Gemütlicher Flur',
 'Teppich-Läufer, Garderobe aus Naturholz, Pflanze – ankommen fühlt sich sofort gut an.',
 'ruhe_erholung', 'flur',
 ARRAY['#D4C5B0','#8B9E7A','#F0E6D3'], ARRAY['flur','läufer','garderobe','ankommen','gemütlich']),

('https://images.unsplash.com/photo-1632829882891-5047ccc421b8?w=800&q=80',
 'Garten-Studio',
 'Verglaster Kreativraum mit Blick ins Grüne – arbeiten wie in einem Glashaus.',
 'kreativitaet_inspiration', 'studio',
 ARRAY['#F5F0E8','#C8D5B9','#8B7355'], ARRAY['garten','glas','natur','licht','studio']),

('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
 'Home-Library',
 'Decken-hoher Bücherschrank mit rollender Leiter – hier wohnen Geschichten.',
 'fokus_konzentration', 'arbeitszimmer',
 ARRAY['#8B7355','#F0E6D3','#2D5A4F'], ARRAY['bibliothek','bücher','leiter','holz','klassisch']),

('https://images.unsplash.com/photo-1631047814671-e1a7720937b5?w=800&q=80',
 'Neutrales Sauna-Wellness',
 'Helles Holz, einfache Liege, ein Fenster ins Grüne – Entspannung ohne Kitsch.',
 'ruhe_erholung', 'wellness',
 ARRAY['#D4B896','#F0E6D3','#C8D5B9'], ARRAY['sauna','wellness','hell','natur','schlicht']),

('https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=800&q=80',
 'Kinderzimmer im Naturlook',
 'Holz-Hochbett, Leinen-Vorhänge, kleine Pflanzen – Kinder wachsen mit der Natur.',
 'ruhe_erholung', 'kinderzimmer',
 ARRAY['#D4B896','#F0E6D3','#8B9E7A'], ARRAY['kinder','natur','holz','leinen','wachsen']),

('https://images.unsplash.com/photo-1617104551744-f46e7aa74b59?w=800&q=80',
 'Grand Esszimmer',
 'Langer Marmor-Tisch, Velours-Stühle, Leuchter – Dinnerparty-Niveau.',
 'begegnung_austausch', 'esszimmer',
 ARRAY['#F0E6D3','#2C3E50','#C4956A'], ARRAY['grand','marmor','velours','dinner','elegant']),

('https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
 'Concept-Store Home-Office',
 'Kurator-Style mit einzelnen Design-Objekten – der Raum als Showroom für Ideen.',
 'kreativitaet_inspiration', 'buero',
 ARRAY['#FFFFFF','#2C3E50','#C4956A'], ARRAY['concept','kurator','design','showroom','ideen'])

ON CONFLICT (image_url) DO NOTHING;
