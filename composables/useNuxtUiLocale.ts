import { de, en, hu } from "@nuxt/ui/locale"
import type { AppLocale } from "~/domain/locale/appLocale"
import { normalizeAppLocale } from "~/domain/locale/appLocale"

const UI_LOCALE: Record<AppLocale, typeof en> = {
	en,
	de,
	hu: en,
}

export function useNuxtUiLocale() {
	const { locale } = useI18n()
	return computed(() => UI_LOCALE[normalizeAppLocale(locale.value)])
}