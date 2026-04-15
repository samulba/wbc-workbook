-- =============================================================
-- Seed: 12 Beispielprodukte für Modul 1
-- =============================================================
-- Ausführen in Supabase SQL Editor oder via: supabase db seed
--
-- HINWEIS: affiliate_url-Werte sind Platzhalter.
-- Ersetze sie vor dem Launch durch echte Affiliate-Links.
-- image_url: Produkt-Bilder im Admin unter /admin/produkte ergänzen.
-- =============================================================

INSERT INTO public.products (
  name,
  description,
  affiliate_url,
  image_url,
  price,
  partner,
  category,
  subcategory,
  module,
  tags,
  style,
  material,
  color_family,
  room_types,
  why_fits,
  is_active,
  priority
)
VALUES

-- ─────────────────────────────────────────────────────────────
-- RUHE & ERHOLUNG
-- ─────────────────────────────────────────────────────────────

(
  'Samt-Sessel "Luna"',
  'Großzügig gepolsterter Lounge-Sessel mit weichem Samtbezug in warmem Sandbeige. Breite Armlehnen und konische Holzbeine in geölter Eiche verleihen ihm eine ruhige, geerdte Ausstrahlung.',
  'https://www.westwing.de/p/samt-sessel-luna-sandbeige-12345/',
  NULL,
  349.00,
  'Westwing',
  'Sessel',
  'Lounge-Sessel',
  1,
  ARRAY['gemütlich', 'ruhe erholung', 'samtbezug', 'hygge', 'entspannung', 'sessel', 'beige'],
  'Skandinavisch',
  'Stoff',
  'Beige',
  ARRAY['wohnzimmer', 'schlafzimmer'],
  'Der weiche Samtbezug in warmem Sandbeige lädt sofort zum Loslassen ein. Breite Armlehnen und eine tiefe Sitzfläche machen diesen Sessel zum perfekten Rückzugsort – ideal für einen Raum, der echte Erholung schenken soll.',
  true,
  9
),

(
  'Himalaya-Salzlampe "Amber"',
  'Handgefertigte Salzlampe aus echtem Himalayasalz in Ei-Form, ca. 2–3 kg. Warmweißes Licht (2200 K) mit Dimmschalter am Kabel. Natürlich, warm, ganz ohne Chemie.',
  'https://www.sklum.com/de/kaufen-tischleuchten/78432-salzlampe-amber-natur.html',
  NULL,
  39.00,
  'Sklum',
  'Tischleuchte',
  'Dekolampe',
  1,
  ARRAY['ruhe erholung', 'stimmungslicht', 'warm', 'entspannung', 'schlaf', 'meditation', 'natur'],
  'Rustikal',
  'Stein',
  'Orange',
  ARRAY['wohnzimmer', 'schlafzimmer', 'yogaraum', 'wellness', 'arbeitszimmer'],
  'Das warme, bernsteinfarbene Licht einer Salzlampe dämpft instinktiv die Aktivität und signalisiert dem Körper: Zeit zum Abschalten. Ein einfaches, wirkungsvolles Accessoire für jeden Erholungsraum.',
  true,
  7
),

(
  'Wolldecke "Hygge"',
  'Doppelseitige Kuscheldecke aus 80 % Merino-Wolle in gebrochenem Weiß. 130 × 170 cm, fransig abgeschlossen, maschinenwaschbar bei 30 °C.',
  'https://www.westwing.de/p/wolldecke-hygge-cream-130x170-67891/',
  NULL,
  89.00,
  'Westwing',
  'Kissen',
  'Wohndecke',
  1,
  ARRAY['ruhe erholung', 'hygge', 'wolle', 'kuscheldecke', 'creme', 'soft', 'cozy'],
  'Skandinavisch',
  'Wolle',
  'Beige',
  ARRAY['wohnzimmer', 'schlafzimmer'],
  'Eine Wolldecke in natürlichem Creme ist das vielleicht einfachste Mittel, einen Raum sofort wärmer und einladender wirken zu lassen. Weich, natürlich und pflegeleicht – genau richtig für einen Wohlfühlraum.',
  true,
  8
),

-- ─────────────────────────────────────────────────────────────
-- FOKUS & KONZENTRATION
-- ─────────────────────────────────────────────────────────────

(
  'Schreibtischleuchte "Focus Pro"',
  'LED-Arbeitsplatzleuchte mit stufenloser Farbtemperatur (2700–6500 K) und 5 Helligkeitsstufen. Schwenkbarer Arm, blendfreier Diffusor, USB-C-Ladefach im Sockel. Schwarz matt.',
  'https://www.paulmann.de/produkte/leuchten/tischleuchten/focus-pro-led-schwarz-74523.html',
  NULL,
  119.00,
  'Paulmann',
  'Tischleuchte',
  'Arbeitsleuchte',
  1,
  ARRAY['fokus konzentration', 'arbeitsplatz', 'led', 'schreibtisch', 'hell', 'produktiv', 'klar'],
  'Modern',
  'Metall',
  'Schwarz',
  ARRAY['arbeitszimmer', 'buero', 'schlafzimmer'],
  'Licht ist der stärkste Hebel für Konzentration. Diese Leuchte passt Farbtemperatur und Helligkeit präzise an – warm für abends, tageslichtähnlich für intensive Arbeitsphasen. Schwarz matt fügt sich diskret in jeden Schreibtisch.',
  true,
  8
),

(
  'Monstera Deliciosa – Fensterblatt',
  'Monstera deliciosa im 19-cm-Kulturtopf, ca. 50–60 cm Gesamthöhe. Robuste Zimmerpflanze mit charakteristischen geschlitzten Blättern. Luftreinigend, pflegeleicht.',
  'https://www.aplanta.de/zimmerpflanzen/monstera-deliciosa-fensterblatt-19cm',
  NULL,
  24.90,
  'Aplanta',
  'Pflanze',
  'Zimmerpflanze',
  1,
  ARRAY['pflanze', 'natur', 'luftreinigung', 'grün', 'biophilic', 'fokus konzentration', 'gesund'],
  'Modern',
  'Sonstiges',
  'Grün',
  ARRAY['wohnzimmer', 'arbeitszimmer', 'schlafzimmer', 'buero', 'flur', 'esszimmer'],
  'Pflanzen im Sichtfeld senken nachweislich den Stresspegel und verbessern die Konzentration. Die Monstera ist dabei besonders dankbar: robust, luftreinigend und ein echter Hingucker, der jeden Raum belebt.',
  true,
  10
),

(
  'Akustikpaneel "Silence Oak"',
  'Wandpaneel aus Eichen-Furnier auf schalldämmender Polyester-Trägerplatte. 60 × 60 cm, Schallabsorptionsklasse B. Einfache Wandmontage, stapelbar für größere Flächen.',
  'https://www.sklum.com/de/kaufen-wanddekoration/92314-akustikpaneel-silence-oak.html',
  NULL,
  64.00,
  'Sklum',
  'Dekoobjekt',
  'Akustikpaneel',
  1,
  ARRAY['fokus konzentration', 'schallschutz', 'ruhe', 'homeoffice', 'akustik', 'eiche', 'minimal'],
  'Minimalistisch',
  'Holz',
  'Natur',
  ARRAY['arbeitszimmer', 'buero', 'schlafzimmer'],
  'Schlechte Raumakustik sabotiert Konzentration und Erholung gleichermaßen. Dieses Paneel schluckt Nachhall und Störgeräusche und fügt gleichzeitig warme Eichenholz-Optik hinzu – Funktion und Ästhetik in einem.',
  true,
  6
),

-- ─────────────────────────────────────────────────────────────
-- ENERGIE & AKTIVITÄT
-- ─────────────────────────────────────────────────────────────

(
  'Stehleuchte "Energize Arc"',
  'Bogenleuchte mit schwenkbarem Arc-Arm (Reach 180 cm) und dimmbarem LED-Panel (2000 lm, 3000 K). Weißer Stahl, flacher Betonsockel. Perfekt für helle, aktivierende Lichtatmosphäre.',
  'https://www.paulmann.de/produkte/leuchten/stehleuchten/energize-arc-led-weiss-88341.html',
  NULL,
  229.00,
  'Paulmann',
  'Stehleuchte',
  'Bogenleuchte',
  1,
  ARRAY['energie aktivität', 'hell', 'bogenleuchte', 'weiß', 'modern', 'licht', 'aktivierend'],
  'Modern',
  'Metall',
  'Weiß',
  ARRAY['wohnzimmer', 'arbeitszimmer', 'yogaraum', 'buero', 'studio'],
  'Helles Licht von oben signalisiert dem Körper Tageslicht – das aktiviert und motiviert. Diese schlanke Bogenleuchte bringt gezielt viel Licht in die Raummitte und wirkt dabei clean und un­aufdringlich.',
  true,
  8
),

(
  'Wandspiegel "Expand" – Gold',
  'Runder Wandspiegel, Ø 80 cm, mit schmalem Rahmen in gebürstetem Messing-Gold. Inkl. unsichtbarer Aufhängung. Lässt Räume optisch weiter und heller erscheinen.',
  'https://www.westwing.de/p/wandspiegel-expand-rund-gold-80cm-34512/',
  NULL,
  169.00,
  'Westwing',
  'Spiegel',
  'Wandspiegel',
  1,
  ARRAY['energie aktivität', 'spiegel', 'gold', 'messing', 'rund', 'hell', 'weite', 'dynamik'],
  'Modern',
  'Metall',
  'Beige',
  ARRAY['wohnzimmer', 'flur', 'yogaraum', 'schlafzimmer', 'wellness'],
  'Ein großer Spiegel ist das effektivste Mittel, um Energie und Weite in einen Raum zu bringen. Er verdoppelt das Licht, lässt Räume größer wirken und gibt Dynamik – unverzichtbar für Räume, die in Bewegung bringen sollen.',
  true,
  7
),

-- ─────────────────────────────────────────────────────────────
-- KREATIVITÄT & INSPIRATION
-- ─────────────────────────────────────────────────────────────

(
  'Hängepflanze Pothos "Golden"',
  'Epipremnum aureum ("Golden Pothos") im 15-cm-Hängetopf aus unglasierter Terrakotta, Strang ca. 40 cm. Extrem pflegeleicht, verträgt auch schattigen Standort.',
  'https://www.aplanta.de/haengepflanzen/pothos-golden-haengetopf-terrakotta',
  NULL,
  18.90,
  'Aplanta',
  'Pflanze',
  'Hängepflanze',
  1,
  ARRAY['kreativität inspiration', 'hängepflanze', 'grün', 'boho', 'natur', 'leicht', 'terrakotta'],
  'Boho',
  'Sonstiges',
  'Grün',
  ARRAY['wohnzimmer', 'arbeitszimmer', 'schlafzimmer', 'buero', 'kueche', 'studio', 'flur'],
  'Hängende Grünpflanzen schaffen Tiefe und Bewegung in einem Raum – genau das, was kreative Atmosphären brauchen. Der Pothos wächst schnell und üppig, vergibt Fehler beim Gießen und bringt natürliche Leichtigkeit in jeden Winkel.',
  true,
  9
),

(
  'Beistelltisch "Mix" Holz & Messing',
  'Runder Beistelltisch, Ø 40 cm, H 55 cm. Tischplatte aus geöltem Eichenholz, Gestell in Messing-gebürstet. Stapelbar für variable Nutzung. Handgefertigt in Portugal.',
  'https://www.sklum.com/de/kaufen-beistelltische/105673-beistelltisch-mix-eiche-messing.html',
  NULL,
  149.00,
  'Sklum',
  'Beistelltisch',
  'Runder Beistelltisch',
  1,
  ARRAY['kreativität inspiration', 'eiche', 'messing', 'holz', 'boho', 'art deco', 'rund', 'gold'],
  'Art Deco',
  'Eiche',
  'Natur',
  ARRAY['wohnzimmer', 'arbeitszimmer', 'schlafzimmer', 'studio'],
  'Die Kombination aus warmem Eichenholz und gebürstetem Messing schafft einen interessanten Materialkontrast, der zum Hinschauen einlädt. Ein Tisch als Accessoire – für kreative Räume, die aus Gleichförmigkeit ausbrechen wollen.',
  true,
  7
),

-- ─────────────────────────────────────────────────────────────
-- BEGEGNUNG & AUSTAUSCH
-- ─────────────────────────────────────────────────────────────

(
  'Kerzenhalter-Set "Dune" (3-teilig)',
  '3-teiliges Set aus Kerzenhaltern in verschiedenen Höhen (12/18/24 cm). Kombination aus schwarzem Metall und gegossem Messinggold. Für Stumpen- und Teelichter geeignet.',
  'https://www.westwing.de/p/kerzenhalter-set-dune-schwarz-gold-3er-56789/',
  NULL,
  59.00,
  'Westwing',
  'Dekoobjekt',
  'Kerzenhalter',
  1,
  ARRAY['begegnung austausch', 'kerze', 'gold', 'schwarz', 'stimmung', 'gastfreundschaft', 'warm'],
  'Modern',
  'Metall',
  'Schwarz',
  ARRAY['wohnzimmer', 'esszimmer', 'kueche', 'flur'],
  'Kerzenlicht schafft wie kein anderes Licht eine Atmosphäre der Verbundenheit und Wärme. Dieses Set aus drei verschiedenen Höhen lässt sich variabel gruppieren und sorgt für stimmungsvolle Tisch- oder Regalinszenierungen.',
  true,
  6
),

(
  'Bodenkissen "Gather" Terrakotta',
  'Großes Sitzkissen, 70 × 70 × 20 cm, mit Bezug aus recyceltem Baumwoll-Canvas in warmem Terrakotta-Orange. Wendbar, abnehmbarer Bezug, waschbar bei 40 °C.',
  'https://www.sklum.com/de/kaufen-kissen/119842-bodenkissen-gather-terrakotta-70x70.html',
  NULL,
  79.00,
  'Sklum',
  'Kissen',
  'Bodenkissen',
  1,
  ARRAY['begegnung austausch', 'sitzen', 'bodenkissen', 'terrakotta', 'gemeinschaft', 'boho', 'orange'],
  'Boho',
  'Baumwolle',
  'Orange',
  ARRAY['wohnzimmer', 'yogaraum', 'kinderzimmer', 'studio'],
  'Bodenkissen schaffen eine informelle, einladende Sitzsituation, die Hierarchien abbaut und echte Begegnung fördert. Die Terrakotta-Farbe ist warm und lebendig – sie macht jeden Raum gastfreundlicher und fügt sich perfekt in erdige Farbpaletten.',
  true,
  8
);

-- =============================================================
-- Zum Testen: Alle eingefügten Produkte anzeigen
-- =============================================================
-- SELECT id, name, partner, category, module, priority, is_active
-- FROM public.products
-- ORDER BY priority DESC;
