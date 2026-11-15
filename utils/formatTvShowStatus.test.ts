import { describe, expect, it } from "vitest"
import { formatTvShowStatus } from "./formatTvShowStatus"

describe("formatTvShowStatus", () => {
	const t = (key: string) => (key === "detail.tvStatus.ended" ? "Befejeződött" : key)

	it("maps known English TMDB values", () => {
		expect(formatTvShowStatus("Ended", t)).toBe("Befejeződött")
	})

	it("passes through unknown values", () => {
		expect(formatTvShowStatus("On hiatus", t)).toBe("On hiatus")
	})
})