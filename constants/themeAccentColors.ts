export const THEME_ACCENT_COLORS = [
	{ value: "emerald", label: "Emerald", swatchClass: "bg-emerald-500 hover:bg-emerald-500/75" },
	{ value: "mandy", label: "Mandy", swatchClass: "bg-mandy-500 hover:bg-mandy-500/75" },
	{ value: "dusk", label: "Dusk", swatchClass: "bg-dusk-500 hover:bg-dusk-500/75" },
	{ value: "pumpkin", label: "Pumpkin", swatchClass: "bg-pumpkin-500 hover:bg-pumpkin-500/75" },
	{ value: "mauve", label: "Mauve", swatchClass: "bg-mauve-500 hover:bg-mauve-500/75" },
	{ value: "periwinkle", label: "Periwinkle", swatchClass: "bg-periwinkle-500 hover:bg-periwinkle-500/75" },
	{ value: "saffron", label: "Saffron", swatchClass: "bg-saffron-500 hover:bg-saffron-500/75" },
	{ value: "snow", label: "Snow", swatchClass: "bg-snow-500 hover:bg-snow-500/75" },
	{ value: "cobalt", label: "Cobalt", swatchClass: "bg-cobalt-500 hover:bg-cobalt-500/75" },
	{ value: "fairy", label: "Fairy", swatchClass: "bg-fairy-500 hover:bg-fairy-500/75" },
	{ value: "ocean", label: "Ocean", swatchClass: "bg-ocean-500 hover:bg-ocean-500/75" },
	{ value: "poppy", label: "Poppy", swatchClass: "bg-poppy-500 hover:bg-poppy-500/75" },
] as const;

export function resolveThemeAccent(theme: string, fallback = "emerald") {
	return THEME_ACCENT_COLORS.some((entry) => entry.value === theme) ? theme : fallback;
}

export function themeAccentLabel(theme: string) {
	return THEME_ACCENT_COLORS.find((entry) => entry.value === theme)?.label ?? theme;
}
