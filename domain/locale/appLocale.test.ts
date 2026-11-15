import { describe, expect, it } from "vitest"
import {
	APP_LOCALE_COOKIE,
	appLocaleToIso639,
	appLocaleToTmdbLanguage,
	DEFAULT_APP_LOCALE,
	normalizeAppLocale,
	tmdbLanguageToIso639,
} from "./appLocale"

describe("appLocale", () => {
	it("normalizes known locales", () => {
		expect(normalizeAppLocale("de")).toBe("de")
		expect(normalizeAppLocale("hu")).toBe("hu")
		expect(normalizeAppLocale("fr")).toBe(DEFAULT_APP_LOCALE)
	})

	it("maps TMDB language codes", () => {
		expect(appLocaleToTmdbLanguage("en")).toBe("en-US")
		expect(appLocaleToTmdbLanguage("de")).toBe("de-DE")
		expect(appLocaleToTmdbLanguage("hu")).toBe("hu-HU")
	})

	it("maps ISO 639 for images", () => {
		expect(appLocaleToIso639("hu")).toBe("hu")
	})

	it("exposes stable cookie name", () => {
		expect(APP_LOCALE_COOKIE).toBe("mymdb_locale")
	})

	it("maps TMDB language to ISO 639", () => {
		expect(tmdbLanguageToIso639("de-DE")).toBe("de")
		expect(tmdbLanguageToIso639("hu-HU")).toBe("hu")
		expect(appLocaleToIso639("en")).toBe("en")
	})
})