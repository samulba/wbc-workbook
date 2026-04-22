/**
 * OpenAI pricing table (USD per unit, in micro-dollars for integer math).
 * Update when OpenAI changes rates — pulled from platform.openai.com/pricing.
 * 1 USD = 1_000_000 micros. $0.042 = 42_000 micros.
 */

// ── GPT-4o (vision / chat) ───────────────────────────────────────────────────
// Input:  $2.50 / 1M tokens → 2.5 micros per token
// Output: $10.00 / 1M tokens → 10  micros per token
const GPT4O_INPUT_MICROS_PER_TOKEN  = 2.5;
const GPT4O_OUTPUT_MICROS_PER_TOKEN = 10;

export function gpt4oCostMicros(inputTokens: number, outputTokens: number): number {
  return Math.round(
    inputTokens * GPT4O_INPUT_MICROS_PER_TOKEN +
    outputTokens * GPT4O_OUTPUT_MICROS_PER_TOKEN,
  );
}

// ── gpt-image-1 (image generation / edit) ────────────────────────────────────
// Per-image price depends on size × quality.
// Source: https://platform.openai.com/docs/pricing
const IMAGE_PRICE_MICROS: Record<string, Record<string, number>> = {
  "1024x1024": { low: 11_000,  medium: 42_000,  high: 167_000 },
  "1024x1536": { low: 16_000,  medium: 63_000,  high: 250_000 },
  "1536x1024": { low: 16_000,  medium: 63_000,  high: 250_000 },
};

export type ImageQuality = "low" | "medium" | "high";
export type ImageSize    = "1024x1024" | "1024x1536" | "1536x1024";

export function gptImage1CostMicros(
  size: ImageSize,
  quality: ImageQuality,
  count = 1,
): number {
  const tier = IMAGE_PRICE_MICROS[size]?.[quality] ?? IMAGE_PRICE_MICROS["1024x1024"].medium;
  return tier * count;
}

// ── Formatters ───────────────────────────────────────────────────────────────

export function microsToUsd(micros: number): number {
  return micros / 1_000_000;
}

export function formatUsd(micros: number): string {
  const usd = microsToUsd(micros);
  if (usd >= 1)    return `$${usd.toFixed(2)}`;
  if (usd >= 0.01) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(4)}`;
}
