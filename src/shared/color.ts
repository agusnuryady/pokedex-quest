import { palette } from './theme';

function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** Ink or white, whichever reads better on the given background. */
export function readableTextOn(backgroundHex: string): string {
  return luminance(backgroundHex) > 0.4 ? palette.ink : palette.white;
}

/** "#RRGGBB" + opacity 0–1 → "#RRGGBBAA" */
export function withAlpha(hex: string, opacity: number): string {
  const alpha = Math.round(Math.min(1, Math.max(0, opacity)) * 255).toString(16).padStart(2, '0');
  return `${hex}${alpha}`;
}
