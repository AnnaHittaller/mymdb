import { describe, expect, it } from "vitest";
import type { UserMovie } from "../../types/movie";
import {
	applyMediaTypeHints,
	hintsFromSummaries,
	reconcileWatchlistMovies,
} from "./reconcileWatchlist";

function saved(
	id: string,
	overrides: Partial<UserMovie> & Pick<UserMovie, "title">,
): UserMovie {
	return {
		id,
		title: overrides.title,
		rating: 0,
		poster: "",
		seen: false,
		next: false,
		timestamp: new Date(overrides.timestamp ?? 0),
		...overrides,
	};
}

describe("reconcileWatchlistMovies", () => {
	it("drops legacy movie rows when the same id is saved as tv", () => {
		const result = reconcileWatchlistMovies([
			saved("273866", { title: "The Other Bennet Sister" }),
			saved("273866", {
				title: "The Other Bennet Sister",
				mediaType: "tv",
				timestamp: new Date(1),
			}),
		]);

		expect(result).toHaveLength(1);
		expect(result[0]?.mediaType).toBe("tv");
	});

	it("keeps a movie and a show that share a numeric id but not a title", () => {
		const result = reconcileWatchlistMovies([
			saved("1396", { title: "Breaking Bad", mediaType: "tv" }),
			saved("1396", { title: "Captain America: Civil War", mediaType: "movie" }),
		]);

		expect(result.map((movie) => movie.mediaType).sort()).toEqual(["movie", "tv"]);
	});

	it("leaves an untyped row untyped so a later hint can classify it", () => {
		const result = reconcileWatchlistMovies([
			saved("273866", { title: "The Other Bennet Sister" }),
		]);

		expect(result).toHaveLength(1);
		expect(result[0]?.mediaType).toBeUndefined();
	});

	it("matches an untyped row to a catalog summary by title", () => {
		const hints = hintsFromSummaries(
			[saved("273866", { title: "The Other Bennet Sister" })],
			[
				{ id: "273866", title: "Some Movie", mediaType: "movie" },
				{ id: "273866", title: "the other bennet sister", mediaType: "tv" },
			],
		);

		expect(hints).toEqual([{ id: "273866", mediaType: "tv" }]);
	});

	it("applies title-based media type hints for untyped rows", () => {
		const reconciled = applyMediaTypeHints(
			[saved("273866", { title: "The Other Bennet Sister" })],
			[{ id: "273866", mediaType: "tv" }],
		);

		expect(reconciled[0]?.mediaType).toBe("tv");
	});
});
