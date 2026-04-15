-- =============================================================
-- Wellbeing Workbook – Seed Data
-- Run AFTER the migration and AFTER creating the test user via
-- Supabase Dashboard or CLI:
--   supabase auth create-user --email test@wellbeing-concepts.de --password Test1234!
-- Then replace the UUID below with the actual user UUID.
-- =============================================================

-- Promote test user to admin (replace UUID after user creation)
-- UPDATE public.profiles
--   SET role = 'admin', full_name = 'Test Admin'
--   WHERE id = '<PASTE-USER-UUID-HERE>';

-- Sample products (visible to all authenticated users)
INSERT INTO public.products (name, description, affiliate_url, price, category, tags) VALUES
(
  'Leinenvorhang Sage',
  'Natürlicher Leinenvorhang in Salbeigrün – stimmungsvoll und luftig.',
  'https://example.com/products/leinenvorhang-sage',
  89.00,
  'Textilien',
  ARRAY['vorhang', 'leinen', 'gruen', 'natur']
),
(
  'Boucle Sessel Creme',
  'Gemütlicher Sessel in Bouclé-Stoff, Cremeweiß.',
  'https://example.com/products/boucle-sessel',
  420.00,
  'Möbel',
  ARRAY['sessel', 'boucle', 'creme', 'wohnzimmer']
),
(
  'Terrakotta Vase Set',
  '3er-Set handgefertigte Terrakotta-Vasen in verschiedenen Größen.',
  'https://example.com/products/terrakotta-vasen',
  54.00,
  'Dekoration',
  ARRAY['vase', 'terrakotta', 'deko', 'handmade']
),
(
  'Schreibtischlampe Forest',
  'Minimalistische Schreibtischlampe in Dunkelgrün mit Messingfuß.',
  'https://example.com/products/schreibtischlampe-forest',
  129.00,
  'Beleuchtung',
  ARRAY['lampe', 'schreibtisch', 'dunkelgruen', 'messing']
),
(
  'Naturstein Untersetzer Set',
  '4er-Set runde Untersetzer aus echtem Marmor.',
  'https://example.com/products/marmor-untersetzer',
  32.00,
  'Dekoration',
  ARRAY['untersetzer', 'marmor', 'stein', 'deko']
);
