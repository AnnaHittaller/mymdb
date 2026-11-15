import { describe, expect, it } from "vitest"
import {
	genreMatchKeys,
	personalizeUpcomingOrder,
} from "./catalogUpcomingPersonalize"
import type { TrendingItem } from "~/types/catalog"

function item(
	id: number,
	mediaType: "movie" | "tv",
	genres: string[],
	popularity: number,
): TrendingItem {
	return {
		id,
		mediaType,
		title: `Title ${id}`,
		popularity,
		poster: "/p.jpg",
		backdrop: null,
		genres,
		rating: 7,
		releaseYear: 2026,
		overview: "",
		releaseDate: "2026-03-01",
	}
}

describe("catalogUpcomingPersonalize", () => {
	it("reorders without dropping baseline titles", () => {
		const baseline = [
			item(1, "movie", ["Drama"], 10),
			item(2, "movie", ["Comedy"], 20),
			item(3, "tv", ["Drama"], 15),
		]
		const prefer = new Set(["movie:2", "tv:3"])
		const ordered = personalizeUpcomingOrder(baseline, prefer, (a, b) => b.popularity! - a.popularity!)
		expect(ordered.map((row) => row.id)).toEqual([2, 3, 1])
	})

	it("matches genres by name on the baseline list", () => {
		const baseline = [item(1, "movie", ["Action"], 5), item(2, "movie", ["Romance"], 5)]
		const keys = genreMatchKeys(
			baseline,
			[28],
			[],
			new Map([[28, "Action"]]),
			new Map(),
		)
		expect([...keys]).toEqual(["movie:1"])
	})
})
