export const THEME_ACCENT_COLORS = [
	{ value: "emerald", label: "Emerald", swatchClass: "bg-emerald-500 hover:bg-emerald-500/75" },
	{ value: "mandy", label: "Mandy", swatchClass: "bg-mandy-500 hover:bg-mandy-500/75" },
	{ value: "dusk", label: "Dusk", swatchClass: "bg-dusk-500 hover:bg-dusk-500/75" },
	{ value: "pumpkin", label: "Pumpkin", swatchClass: "bg-pumpkin-500 hover:bg-pumpkin-500/75" },
	{ value: "mauve", label: "Mauve", swatchClass: "bg-mauve-500 hover:bg-mauve-500/75" },
	{ value: "periwinkle", label: "Periwinkle", swatchClass: "bg-periwinkle-500 hover:bg-periwinkle-500/75" },
	{ value: "saffron", label: "Saffron", swatchClass: "bg-saffron-500 hover:bg-saffron-500/75" },
] as const;

export function themeAccentLabel(theme: string) {
	return THEME_ACCENT_COLORS.find((entry) => entry.value === theme)?.label ?? theme;
}
