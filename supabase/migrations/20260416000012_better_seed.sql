-- ── Replace inspiration seed with 60 high-quality interior photos ─────────────
-- Safe to run standalone – no user_id dependency.

DELETE FROM public.inspiration_images;

INSERT INTO public.inspiration_images
  (image_url, title, description, room_effect, room_type, colors, tags)
VALUES

-- ────────────────────────────────────────────────────────────────────────────
-- RUHE & ERHOLUNG
-- ────────────────────────────────────────────────────────────────────────────

('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
 'Nordische Stille',
 'Helles Wohnzimmer mit natürlichen Materialien – eine Einladung zum Innehalten.',
 'ruhe_erholung','wohnzimmer',
 ARRAY['#C8D5B9','#F0E6D3','#8B9E7A'], ARRAY['skandinavisch','natürlich','hell','holz','leinen']),

('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
 'Minimalismus pur',
 'Weniger ist mehr – ein Raum der atmet und Platz für das Wesentliche lässt.',
 'ruhe_erholung','wohnzimmer',
 ARRAY['#F5F0E8','#FFFFFF','#C8D5B9'], ARRAY['minimal','weiß','hell','ruhig','luftig']),

('https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
 'Japandi Wohnzimmer',
 'Die Stille japanischer Ästhetik verbindet sich mit skandinavischer Wärme.',
 'ruhe_erholung','wohnzimmer',
 ARRAY['#D4C5B0','#8B7355','#E8E0D5'], ARRAY['japandi','holz','neutral','texturen','zeitlos']),

('https://images.unsplash.com/photo-1611892440504-42453f32a8e7?w=800&q=80',
 'Nordisches Wohnzimmer',
 'Helles Weiß, weiche Textilien und ein Hauch Grün – so lebt der Norden.',
 'ruhe_erholung','wohnzimmer',
 ARRAY['#FFFFFF','#E8E0D5','#C8D5B9'], ARRAY['nordic','weiß','pflanzen','textilien','licht']),

('https://images.unsplash.com/photo-1519710164239-da0a83b2d0da?w=800&q=80',
 'Hygge-Ecke',
 'Kerzen, weiche Decken und warmes Licht – das Gefühl von Geborgenheit.',
 'ruhe_erholung','wohnzimmer',
 ARRAY['#C4956A','#F0E6D3','#8B7355'], ARRAY['hygge','warm','kerzen','gemütlich','dänisch']),

('https://images.unsplash.com/photo-1618220048045-10a6dbdf1b44?w=800&q=80',
 'Weiches Schlafzimmer',
 'Warme Bettwäsche und natürliche Texturen schaffen einen Rückzugsort.',
 'ruhe_erholung','schlafzimmer',
 ARRAY['#F0E6D3','#D4B896','#FFFFFF'], ARRAY['weich','warm','gemütlich','bettwäsche','pastelltöne']),

('https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
 'Skandinavisches Schlafzimmer',
 'Weiß, Holz und ein Hauch Grün – Schlichtheit als Form von Luxus.',
 'ruhe_erholung','schlafzimmer',
 ARRAY['#FFFFFF','#C8D5B9','#D4B896'], ARRAY['skandinavisch','weißtöne','holz','pflanze','schlicht']),

('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
 'Luftiges Loftschlafzimmer',
 'Hohe Decken und klare Linien – urbane Leichtigkeit zum Schlafen.',
 'ruhe_erholung','schlafzimmer',
 ARRAY['#FFFFFF','#E8E0D5','#B0A898'], ARRAY['loft','luftig','urban','weiß','schlicht']),

('https://images.unsplash.com/photo-1600487018819-1bae3f1694cb?w=800&q=80',
 'Soft Bedroom',
 'Alles in sanften Tönen – ein Schlafzimmer das entspannt, bevor man die Augen schließt.',
 'ruhe_erholung','schlafzimmer',
 ARRAY['#EDE0D4','#D4B896','#F5F0E8'], ARRAY['sand','pastelltöne','soft','ruhig','cozy']),

('https://images.unsplash.com/photo-1560185127-6ed189168982?w=800&q=80',
 'Spa-Atmosphäre',
 'Naturstein, Holz und weiche Töne – eine persönliche Wellness-Oase.',
 'ruhe_erholung','badezimmer',
 ARRAY['#C8D5B9','#E8D5C0','#6B7C73'], ARRAY['spa','wellness','stein','holz','entspannung']),

('https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
 'Marmor & Stille',
 'Weißer Marmor und klare Linien – ein Bad wie ein privates Spa.',
 'ruhe_erholung','badezimmer',
 ARRAY['#FFFFFF','#E8E0D5','#C8C0B8'], ARRAY['marmor','weiß','luxus','spa','klarheit']),

('https://images.unsplash.com/photo-1574359411557-2ccbf7a60e0d?w=800&q=80',
 'Helles Tageslichtbad',
 'Viel Licht, klare Formen und natürliche Materialien.',
 'ruhe_erholung','badezimmer',
 ARRAY['#FFFFFF','#F0E8E0','#D4C8C0'], ARRAY['hell','tageslicht','sauber','modern','natural']),

('https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
 'Meditationsecke',
 'Minimalistisch und still – dieser Raum lädt zum Zentrieren ein.',
 'ruhe_erholung','yogaraum',
 ARRAY['#F5F0E8','#C8D5B9','#8B9E7A'], ARRAY['meditation','yoga','minimal','pflanzen','stille']),

('https://images.unsplash.com/photo-1595526051535-08e7e0ed78f3?w=800&q=80',
 'Lichtdurchfluteter Yogaraum',
 'Weiches Morgenlicht und Holzboden – perfekt für die tägliche Praxis.',
 'ruhe_erholung','yogaraum',
 ARRAY['#F0EBE0','#C8D5B9','#FFFFFF'], ARRAY['yoga','morgen','holz','licht','zen']),

('https://images.unsplash.com/photo-1486946255873-ef5d7a7c4122?w=800&q=80',
 'Zen-Retreat',
 'Pflanzen, Ruhe und gedämpftes Licht – ein Raum für innere Stille.',
 'ruhe_erholung','yogaraum',
 ARRAY['#8B9E7A','#C8D5B9','#F5F0E8'], ARRAY['zen','pflanzen','ruhe','grün','rückzug']),

-- ────────────────────────────────────────────────────────────────────────────
-- FOKUS & KONZENTRATION
-- ────────────────────────────────────────────────────────────────────────────

('https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
 'Klares Homeoffice',
 'Aufgeräumter Schreibtisch, neutrale Farben – eine Umgebung die den Geist schärft.',
 'fokus_konzentration','arbeitszimmer',
 ARRAY['#FFFFFF','#4A5568','#E2E8F0'], ARRAY['homeoffice','minimal','aufgeräumt','produktiv','desk']),

('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
 'Minimalistisches Büro',
 'Schlichtes Design ohne Ablenkung – hier entfaltet sich Konzentration.',
 'fokus_konzentration','arbeitszimmer',
 ARRAY['#F8F9FA','#343A40','#6C757D'], ARRAY['büro','minimal','grau','weiß','konzentriert']),

('https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80',
 'Schreibtisch mit Pflanze',
 'Ein Pflänzchen, klarer Schreibtisch und das richtige Licht – perfekte Fokus-Zone.',
 'fokus_konzentration','arbeitszimmer',
 ARRAY['#F5F0E8','#8B9E7A','#FFFFFF'], ARRAY['desk','pflanze','tageslicht','fokus','clean']),

('https://images.unsplash.com/photo-1596394523183-5dce7d2f8a49?w=800&q=80',
 'Dark-Mode Workspace',
 'Dunkles Holz und warmes Licht – für konzentrierte Abendstunden.',
 'fokus_konzentration','arbeitszimmer',
 ARRAY['#2C1810','#8B7355','#F0E6D3'], ARRAY['dunkel','holz','warm','abend','produktiv']),

('https://images.unsplash.com/photo-1609766454-c24b6819d5bd?w=800&q=80',
 'Minimales Studio-Büro',
 'Klare Linie, kein Überfluss – ein Raum für tiefe Arbeit.',
 'fokus_konzentration','arbeitszimmer',
 ARRAY['#FFFFFF','#E8E0D8','#4A4A4A'], ARRAY['studio','klar','minimal','fokus','modern']),

('https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=800&q=80',
 'Clean Workspace',
 'Wenige Objekte, viel Raum zum Denken.',
 'fokus_konzentration','arbeitszimmer',
 ARRAY['#FFFFFF','#D0C8C0','#6C757D'], ARRAY['clean','desk','aufgeräumt','fokus','produktiv']),

('https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
 'Leseecke mit Charakter',
 'Regal, Sessel und das richtige Licht – perfekt zum Versinken in Büchern.',
 'fokus_konzentration','wohnzimmer',
 ARRAY['#2C3E50','#E8D5C0','#95A5A6'], ARRAY['lesen','bücher','regal','sessel','ruhig']),

('https://images.unsplash.com/photo-1571751266294-b794c36b6562?w=800&q=80',
 'Nordic Reading Room',
 'Weiche Farben und natürliche Texturen für lange Lesestunden.',
 'fokus_konzentration','wohnzimmer',
 ARRAY['#F0EBE0','#C8D5B9','#8B9E7A'], ARRAY['nordisch','lesen','natural','beige','entspannt']),

('https://images.unsplash.com/photo-1479242506682-9cdaae186d64?w=800&q=80',
 'Hausbibliothek',
 'Wandregale voller Bücher – das Rückgrat jedes Lesers.',
 'fokus_konzentration','wohnzimmer',
 ARRAY['#8B7355','#C4956A','#2C3E50'], ARRAY['bücher','bibliothek','regale','holz','wissen']),

('https://images.unsplash.com/photo-1583845440985-b2a4c8afe28b?w=800&q=80',
 'Modernes Bad',
 'Klare Formen, heller Marmor und strukturlose Wände – Klarheit und Frische.',
 'fokus_konzentration','badezimmer',
 ARRAY['#FFFFFF','#E2E8F0','#CBD5E0'], ARRAY['marmor','modern','hell','sauber','klar']),

-- ────────────────────────────────────────────────────────────────────────────
-- ENERGIE & AKTIVITÄT
-- ────────────────────────────────────────────────────────────────────────────

('https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
 'Lebendiges Wohnzimmer',
 'Kräftige Akzentfarben und klare Linien erzeugen Dynamik und Lebendigkeit.',
 'energie_aktivitaet','wohnzimmer',
 ARRAY['#C96A50','#2D5A4F','#F5F0E8'], ARRAY['terrakotta','dynamisch','farbenfroh','modern','kontrast']),

('https://images.unsplash.com/photo-1629567285737-7a1b97bf9c90?w=800&q=80',
 'Frischer Wohnbereich',
 'Lebhafte Akzente und offene Raumstruktur bringen Schwung in den Alltag.',
 'energie_aktivitaet','wohnzimmer',
 ARRAY['#C96A50','#8B9E7A','#FFFFFF'], ARRAY['akzentfarben','offen','modern','frisch','farbe']),

('https://images.unsplash.com/photo-1534187886935-53e72d96d575?w=800&q=80',
 'Statement Living',
 'Ein Wohnzimmer das Persönlichkeit zeigt – kein Raum für Langeweile.',
 'energie_aktivitaet','wohnzimmer',
 ARRAY['#2C3E50','#C96A50','#F0E6D3'], ARRAY['bold','statement','kontrast','dunkel','dynamisch']),

('https://images.unsplash.com/photo-1580466811-85ab4dd0b225?w=800&q=80',
 'Energie-Wohnzimmer',
 'Sattes Blau und warme Akzente – ein Raum der wachmacht.',
 'energie_aktivitaet','wohnzimmer',
 ARRAY['#2C4A6B','#C4956A','#F0E6D3'], ARRAY['blau','warm','kontrast','energie','modern']),

('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
 'Dynamische Küche',
 'Frische Farben und durchdachte Organisation bringen Freude ans Kochen.',
 'energie_aktivitaet','kueche',
 ARRAY['#FFFFFF','#4A5568','#C8D5B9'], ARRAY['küche','modern','hell','sauber','kochen']),

('https://images.unsplash.com/photo-1602028915047-37269d369887?w=800&q=80',
 'Moderne Profiküche',
 'Klare Linie, Edelstahl und frische Farben – Kochen als Erlebnis.',
 'energie_aktivitaet','kueche',
 ARRAY['#FFFFFF','#8B9E7A','#2C3E50'], ARRAY['profiküche','modern','grün','edelstahl','clean']),

('https://images.unsplash.com/photo-1556909212-d5a3d1852a8e?w=800&q=80',
 'Weiße Küche',
 'Klare Strukturen und helle Oberflächen laden zum aktiven Kochen ein.',
 'energie_aktivitaet','kueche',
 ARRAY['#FFFFFF','#F0E8E0','#4A5568'], ARRAY['weiß','küche','clean','hell','modern']),

('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
 'Aktiver Yoga-Raum',
 'Heller, offener Raum mit Bewegungsfreiheit – ideal für Energie und Flow.',
 'energie_aktivitaet','yogaraum',
 ARRAY['#FFFFFF','#8B9E7A','#E8D5C0'], ARRAY['yoga','hell','offen','bewegung','energie']),

('https://images.unsplash.com/photo-1580587771525-4b4ae6a91e91?w=800&q=80',
 'Yoga-Studio Licht',
 'Große Fenster, weicher Boden und klare Energie – Raum für Bewegung.',
 'energie_aktivitaet','yogaraum',
 ARRAY['#F0EBE0','#FFFFFF','#C8D5B9'], ARRAY['studio','licht','yoga','flow','offen']),

-- ────────────────────────────────────────────────────────────────────────────
-- KREATIVITÄT & INSPIRATION
-- ────────────────────────────────────────────────────────────────────────────

('https://images.unsplash.com/photo-1588854671070-c3ee17c1082f?w=800&q=80',
 'Eklektisches Wohnzimmer',
 'Mutige Mischung aus Texturen, Farben und Formen – Kreativität fördern.',
 'kreativitaet_inspiration','wohnzimmer',
 ARRAY['#C4956A','#8B9E7A','#C96A50'], ARRAY['bunt','eklektisch','texturen','kunst','individuell']),

('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
 'Farbenfrohes Interieur',
 'Jede Wand, jede Ecke erzählt eine Geschichte – bunt und persönlich.',
 'kreativitaet_inspiration','wohnzimmer',
 ARRAY['#C96A50','#8B9E7A','#C4956A'], ARRAY['farbenfroh','persönlich','mutig','bunt','charakter']),

('https://images.unsplash.com/photo-1560731705-3df45a9ac2ce?w=800&q=80',
 'Boho Wohnzimmer',
 'Rattan, Pflanzen und Muster – eine Hommage an freies Denken.',
 'kreativitaet_inspiration','wohnzimmer',
 ARRAY['#C4956A','#8B7355','#C8D5B9'], ARRAY['boho','rattan','pflanzen','muster','wärme']),

('https://images.unsplash.com/photo-1603912757537-e6c2af9549b8?w=800&q=80',
 'Künstlerisches Wohnzimmer',
 'Kunst an jeder Wand, durchdachte Details – Inspirationsquelle zu Hause.',
 'kreativitaet_inspiration','wohnzimmer',
 ARRAY['#2C3E50','#C4956A','#F0E6D3'], ARRAY['kunst','galerie','wand','persönlich','kreativ']),

('https://images.unsplash.com/photo-1616137133836-5a3ec25f4745?w=800&q=80',
 'Kreativer Workspace',
 'Pinwand, Pflanzen und helles Licht – eine Werkstatt für Ideen.',
 'kreativitaet_inspiration','arbeitszimmer',
 ARRAY['#FFFFFF','#8B9E7A','#C4956A'], ARRAY['workspace','ideen','pflanzen','hell','kreativ']),

('https://images.unsplash.com/photo-1626895076527-2e5ddb14be0e?w=800&q=80',
 'Studio-Workspace',
 'Große Tische, gutes Licht und ein Hauch Chaos – hier entstehen Ideen.',
 'kreativitaet_inspiration','arbeitszimmer',
 ARRAY['#F0EBE0','#8B7355','#C4956A'], ARRAY['studio','kreativ','tisch','licht','ideen']),

('https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
 'Schlafzimmer mit Seele',
 'Pflanzen, Bücher und persönliche Objekte – ein Raum der von dir erzählt.',
 'kreativitaet_inspiration','schlafzimmer',
 ARRAY['#8B9E7A','#F0E6D3','#2D5A4F'], ARRAY['pflanzen','bücher','persönlich','grün','hygge']),

('https://images.unsplash.com/photo-1610557893894-5b7a44c8d7de?w=800&q=80',
 'Boho Schlafzimmer',
 'Traumfänger, Textilien und warme Töne – ein persönlicher Rückzugsort.',
 'kreativitaet_inspiration','schlafzimmer',
 ARRAY['#C4956A','#8B7355','#F0E6D3'], ARRAY['boho','traumfänger','warm','textilien','persönlich']),

('https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80',
 'Künstler-Studio',
 'Offener Raum mit Persönlichkeit – jede Ecke erzählt eine Geschichte.',
 'kreativitaet_inspiration','sonstiges',
 ARRAY['#2C3E50','#C4956A','#E8D5C0'], ARRAY['studio','atelier','kunst','offen','industrial']),

('https://images.unsplash.com/photo-1614602781854-de0e46c3a487?w=800&q=80',
 'Industrial Loft',
 'Rohbeton, Stahl und warme Akzente – Kreativität braucht Raum.',
 'kreativitaet_inspiration','sonstiges',
 ARRAY['#6B6B6B','#C4956A','#E8D5C0'], ARRAY['industrial','loft','beton','stahl','kreativ']),

-- ────────────────────────────────────────────────────────────────────────────
-- BEGEGNUNG & AUSTAUSCH
-- ────────────────────────────────────────────────────────────────────────────

('https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
 'Einladendes Esszimmer',
 'Runder Tisch, warmes Licht und weiche Stühle – perfekt für gemeinsame Abende.',
 'begegnung_austausch','esszimmer',
 ARRAY['#C4956A','#F0E6D3','#8B9E7A'], ARRAY['esszimmer','tisch','warm','gemeinschaft','holz']),

('https://images.unsplash.com/photo-1617104551744-f46e7aa74b59?w=800&q=80',
 'Heller Essbereich',
 'Natürliches Licht und warme Holztöne – herzliche Atmosphäre zum Verweilen.',
 'begegnung_austausch','esszimmer',
 ARRAY['#C4956A','#F0E6D3','#FFFFFF'], ARRAY['holz','hell','tisch','stühle','gastfreundschaft']),

('https://images.unsplash.com/photo-1578683094948-96e8dca6c776?w=800&q=80',
 'Langer Esstisch',
 'Ein Tisch für viele – Begegnungen finden hier ihren Raum.',
 'begegnung_austausch','esszimmer',
 ARRAY['#8B7355','#F0E6D3','#2C3E50'], ARRAY['langer tisch','holz','gemeinschaft','offen','gastgeber']),

('https://images.unsplash.com/photo-1618219636372-a4e10a2e4849?w=800&q=80',
 'Modernes Esszimmer',
 'Klare Linien und warme Materialien – Essen als Ritual.',
 'begegnung_austausch','esszimmer',
 ARRAY['#E8D5C0','#8B7355','#FFFFFF'], ARRAY['modern','esszimmer','warm','tisch','ritual']),

('https://images.unsplash.com/photo-1477120130473-94f42c44f8ec?w=800&q=80',
 'Familien-Esszimmer',
 'Warm, einladend und ohne Schnickschnack – hier wird Familie gelebt.',
 'begegnung_austausch','esszimmer',
 ARRAY['#C4956A','#8B7355','#F5F0E8'], ARRAY['familie','warm','holz','einladend','gemütlich']),

('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
 'Geselliges Wohnzimmer',
 'Großzügige Sitzgruppe und offene Atmosphäre – einladend für Freunde.',
 'begegnung_austausch','wohnzimmer',
 ARRAY['#C96A50','#F0E6D3','#2D5A4F'], ARRAY['gemütlich','sofa','offen','warm','einladend']),

('https://images.unsplash.com/photo-1499955085172-a104c9463ece?w=800&q=80',
 'Offenes Wohnzimmer',
 'Viel Raum und weiche Möbel – hier hat Gesellschaft Platz.',
 'begegnung_austausch','wohnzimmer',
 ARRAY['#F0E6D3','#C4956A','#FFFFFF'], ARRAY['offen','sofa','hell','groß','gesellig']),

('https://images.unsplash.com/photo-1519338043786-cac4bafe2b89?w=800&q=80',
 'Open Plan Living',
 'Fließende Übergänge zwischen Küche, Essen und Wohnen.',
 'begegnung_austausch','wohnzimmer',
 ARRAY['#FFFFFF','#C4956A','#8B9E7A'], ARRAY['open plan','offen','modern','durchgang','groß']),

('https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
 'Offene Küche',
 'Kücheninsel und offener Grundriss laden zum gemeinsamen Kochen ein.',
 'begegnung_austausch','kueche',
 ARRAY['#FFFFFF','#C4956A','#4A5568'], ARRAY['offene küche','kücheninsel','modern','hell','kochen']),

('https://images.unsplash.com/photo-1556909172-54557c7e4bd7?w=800&q=80',
 'Kücheninsel für alle',
 'Eine Insel die verbindet – Kochen und Reden in einem.',
 'begegnung_austausch','kueche',
 ARRAY['#FFFFFF','#8B9E7A','#4A5568'], ARRAY['kücheninsel','offen','kochen','modern','hell']),

('https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
 'Social Kitchen',
 'Großzügige Küche mit Barhockern – der gesellige Mittelpunkt des Hauses.',
 'begegnung_austausch','kueche',
 ARRAY['#FFFFFF','#C4956A','#2C3E50'], ARRAY['social','bar','sitzen','kochen','gemeinschaft']);
