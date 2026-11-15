import { readFileSync } from "node:fs"
import path from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
	NOT_FOUND_ERROR_VARIANTS,
	pickRandomErrorScreenContent,
	SERVER_ERROR_VARIANTS,
} from "../constants/errorScreenContent"

const enLocale = JSON.parse(
	readFileSync(path.join(process.cwd(), "i18n/locales/en.json"), "utf8"),
) as {
	errors: { notFound: Record<string, { title: string }>; server: Record<string, { title: string }> }
}

const messages: Record<string, string> = {
	"errors.notFound.pointingAtCat.title": "That's not the page you think it is",
	"errors.notFound.pointingAtCat.description":
		"This URL isn't in the catalog. The internet argued; the cat won.",
	"errors.auth401.title": "You need a ticket for this",
	"errors.auth401.description": "Sign in to view this page.",
	"errors.auth403.title": "Access denied",
	"errors.auth403.description": "You don't have permission to view this page.",
	"errors.rateLimit.title": "Slow down, superstar",
	"errors.rateLimit.description": "Too many requests. Chill a moment, then retry.",
}

function t(key: string): string {
	return messages[key] ?? key
}

describe("pickRandomErrorScreenContent", () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it("returns fixed auth and rate-limit screens", () => {
		expect(pickRandomErrorScreenContent(401, t).title).toBe("You need a ticket for this")
		expect(pickRandomErrorScreenContent(403, t).title).toBe("Access denied")
		expect(pickRandomErrorScreenContent(429, t).title).toBe("Slow down, superstar")
	})

	it("picks from the 404 pool", () => {
		vi.spyOn(Math, "random").mockReturnValue(0)
		expect(pickRandomErrorScreenContent(404, t).icons.length).toBeGreaterThan(0)
	})

	it("includes cat duo as a 404 variant", () => {
		vi.spyOn(Math, "random").mockReturnValue(0)
		const first = pickRandomErrorScreenContent(404, t)
		expect(first.title).toBe("That's not the page you think it is")
		expect(first.icons).toHaveLength(2)
	})

	it("each variant id in constants has a fixed icon list", () => {
		expect(NOT_FOUND_ERROR_VARIANTS.map((v) => v.messageKey)).toEqual([
			"pointingAtCat",
			"deletedScene",
			"bufferingForever",
			"finalCut",
			"notSimplyWalk",
		])
		expect(SERVER_ERROR_VARIANTS).toHaveLength(7)
	})

	it("locale message keys match meme variant ids", () => {
		for (const { messageKey } of NOT_FOUND_ERROR_VARIANTS) {
			expect(enLocale.errors.notFound[messageKey]?.title).toBeTruthy()
		}
		for (const { messageKey } of SERVER_ERROR_VARIANTS) {
			expect(enLocale.errors.server[messageKey]?.title).toBeTruthy()
		}
	})
})