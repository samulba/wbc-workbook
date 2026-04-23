-- ============================================================================
-- Inspiration Pool — +30 kuratierte Bilder für breitere Raum-/Wirkungs-Abdeckung
-- ----------------------------------------------------------------------------
-- Diese Migration FÜGT Bilder hinzu (kein DELETE wie bei 18_better_seed.sql).
-- Doppelte URLs werden über einen UNIQUE-Teilindex verhindert, damit ein
-- zweiter Run nicht wieder dieselben Bilder nachschiebt.
-- ============================================================================

-- Unique-Index auf image_url, damit wir idempotent arbeiten können
CREATE UNIQUE INDEX IF NOT EXISTS idx_inspiration_image_url_unique
  ON public.inspiration_images (image_url);

INSERT INTO public.inspiration_images
  (image_url, title, description, room_effect, room_type, colors, tags)
VALUES

-- ── Ruhe & Erholung ────────────────────────────────────────────────────────
('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
 'Warmes Schlafzimmer',
 'Holzelemente und sanfte Bettwäsche in Creme – ein Rückzugsort zum Abschalten.',
 'ruhe_erholung', 'schlafzimmer',
 ARRAY['#D4B896','#F0E6D3','#8B7355'], ARRAY['holz','creme','warm','bettwäsche','zeitlos']),

('https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
 'Zen-Wohnzimmer',
 'Minimalistisch, mit Blick nach draußen – eine Einladung, einfach zu sein.',
 'ruhe_erholung', 'wohnzimmer',
 ARRAY['#E8E0D5','#8B9E7A','#4A5568'], ARRAY['zen','minimal','panorama','ruhe','grau']),

('https://images.unsplash.com/photo-1558882224-dda166733046?w=800&q=80',
 'Nordic Nook',
 'Weiche Decke, Buch und ein Fensterplatz – die perfekte Leseecke.',
 'ruhe_erholung', 'wohnzimmer',
 ARRAY['#F5F0E8','#D4C5B0','#8B7355'], ARRAY['lesen','fenster','decke','nordic','hygge']),

('https://images.unsplash.com/photo-1616627561950-9f746e330187?w=800&q=80',
 'Gelassenes Bad',
 'Naturstein-Waschbecken, gedämpftes Licht, Bambus – Badezeit wird zum Ritual.',
 'ruhe_erholung', 'badezimmer',
 ARRAY['#C8D5B9','#E8D5C0','#6B7C73'], ARRAY['spa','stein','bambus','natur','ritual']),

('https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80',
 'Japandi Schlafzimmer',
 'Niedriges Bett, klare Linien, warme Hölzer – fernöstliche Ruhe im Norden.',
 'ruhe_erholung', 'schlafzimmer',
 ARRAY['#D4C5B0','#8B7355','#E8E0D5'], ARRAY['japandi','niedrig','holz','minimal','kultur']),

('https://images.unsplash.com/photo-1630585932406-3a8a7d0d6eb0?w=800&q=80',
 'Stilles Wellness-Bad',
 'Freistehende Wanne, Kerzen, Seegras-Teppich – Urlaub auf kleinstem Raum.',
 'ruhe_erholung', 'wellness',
 ARRAY['#E8D5C0','#8B9E7A','#D4B896'], ARRAY['wellness','wanne','kerzen','seegras','natur']),

-- ── Fokus & Konzentration ──────────────────────────────────────────────────
('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
 'Aufgeräumter Schreibtisch',
 'Jeder Gegenstand hat seinen Platz – so fließt der Fokus.',
 'fokus_konzentration', 'arbeitszimmer',
 ARRAY['#FFFFFF','#4A5568','#C4956A'], ARRAY['schreibtisch','ordnung','minimal','produktiv']),

('https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80',
 'Dunkles Home-Office',
 'Tiefe Grautöne und warmes Licht – Konzentration, wenn draußen Nacht wird.',
 'fokus_konzentration', 'buero',
 ARRAY['#2C3E50','#C4956A','#4A5568'], ARRAY['dunkel','fokus','abend','lampe']),

('https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
 'Bibliotheks-Ecke',
 'Bücher bis zur Decke, ein Sessel und gutes Licht – ein Raum für Tiefgang.',
 'fokus_konzentration', 'wohnzimmer',
 ARRAY['#8B7355','#F0E6D3','#2C3E50'], ARRAY['bücher','bibliothek','sessel','intellekt']),

('https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&q=80',
 'Weißer Workspace',
 'Maximale Klarheit – weiße Wände, dezente Pflanze, kein überflüssiges Detail.',
 'fokus_konzentration', 'arbeitszimmer',
 ARRAY['#FFFFFF','#E2E8F0','#C8D5B9'], ARRAY['weiß','clean','pflanze','hell','purist']),

-- ── Energie & Aktivität ────────────────────────────────────────────────────
('https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=80',
 'Lebendige Küche',
 'Knallbunte Kacheln und offene Regale – Kochen als Energie-Tanken.',
 'energie_aktivitaet', 'kueche',
 ARRAY['#C96A50','#FFFFFF','#4A5568'], ARRAY['kacheln','bunt','offen','kochen','energie']),

('https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
 'Farbenfroher Essbereich',
 'Mutige Stühle, warme Accessoires – eine Einladung zum gemeinsamen Genuss.',
 'energie_aktivitaet', 'esszimmer',
 ARRAY['#C96A50','#F0E6D3','#2D5A4F'], ARRAY['stühle','farbe','esstisch','sozial']),

('https://images.unsplash.com/photo-1595514535415-dae8970c381f?w=800&q=80',
 'Sportraum zuhause',
 'Spiegelwand, Holzboden, Naturlicht – alle Voraussetzungen für Morgenyoga.',
 'energie_aktivitaet', 'yogaraum',
 ARRAY['#FFFFFF','#8B9E7A','#E8D5C0'], ARRAY['sport','yoga','spiegel','hell','aktiv']),

('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
 'Frisches Kinderzimmer',
 'Farbige Akzente, offene Spielflächen – Kreativität darf laut sein.',
 'energie_aktivitaet', 'kinderzimmer',
 ARRAY['#FFFFFF','#C96A50','#8B9E7A'], ARRAY['kinder','spielzeug','bunt','offen']),

-- ── Kreativität & Inspiration ──────────────────────────────────────────────
('https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
 'Atelier mit Seele',
 'Leinwände, Farbtuben, verschieden texturiert – ein Raum für kreatives Chaos.',
 'kreativitaet_inspiration', 'studio',
 ARRAY['#F5F0E8','#C96A50','#2C3E50'], ARRAY['atelier','leinwand','farbe','chaos','kreativ']),

('https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800&q=80',
 'Eklektisches Wohnzimmer',
 'Vintage-Teppiche, moderne Kunst, Pflanzen – jedes Stück erzählt eine Geschichte.',
 'kreativitaet_inspiration', 'wohnzimmer',
 ARRAY['#C4956A','#8B9E7A','#C96A50'], ARRAY['vintage','kunst','mix','stories','persönlich']),

('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80',
 'Boho-Schlafzimmer',
 'Makramee, Federn, gemusterte Kissen – eine Welt für sich.',
 'kreativitaet_inspiration', 'schlafzimmer',
 ARRAY['#C4956A','#F0E6D3','#8B7355'], ARRAY['boho','makramee','muster','ethnic']),

('https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80',
 'Galerie-Wand',
 'Bilder in unterschiedlichen Rahmen erzählen die Reise des Bewohners.',
 'kreativitaet_inspiration', 'wohnzimmer',
 ARRAY['#2C3E50','#F5F0E8','#C4956A'], ARRAY['galerie','kunst','rahmen','persönlich']),

-- ── Begegnung & Austausch ──────────────────────────────────────────────────
('https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&q=80',
 'Grosser Esstisch',
 'Platz für 10 – hier wird erzählt, gelacht und das Leben gefeiert.',
 'begegnung_austausch', 'esszimmer',
 ARRAY['#8B7355','#F0E6D3','#C4956A'], ARRAY['gross','holz','fest','gesellig','familie']),

('https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800&q=80',
 'Loft-Küche',
 'Grosse Kochinsel, Barhocker, offener Grundriss – das Epizentrum des Zuhauses.',
 'begegnung_austausch', 'kueche',
 ARRAY['#4A5568','#FFFFFF','#C4956A'], ARRAY['loft','kochinsel','offen','urban']),

('https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
 'Gemütliche Sitzgruppe',
 'Tiefes Sofa, weiche Kissen, niedriger Couchtisch – die perfekte Runde.',
 'begegnung_austausch', 'wohnzimmer',
 ARRAY['#D4C5B0','#8B9E7A','#2C3E50'], ARRAY['sofa','kissen','runde','warm','tief']),

('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
 'Outdoor Essbereich',
 'Holztisch, Lichterkette, Olivenbaum – Abende unter freiem Himmel.',
 'begegnung_austausch', 'sonstiges',
 ARRAY['#C4956A','#2D5A4F','#F0E6D3'], ARRAY['outdoor','terrasse','lichter','sommer']),

-- ── Mischung: Flur / Keller / Büro ──────────────────────────────────────────
('https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&q=80',
 'Einladender Flur',
 'Spiegel, Bank und Hakenleiste – der erste Eindruck eines Zuhauses zählt.',
 'ruhe_erholung', 'flur',
 ARRAY['#F0E6D3','#C8D5B9','#8B7355'], ARRAY['flur','eingang','willkommen','organisation']),

('https://images.unsplash.com/photo-1582582494705-f8ce0b0c24f0?w=800&q=80',
 'Minimales Büro',
 'Metall-Schreibtisch, Leder-Stuhl, Filz-Akustik – Business-Look mit Haltung.',
 'fokus_konzentration', 'buero',
 ARRAY['#2C3E50','#C4956A','#E2E8F0'], ARRAY['business','leder','metall','akustik']),

('https://images.unsplash.com/photo-1631049552240-59c0e23b6a1b?w=800&q=80',
 'Musik-Keller',
 'Akustik-Paneele, warme Lampen, gemütliches Sofa – Proberaum und Rückzug zugleich.',
 'kreativitaet_inspiration', 'keller',
 ARRAY['#2C3E50','#C4956A','#4A5568'], ARRAY['musik','keller','akustik','instrumente']),

('https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=800&q=80',
 'Modernes Kinderzimmer',
 'Etagenbett, Spielecke, Montessori-Regal – Struktur und Freiheit zugleich.',
 'energie_aktivitaet', 'kinderzimmer',
 ARRAY['#FFFFFF','#8B9E7A','#C4956A'], ARRAY['kinder','montessori','spiel','struktur']),

('https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80',
 'Wellness-Spa zu Hause',
 'Sauna aus Zirbenholz, Waschbecken, Pflanzenecke – täglicher Urlaub.',
 'ruhe_erholung', 'wellness',
 ARRAY['#D4B896','#8B9E7A','#F0E6D3'], ARRAY['sauna','zirbe','wellness','ritual']),

('https://images.unsplash.com/photo-1611892440504-42453f32a8e7?w=800&q=80',
 'Offenes Loft',
 'Hohe Decken, Industrial-Vibes, Licht überall – Raum zum Entfalten.',
 'energie_aktivitaet', 'wohnzimmer',
 ARRAY['#F5F0E8','#4A5568','#C4956A'], ARRAY['loft','industrial','hoch','weit']),

('https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80',
 'Boho-Esszimmer',
 'Runder Tisch, Rattan-Stühle, Makramee-Pendelleuchte – Entspannung beim Essen.',
 'begegnung_austausch', 'esszimmer',
 ARRAY['#D4C5B0','#8B7355','#F0E6D3'], ARRAY['boho','rattan','rund','entspannt']),

('https://images.unsplash.com/photo-1616627781014-e8c91fd23bfd?w=800&q=80',
 'Pflanzen-Wohnzimmer',
 'Dschungel indoor – jede Ecke grün, Luft fühlbar frisch.',
 'kreativitaet_inspiration', 'wohnzimmer',
 ARRAY['#C8D5B9','#8B9E7A','#F0E6D3'], ARRAY['pflanzen','grün','dschungel','frisch','bio'])

ON CONFLICT (image_url) DO NOTHING;
