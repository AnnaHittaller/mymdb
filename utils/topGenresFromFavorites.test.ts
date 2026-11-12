import { describe, expect, it } from "vitest"
import type { UserMovie } from "~/types/movie"
import { favoritesWithGenresCount, topGenreNamesForMedia } from "./topGenresFromFavorites"

function favorite(overrides: Partial<UserMovie> & Pick<UserMovie, "title">): UserMovie {
	return {
		id: "1",
		rating: 8,
		poster: "/x.jpg",
		seen: false,
		memberships: [],
		...overrides,
	}
}

describe("topGenreNamesForMedia", () => {
	it("weights earlier favorites more heavily", () => {
		const movies: UserMovie[] = [
			favorite({ id: "1", title: "A", genres: ["Drama"], mediaType: "movie" }),
			favorite({ id: "2", title: "B", genres: ["Comedy", "Drama"], mediaType: "movie" }),
		]
		expect(topGenreNamesForMedia(movies, "movie", 2)).toEqual(["Drama", "Comedy"])
	})

	it("counts favorites with genres", () => {
		const movies = [
			favorite({ title: "A", genres: ["Drama"] }),
			favorite({ title: "B", genres: [] }),
		]
		expect(favoritesWithGenresCount(movies)).toBe(1)
	})
})
