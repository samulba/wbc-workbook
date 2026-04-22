// Shared helper — maps warmth / brightness sliders to a CSS preview background.

export function lightPreviewCss(warmth: number, brightness: number) {
  const stops = [
    { w:   0, rgb: [166, 202, 222] }, // cool blue-white
    { w:  50, rgb: [245, 240, 225] }, // neutral cream
    { w: 100, rgb: [255, 200, 140] }, // warm amber
  ];
  let a = stops[0], b = stops[1];
  if (warmth >= 50) { a = stops[1]; b = stops[2]; }
  const t   = warmth >= 50 ? (warmth - 50) / 50 : warmth / 50;
  const rgb = a.rgb.map((v, i) => Math.round(v + (b.rgb[i] - v) * t));

  const bLuma   = brightness / 100;
  const overlay = 1 - bLuma;
  const main    = `rgb(${rgb.join(",")})`;
  const shade   = `rgba(0,0,0,${0.15 + overlay * 0.45})`;

  return {
    background: `radial-gradient(ellipse at 50% 30%, ${main} 0%, ${shade} 90%)`,
    overlay:    `linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,${overlay * 0.35}) 100%)`,
  };
}

export function warmthLabel(w: number) {
  return w < 35 ? "Kühl" : w > 65 ? "Warm" : "Neutral";
}

export function brightnessLabel(b: number) {
  return b < 35 ? "Gedimmt" : b > 70 ? "Hell" : "Sanft";
}

// Approximate Kelvin from 0..100 warmth (client-side label only).
export function approxKelvin(warmth: number): number {
  // 100 (very warm) → ~2200K, 50 (neutral) → ~4000K, 0 (cool) → ~6000K
  return Math.round(6000 - (warmth / 100) * 3800);
}
