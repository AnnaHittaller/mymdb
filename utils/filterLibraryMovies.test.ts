import { describe, expect, it } from "vitest";
import type { UserMovie } from "../types/movie";
import {
	defaultLibraryListFilterState,
	filterLibraryMovies,
	libraryListFiltersActive,
	mergeGenreNames,
} from "./filterLibraryMovies";

const listId = "custom-1";

function movie(overrides: Partial<UserMovie> & Pick<UserMovie, "id" | "title">): UserMovie {
	return {
		id: overrides.id,
		title: overrides.title,
		rating: overrides.rating ?? 7,
		poster: "/p.jpg",
		seen: false,
		memberships: overrides.memberships ?? [{
			listId,
			joinedAt: new Date("2024-01-01"),
		}],
		...(overrides.mediaType ? { mediaType: overrides.mediaType } : {}),
		...(overrides.genres ? { genres: overrides.genres } : {}),
	};
}

describe("filterLibraryMovies", () => {
	/** Order matches `moviesInList` (newest added first). */
	const base = [
		movie({
			id: "3",
			title: "Gamma",
			rating: 8,
			mediaType: "movie",
			memberships: [{ listId, joinedAt: new Date("2024-06-01") }],
			genres: ["Drama"],
		}),
		movie({ id: "1", title: "Alpha Movie", rating: 9, mediaType: "movie", genres: ["Drama", "Crime"] }),
		movie({ id: "2", title: "Beta Show", rating: 5, mediaType: "tv", genres: ["Comedy"] }),
	];

	it("returns all by default preserving list order", () => {
		const state = defaultLibraryListFilterState();
		const result = filterLibraryMovies(base, state);
		expect(result.map((m) => m.id)).toEqual(["3", "1", "2"]);
	});

	it("filters by title substring", () => {
		const state = { ...defaultLibraryListFilterState(), titleQuery: "beta" };
		expect(filterLibraryMovies(base, state)).toHaveLength(1);
	});

	it("filters by media without affecting other state keys", () => {
		const state = { ...defaultLibraryListFilterState(), media: "tv" as const, titleQuery: "beta" };
		expect(filterLibraryMovies(base, state)).toHaveLength(1);
		expect(filterLibraryMovies(base, state)[0]?.id).toBe("2");
	});

	it("matches any selected genre", () => {
		const state = { ...defaultLibraryListFilterState(), genreNames: ["Drama", "Comedy"] };
		expect(filterLibraryMovies(base, state).map((m) => m.id).sort()).toEqual(["1", "2", "3"]);
	});

	it("excludes rows without genres when genres selected", () => {
		const rows = [...base, movie({ id: "4", title: "No Genre", genres: undefined })];
		const state = { ...defaultLibraryListFilterState(), genreNames: ["Drama"] };
		expect(filterLibraryMovies(rows, state).every((m) => m.genres?.includes("Drama"))).toBe(true);
	});

	it("sorts by best rating when toggled", () => {
		const state = { ...defaultLibraryListFilterState(), sortByBestRating: true };
		expect(filterLibraryMovies(base, state).map((m) => m.id)).toEqual(["1", "3", "2"]);
	});

	it("keeps list order when sort toggle is off", () => {
		const state = defaultLibraryListFilterState();
		expect(filterLibraryMovies(base, state).map((m) => m.id)).toEqual(["3", "1", "2"]);
	});
});

describe("libraryListFiltersActive", () => {
	it("is false for defaults", () => {
		expect(libraryListFiltersActive(defaultLibraryListFilterState())).toBe(false);
	});

	it("is true when media narrowed", () => {
		expect(libraryListFiltersActive({ ...defaultLibraryListFilterState(), media: "movie" })).toBe(true);
	});
});

describe("mergeGenreNames", () => {
	it("dedupes and sorts", () => {
		expect(
			mergeGenreNames(
				[{ name: "Drama" }, { name: "Comedy" }],
				[{ name: "Drama" }, { name: "Animation" }],
			),
		).toEqual(["Animation", "Comedy", "Drama"]);
	});
});