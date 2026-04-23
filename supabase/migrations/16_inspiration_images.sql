-- ── Inspiration images table ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.inspiration_images (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url   TEXT        NOT NULL,
  title       TEXT,
  description TEXT,
  room_effect TEXT,       -- ruhe_erholung | fokus_konzentration | energie_aktivitaet | kreativitaet_inspiration | begegnung_austausch
  room_type   TEXT,       -- wohnzimmer | schlafzimmer | arbeitszimmer | kueche | badezimmer | yogaraum | …
  colors      TEXT[]      NOT NULL DEFAULT '{}',
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  source_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public read access (curated content, no auth needed)
ALTER TABLE public.inspiration_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inspiration_images_public_read"
  ON public.inspiration_images FOR SELECT
  USING (true);

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_inspiration_room_effect ON public.inspiration_images (room_effect);
CREATE INDEX IF NOT EXISTS idx_inspiration_room_type   ON public.inspiration_images (room_type);
CREATE INDEX IF NOT EXISTS idx_inspiration_created_at  ON public.inspiration_images (created_at DESC);

-- ── Seed data ──────────────────────────────────────────────────────────────────
INSERT INTO public.inspiration_images
  (image_url, title, description, room_effect, room_type, colors, tags)
VALUES

-- Ruhe & Erholung – Wohnzimmer
('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
 'Nordische Stille', 'Helles Wohnzimmer mit natürlichen Materialien und gedämpfter Farbpalette – eine Einladung zum Innehalten.',
 'ruhe_erholung', 'wohnzimmer',
 ARRAY['#C8D5B9','#F0E6D3','#8B9E7A'], ARRAY['skandinavisch','hell','natürlich','holz','leinen']),

-- Ruhe & Erholung – Schlafzimmer
('https://images.unsplash.com/photo-1618220048045-10a6dbdf1b44?w=800&q=80',
 'Weiches Schlafzimmer', 'Warme Bettwäsche, gedämpftes Licht und natürliche Texturen schaffen einen Rückzugsort.',
 'ruhe_erholung', 'schlafzimmer',
 ARRAY['#F0E6D3','#D4B896','#FFFFFF'], ARRAY['weich','warm','gemütlich','bettwäsche','pastelltöne']),

-- Ruhe & Erholung – Badezimmer
('https://images.unsplash.com/photo-1560185127-6ed189168982?w=800&q=80',
 'Spa-Atmosphäre', 'Naturstein, Holz und weiche Töne verwandeln das Bad in eine persönliche Wellness-Oase.',
 'ruhe_erholung', 'badezimmer',
 ARRAY['#C8D5B9','#E8D5C0','#6B7C73'], ARRAY['spa','wellness','stein','holz','entspannung']),

-- Ruhe & Erholung – Yogaraum
('https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
 'Meditationsecke', 'Minimalistisch und still – dieser Raum lädt zum Atemholen und Zentrieren ein.',
 'ruhe_erholung', 'yogaraum',
 ARRAY['#F5F0E8','#C8D5B9','#8B9E7A'], ARRAY['meditation','yoga','minimal','pflanzen','stille']),

-- Fokus & Konzentration – Arbeitszimmer
('https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
 'Klares Homeoffice', 'Aufgeräumter Schreibtisch, neutrale Farben – eine Umgebung, die den Geist schärft.',
 'fokus_konzentration', 'arbeitszimmer',
 ARRAY['#FFFFFF','#4A5568','#E2E8F0'], ARRAY['homeoffice','minimal','aufgeräumt','produktiv','desk']),

-- Fokus & Konzentration – Arbeitszimmer
('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
 'Minimalistisches Büro', 'Schlichtes Design ohne Ablenkung – hier entfaltet sich Konzentration.',
 'fokus_konzentration', 'arbeitszimmer',
 ARRAY['#F8F9FA','#343A40','#6C757D'], ARRAY['büro','minimal','grau','weiß','konzentriert']),

-- Fokus & Konzentration – Wohnzimmer
('https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
 'Leseecke mit Charakter', 'Schlichtes Regal, weicher Sessel und das richtige Licht – perfekt zum Versinken in Büchern.',
 'fokus_konzentration', 'wohnzimmer',
 ARRAY['#2C3E50','#E8D5C0','#95A5A6'], ARRAY['lesen','bücher','regal','sessel','ruhig']),

-- Energie & Aktivität – Wohnzimmer
('https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
 'Lebendiges Wohnzimmer', 'Kräftige Akzentfarben und klare Linien erzeugen Dynamik und Lebendigkeit.',
 'energie_aktivitaet', 'wohnzimmer',
 ARRAY['#C96A50','#2D5A4F','#F5F0E8'], ARRAY['terrakotta','dynamisch','farbenfroh','modern','kontrast']),

-- Energie & Aktivität – Yogaraum
('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
 'Aktiver Yoga-Raum', 'Heller, offener Raum mit Bewegungsfreiheit – ideal für Energie und Flow.',
 'energie_aktivitaet', 'yogaraum',
 ARRAY['#FFFFFF','#8B9E7A','#E8D5C0'], ARRAY['yoga','hell','offen','bewegung','energie']),

-- Energie & Aktivität – Küche
('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
 'Dynamische Küche', 'Frische Farben und durchdachte Organisation bringen Freude ans Kochen.',
 'energie_aktivitaet', 'kueche',
 ARRAY['#FFFFFF','#4A5568','#C8D5B9'], ARRAY['küche','modern','hell','sauber','kochen']),

-- Kreativität & Inspiration – Wohnzimmer
('https://images.unsplash.com/photo-1588854671070-c3ee17c1082f?w=800&q=80',
 'Eklektisches Wohnzimmer', 'Eine mutige Mischung aus Texturen, Farben und Formen – ein Raum, der Kreativität fördert.',
 'kreativitaet_inspiration', 'wohnzimmer',
 ARRAY['#C4956A','#8B9E7A','#C96A50'], ARRAY['bunt','eklektisch','texturen','kunst','individuell']),

-- Kreativität & Inspiration – Studio
('https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80',
 'Künstler-Studio', 'Offener Raum mit Persönlichkeit – jede Ecke erzählt eine Geschichte.',
 'kreativitaet_inspiration', 'sonstiges',
 ARRAY['#2C3E50','#C4956A','#E8D5C0'], ARRAY['studio','atelier','kunst','offen','industrial']),

-- Kreativität & Inspiration – Arbeitszimmer
('https://images.unsplash.com/photo-1616137133836-5a3ec25f4745?w=800&q=80',
 'Kreativer Workspace', 'Pinwand, Pflanzen und helles Licht – eine Werkstatt für Ideen.',
 'kreativitaet_inspiration', 'arbeitszimmer',
 ARRAY['#FFFFFF','#8B9E7A','#C4956A'], ARRAY['workspace','ideen','pflanzen','hell','kreativ']),

-- Begegnung & Austausch – Wohnzimmer
('https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
 'Einladendes Esszimmer', 'Ein runder Tisch, warmes Licht und weiche Stühle – perfekt für gemeinsame Abende.',
 'begegnung_austausch', 'esszimmer',
 ARRAY['#C4956A','#F0E6D3','#8B9E7A'], ARRAY['esszimmer','tisch','warm','gemeinschaft','holz']),

-- Begegnung & Austausch – Wohnzimmer
('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
 'Geselliges Wohnzimmer', 'Großzügige Sitzgruppe und offene Atmosphäre – einladend für Freunde und Familie.',
 'begegnung_austausch', 'wohnzimmer',
 ARRAY['#C96A50','#F0E6D3','#2D5A4F'], ARRAY['gemütlich','sofa','offen','warm','einladend']),

-- Begegnung & Austausch – Küche
('https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
 'Offene Küche', 'Kücheninsel und offener Grundriss laden zum gemeinsamen Kochen und Genießen ein.',
 'begegnung_austausch', 'kueche',
 ARRAY['#FFFFFF','#C4956A','#4A5568'], ARRAY['offene küche','kücheninsel','modern','hell','kochen']),

-- Ruhe & Erholung – Schlafzimmer
('https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
 'Skandinavisches Schlafzimmer', 'Weiß, Holz und ein Hauch Grün – Schlichtheit als Form von Luxus.',
 'ruhe_erholung', 'schlafzimmer',
 ARRAY['#FFFFFF','#C8D5B9','#D4B896'], ARRAY['skandinavisch','weißtöne','holz','pflanze','schlicht']),

-- Fokus & Konzentration – Badezimmer
('https://images.unsplash.com/photo-1583845440985-b2a4c8afe28b?w=800&q=80',
 'Modernes Bad', 'Klare Formen, heller Marmor und strukturlose Wände schaffen Klarheit und Frische.',
 'fokus_konzentration', 'badezimmer',
 ARRAY['#FFFFFF','#E2E8F0','#CBD5E0'], ARRAY['marmor','modern','hell','sauber','klar']),

-- Kreativität & Inspiration – Schlafzimmer
('https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
 'Schlafzimmer mit Seele', 'Pflanzen, Bücher und persönliche Objekte – ein Raum, der von dir erzählt.',
 'kreativitaet_inspiration', 'schlafzimmer',
 ARRAY['#8B9E7A','#F0E6D3','#2D5A4F'], ARRAY['pflanzen','bücher','persönlich','grün','hygge']),

-- Begegnung & Austausch – Esszimmer
('https://images.unsplash.com/photo-1617104551744-f46e7aa74b59?w=800&q=80',
 'Heller Essbereich', 'Natürliches Licht und warme Holztöne schaffen eine herzliche Atmosphäre zum Verweilen.',
 'begegnung_austausch', 'esszimmer',
 ARRAY['#C4956A','#F0E6D3','#FFFFFF'], ARRAY['holz','hell','tisch','stühle','gastfreundschaft']),

-- Energie & Aktivität – Wohnzimmer
('https://images.unsplash.com/photo-1629567285737-7a1b97bf9c90?w=800&q=80',
 'Frischer Wohnbereich', 'Lebhafte Akzente und eine offene Raumstruktur bringen Schwung in den Alltag.',
 'energie_aktivitaet', 'wohnzimmer',
 ARRAY['#C96A50','#8B9E7A','#FFFFFF'], ARRAY['akzentfarben','offen','modern','frisch','farbe']),

-- Ruhe & Erholung – Wohnzimmer
('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
 'Minimalismus pur', 'Weniger ist mehr – ein Raum, der atmet und Platz für das Wesentliche lässt.',
 'ruhe_erholung', 'wohnzimmer',
 ARRAY['#F5F0E8','#FFFFFF','#C8D5B9'], ARRAY['minimal','weiß','hell','ruhig','luftig']);
