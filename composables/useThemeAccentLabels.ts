import { THEME_ACCENT_COLORS } from "~/constants/themeAccentColors"

export function useThemeAccentLabels() {
	const { t } = useI18n()

	const colors = computed(() =>
		THEME_ACCENT_COLORS.map((color) => ({
			...color,
			label: t(`theme.${color.value}`),
		})),
	)

	function themeAccentLabel(value: string) {
		const key = `theme.${value}`
		return t(key) === key ? value : t(key)
	}

	return { colors, themeAccentLabel }
}