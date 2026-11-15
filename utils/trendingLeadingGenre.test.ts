import { describe, expect, it } from "vitest";
import type { TrendingItem } from "~/types/catalog";
import { trendingLeadingGenre } from "./trendingLeadingGenre";

function item(overrides: Partial<TrendingItem> & Pick<TrendingItem, "id">): TrendingItem {
	return {
		id: overrides.id,
		mediaType: "movie",
		title: `Title ${overrides.id}`,
		poster: null,
		backdrop: null,
		genres: [],
		rating: 8,
		releaseYear: 2024,
		overview: "",
		releaseDate: "2024-01-01",
		...overrides,
	};
}

describe("trendingLeadingGenre", () => {
	it("returns null when no genres", () => {
		expect(trendingLeadingGenre([item({ id: 1 })])).toBeNull();
	});

	it("picks genre with highest rank-weighted score", () => {
		const items = [
			item({ id: 1, genres: ["Action"] }),
			item({ id: 2, genres: ["Action"] }),
			item({ id: 3, genres: ["Comedy"] }),
		];
		expect(trendingLeadingGenre(items)).toBe("Action");
	});

	it("breaks score ties by best chart rank", () => {
		const items = [
			item({ id: 1, genres: ["Action"] }),
			item({ id: 2, genres: ["Drama"] }),
		];
		expect(trendingLeadingGenre(items)).toBe("Action");
	});
});
