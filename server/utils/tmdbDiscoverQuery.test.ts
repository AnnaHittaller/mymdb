import { describe, expect, it } from "vitest"
import { buildTmdbDiscoverMovieParams, parseIsoReleaseDate } from "./tmdbDiscoverQuery"
import { buildTmdbDiscoverTvParams } from "./tmdbDiscoverTvQuery"

describe("parseIsoReleaseDate", () => {
	it("accepts YYYY-MM-DD", () => {
		expect(parseIsoReleaseDate("2026-03-15")).toBe("2026-03-15")
	})

	it("rejects partial or invalid values", () => {
		expect(parseIsoReleaseDate("2026")).toBe("")
		expect(parseIsoReleaseDate("")).toBe("")
	})
})

describe("buildTmdbDiscoverMovieParams", () => {
	it("uses primary release date window and popularity sort when both dates set", () => {
		const params = buildTmdbDiscoverMovieParams({
			page: 1,
			releaseDateGte: "2026-03-01",
			releaseDateLte: "2026-03-31",
		})
		expect(params.get("sort_by")).toBe("popularity.desc")
		expect(params.get("primary_release_date.gte")).toBe("2026-03-01")
		expect(params.get("primary_release_date.lte")).toBe("2026-03-31")
		expect(params.get("primary_release_date.gte")).not.toBe("2025-01-01")
	})

	it("uses country release dates when region is set", () => {
		const params = buildTmdbDiscoverMovieParams({
			page: 1,
			region: "DE",
			releaseDateGte: "2026-03-01",
			releaseDateLte: "2026-03-31",
		})
		expect(params.get("sort_by")).toBe("popularity.desc")
		expect(params.get("region")).toBe("DE")
		expect(params.get("release_date.gte")).toBe("2026-03-01")
		expect(params.get("release_date.lte")).toBe("2026-03-31")
		expect(params.get("primary_release_date.gte")).toBeNull()
	})

	it("keeps year filters when no exact date window", () => {
		const params = buildTmdbDiscoverMovieParams({
			page: 1,
			releaseYearGte: 2020,
			releaseYearLte: 2024,
		})
		expect(params.get("sort_by")).toBe("popularity.desc")
		expect(params.get("primary_release_date.gte")).toBe("2020-01-01")
		expect(params.get("primary_release_date.lte")).toBe("2024-12-31")
	})
})

describe("buildTmdbDiscoverMovieParams — streaming", () => {
	it("sets watch providers when region is present", () => {
		const params = buildTmdbDiscoverMovieParams({
			page: 1,
			watchRegion: "US",
			watchProviders: "8|337",
		})
		expect(params.get("with_watch_providers")).toBe("8|337")
		expect(params.get("watch_region")).toBe("US")
	})
})

describe("discover sort", () => {
	it("maps rating and release sorts for movies", () => {
		const highestRated = buildTmdbDiscoverMovieParams({ page: 1, sort: "rating.desc" })
		expect(highestRated.get("sort_by")).toBe("vote_average.desc")
		expect(highestRated.get("vote_count.gte")).toBe("200")
		const lowestRated = buildTmdbDiscoverMovieParams({ page: 1, sort: "rating.asc" })
		expect(lowestRated.get("vote_count.gte")).toBe("200")
		expect(
			buildTmdbDiscoverMovieParams({ page: 1, sort: "release.desc" }).get("sort_by"),
		).toBe("primary_release_date.desc")
		expect(buildTmdbDiscoverMovieParams({ page: 1 }).get("vote_count.gte")).toBeNull()
	})

	it("maps release sort to first air date for TV", () => {
		expect(
			buildTmdbDiscoverTvParams({ page: 1, sort: "release.desc" }).get("sort_by"),
		).toBe("first_air_date.desc")
	})

	it("ignores unknown sort keys", () => {
		expect(buildTmdbDiscoverMovieParams({ page: 1, sort: "nope" }).get("sort_by")).toBe("popularity.desc")
	})
})

describe("buildTmdbDiscoverTvParams", () => {
	it("uses first air date window when both dates set", () => {
		const params = buildTmdbDiscoverTvParams({
			page: 1,
			releaseDateGte: "2026-04-01",
			releaseDateLte: "2026-04-30",
			genres: "18",
		})
		expect(params.get("sort_by")).toBe("popularity.desc")
		expect(params.get("first_air_date.gte")).toBe("2026-04-01")
		expect(params.get("first_air_date.lte")).toBe("2026-04-30")
		expect(params.get("with_genres")).toBe("18")
	})
})
