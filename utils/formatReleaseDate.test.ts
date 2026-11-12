import { describe, expect, it } from "vitest"
import { formatReleaseDate } from "./formatReleaseDate"

describe("formatReleaseDate", () => {
	it("formats a typical release date", () => {
		expect(formatReleaseDate("2026-03-12")).toBe("12 Mar 2026")
	})

	it("returns empty for missing input", () => {
		expect(formatReleaseDate("")).toBe("")
	})
})
