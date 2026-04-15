export interface Product {
  id:            string;
  name:          string;
  description:   string | null;
  affiliate_url: string;
  image_url:     string | null;
  price:         number | null;
  partner:       string | null;
  category:      string | null;
  subcategory:   string | null;
  module:        number | null;
  tags:          string[];
  style:         string | null;
  material:      string | null;
  color_family:  string | null;
  room_types:    string[];
  why_fits:      string | null;
  is_active:     boolean;
  priority:      number;
  created_at:    string;
  updated_at:    string;
}

export type ProductInsert = Omit<Product, "id" | "created_at" | "updated_at">;
export type ProductUpdate = Partial<ProductInsert>;

// ── Static option lists ───────────────────────────────────────────────────────

export const PARTNERS = [
  "Westwing", "Sklum", "Paulmann", "Aplanta", "IKEA", "Connox",
  "Hay", "Muuto", "Fritz Hansen", "Bloomingville", "Sonstiges",
] as const;

export const CATEGORIES = [
  "Sofa", "Sessel", "Lampe", "Pendelleuchte", "Stehleuchte", "Tischleuchte",
  "Pflanze", "Duft", "Teppich", "Kissen", "Vorhang", "Sideboard",
  "Regal", "Esstisch", "Couchtisch", "Beistelltisch", "Stuhl",
  "Bett", "Badaccessoire", "Kunst", "Spiegel", "Dekoobjekt", "Sonstiges",
] as const;

export const STYLES = [
  "Modern", "Skandinavisch", "Boho", "Industrial", "Klassisch",
  "Minimalistisch", "Japandi", "Mediterran", "Rustikal", "Art Deco", "Sonstiges",
] as const;

export const MATERIALS = [
  "Holz", "Eiche", "Metall", "Stahl", "Messing", "Stoff", "Leder",
  "Kunstleder", "Keramik", "Glas", "Kunststoff", "Wolle", "Leinen",
  "Baumwolle", "Marmor", "Bambus", "Rattan", "Sonstiges",
] as const;

export const COLOR_FAMILIES = [
  "Weiß", "Grau", "Beige", "Schwarz", "Braun", "Grün", "Blau",
  "Gelb", "Rot", "Pink", "Orange", "Lila", "Bunt", "Natur",
] as const;

export const ROOM_TYPE_LABELS: Record<string, string> = {
  wohnzimmer:    "Wohnzimmer",
  schlafzimmer:  "Schlafzimmer",
  arbeitszimmer: "Arbeitszimmer",
  kinderzimmer:  "Kinderzimmer",
  badezimmer:    "Bad",
  kueche:        "Küche",
  esszimmer:     "Esszimmer",
  flur:          "Flur",
  keller:        "Keller",
  buero:         "Büro",
  yogaraum:      "Yogaraum",
  wellness:      "Wellness",
  studio:        "Studio",
  sonstiges:     "Sonstiges",
};
