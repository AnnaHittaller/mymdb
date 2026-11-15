import { describe, expect, it } from "vitest"
import { localeFromCookieHeader, pickAppLocaleFromRequest, resolveTmdbLanguage } from "./tmdbLanguage"

describe("tmdbLanguage", () => {
	it("parses locale cookie", () => {
		expect(localeFromCookieHeader("mymdb_locale=de; other=1")).toBe("de")
		expect(localeFromCookieHeader(undefined)).toBeNull()
	})

	it("resolves language from override", () => {
		expect(resolveTmdbLanguage(undefined, "hu")).toBe("hu-HU")
		expect(resolveTmdbLanguage()).toBe("en-US")
	})

	it("prefers header over cookie", () => {
		expect(
			pickAppLocaleFromRequest({
				header: "hu",
				cookieHeader: "mymdb_locale=en",
			}),
		).toBe("hu")
	})
})