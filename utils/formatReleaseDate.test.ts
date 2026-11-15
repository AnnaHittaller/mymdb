import { describe, expect, it } from "vitest"
import { formatReleaseDate } from "./formatReleaseDate"

describe("formatReleaseDate", () => {
	it("formats English", () => {
		expect(formatReleaseDate("2026-03-12", "en")).toBe("2026, Mar. 12")
	})

	it("formats Hungarian", () => {
		expect(formatReleaseDate("2026-11-13", "hu")).toBe("2026. 11. 13.")
	})

	it("returns empty for missing input", () => {
		expect(formatReleaseDate("")).toBe("")
	})
})