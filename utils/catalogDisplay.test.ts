import { describe, expect, it } from "vitest";
import type { TrendingItem } from "~/types/catalog";
import {
	trendingItemFirstGenre,
	trendingItemHasMeta,
	trendingItemYearLabel,
} from "./catalogDisplay";

function item(overrides: Partial<TrendingItem> = {}): TrendingItem {
	return {
		id: 1,
		title: "Test",
		mediaType: "movie",
		...overrides,
	} as TrendingItem;
}

describe("trendingItemYearLabel", () => {
	it("prefers releaseDate year", () => {
		expect(trendingItemYearLabel(item({ releaseDate: "2024-03-01", releaseYear: 1999 }))).toBe("2024");
	});

	it("falls back to releaseYear", () => {
		expect(trendingItemYearLabel(item({ releaseYear: 1999 }))).toBe("1999");
	});

	it("returns empty when neither set", () => {
		expect(trendingItemYearLabel(item())).toBe("");
	});
});

describe("trendingItemHasMeta", () => {
	it("is always true when showReleaseDate", () => {
		expect(trendingItemHasMeta(item(), "en", true)).toBe(true);
	});

	it("is false for empty item when not showing release date", () => {
		expect(trendingItemHasMeta(item({ rating: undefined, genres: [] }), "en", false)).toBe(false);
	});
});

describe("trendingItemFirstGenre", () => {
	it("returns first localized genre", () => {
		expect(trendingItemFirstGenre(item({ genres: ["Action", "Drama"] }), "en")).toBe("Action");
	});
});