export const APP_LOCALES = ["en", "de", "hu"] as const

export type AppLocale = (typeof APP_LOCALES)[number]

export const DEFAULT_APP_LOCALE: AppLocale = "en"

const TMDB_BY_LOCALE: Record<AppLocale, string> = {
	en: "en-US",
	de: "de-DE",
	hu: "hu-HU",
}

export const APP_LOCALE_OPTIONS: { label: string; value: AppLocale }[] = [
	{ label: "English", value: "en" },
	{ label: "Deutsch", value: "de" },
	{ label: "Magyar", value: "hu" },
]

/** Cookie used by @nuxtjs/i18n (must match nuxt.config `detectBrowserLanguage.cookieKey`). */
export const APP_LOCALE_COOKIE = "mymdb_locale"

export function isAppLocale(value: string): value is AppLocale {
	return (APP_LOCALES as readonly string[]).includes(value)
}

export function normalizeAppLocale(value: unknown): AppLocale {
	if (typeof value === "string" && isAppLocale(value)) {
		return value
	}
	return DEFAULT_APP_LOCALE
}

export function appLocaleToTmdbLanguage(locale: AppLocale | string): string {
	const normalized = normalizeAppLocale(locale)
	return TMDB_BY_LOCALE[normalized]
}

/** ISO 639-1 for gallery image ranking (en, de, hu). */
export function appLocaleToIso639(locale: AppLocale | string): string {
	return normalizeAppLocale(locale)
}

export function tmdbLanguageToIso639(tmdbLanguage: string): string {
	const base = tmdbLanguage.split("-")[0] ?? DEFAULT_APP_LOCALE
	return isAppLocale(base) ? base : DEFAULT_APP_LOCALE
}