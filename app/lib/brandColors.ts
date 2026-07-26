export const BRAND_COLORS = {
  amarelo: { label: "Amarelo", accent: "#ebbb1c", hover: "#f2cb52", foreground: "#171717" },
  verde_limao: { label: "Verde Limão", accent: "#84cc16", hover: "#a3e635", foreground: "#0f1400" },
  azul: { label: "Azul", accent: "#3b82f6", hover: "#60a5fa", foreground: "#ffffff" },
  roxo: { label: "Roxo", accent: "#a855f7", hover: "#c084fc", foreground: "#ffffff" },
  rosa: { label: "Rosa", accent: "#ec4899", hover: "#f472b6", foreground: "#ffffff" },
  laranja: { label: "Laranja", accent: "#f97316", hover: "#fb923c", foreground: "#1a0f00" },
  ciano: { label: "Ciano", accent: "#06b6d4", hover: "#22d3ee", foreground: "#00141a" },
  vermelho: { label: "Vermelho", accent: "#ef4444", hover: "#f87171", foreground: "#ffffff" },
  branco: { label: "Branco", accent: "#f4f4f6", hover: "#ffffff", foreground: "#171717" },
} as const;

export type BrandColorKey = keyof typeof BRAND_COLORS;

export const DEFAULT_BRAND_COLOR: BrandColorKey = "amarelo";

export function isBrandColorKey(key: string): key is BrandColorKey {
  return key in BRAND_COLORS;
}
