import type { RoomEffect } from "./effectsConfig";

export interface ColorPalette {
  name: string;
  description: string;
  primary: [string, string];
  secondary: [string, string];
  accent: string;
}

export const COLOR_PALETTES: Record<RoomEffect, ColorPalette[]> = {
  ruhe_erholung: [
    {
      name: "Sage & Linen",
      description: "Naturverbunden, sanft und regenerierend",
      primary:   ["#94c1a4", "#f0e8d8"],
      secondary: ["#c4b4a0", "#ddd0c0"],
      accent:    "#9e5c40",
    },
    {
      name: "Stone & Birch",
      description: "Ruhig, zeitlos und geerdet",
      primary:   ["#cac4b8", "#eee8de"],
      secondary: ["#a8a098", "#d8d0c4"],
      accent:    "#445c49",
    },
  ],

  fokus_konzentration: [
    {
      name: "Nordic White",
      description: "Klar, ablenkungsfrei und strukturiert",
      primary:   ["#f4f1ec", "#d8dde0"],
      secondary: ["#e0dcd4", "#c0ccd2"],
      accent:    "#2c3c48",
    },
    {
      name: "Warm Study",
      description: "Konzentriert mit wärmender Tiefe",
      primary:   ["#ede8e0", "#c8cec8"],
      secondary: ["#d8d4cc", "#b8c0b8"],
      accent:    "#445c49",
    },
  ],

  energie_aktivitaet: [
    {
      name: "Terracotta Sun",
      description: "Lebendig, warm und motivierend",
      primary:   ["#f0e4d4", "#c47848"],
      secondary: ["#d4a870", "#e8c890"],
      accent:    "#2c3c28",
    },
    {
      name: "Bold Earth",
      description: "Kraftvoll, satt und dynamisch",
      primary:   ["#e8d8c0", "#a85030"],
      secondary: ["#c89060", "#d0a878"],
      accent:    "#3c2c20",
    },
  ],

  kreativitaet_inspiration: [
    {
      name: "Creative Studio",
      description: "Verspielt, warm und ideenreich",
      primary:   ["#f6ede2", "#cba178"],
      secondary: ["#94c1a4", "#e8c090"],
      accent:    "#5c3060",
    },
    {
      name: "Artist Warm",
      description: "Inspirierend mit charakterstarken Akzenten",
      primary:   ["#f0e4d8", "#c8a060"],
      secondary: ["#d4c0a0", "#94a878"],
      accent:    "#6c3050",
    },
  ],

  begegnung_austausch: [
    {
      name: "Forest Social",
      description: "Einladend, warm und verbindend",
      primary:   ["#445c49", "#f6ede2"],
      secondary: ["#94c1a4", "#e8dcc8"],
      accent:    "#823509",
    },
    {
      name: "Warm Gathering",
      description: "Offen, gemütlich und herzlich",
      primary:   ["#3c5440", "#f0e8d8"],
      secondary: ["#7aac88", "#e0d4c0"],
      accent:    "#9c5020",
    },
  ],
};

export const FALLBACK_PALETTES: ColorPalette[] = [
  {
    name: "Naturell",
    description: "Zeitlos, warm und harmonisch",
    primary:   ["#d4cfc8", "#f0ece4"],
    secondary: ["#bab4ac", "#e0dcd4"],
    accent:    "#8a7060",
  },
  {
    name: "Klassisch",
    description: "Klar, ausgewogen und edel",
    primary:   ["#e8e4dc", "#c8c4bc"],
    secondary: ["#d4d0c8", "#b0acA4"],
    accent:    "#445c49",
  },
];
