import { describe, expect, it } from "vitest";
import { DISCOVER_SORT_DEFAULT } from "../constants/discoverFilters";
import { discoverSortQueryValue, isDiscoverRatingSort, normalizeDiscoverSort } from "./discoverSort";

describe("normalizeDiscoverSort", () => {
	it("maps empty URL to popularity default", () => {
		expect(normalizeDiscoverSort("")).toBe(DISCOVER_SORT_DEFAULT);
		expect(normalizeDiscoverSort(undefined)).toBe(DISCOVER_SORT_DEFAULT);
	});

	it("keeps explicit keys", () => {
		expect(normalizeDiscoverSort("rating.desc")).toBe("rating.desc");
	});
});

describe("isDiscoverRatingSort", () => {
	it("is true only for rating sorts", () => {
		expect(isDiscoverRatingSort("rating.desc")).toBe(true);
		expect(isDiscoverRatingSort("rating.asc")).toBe(true);
		expect(isDiscoverRatingSort(DISCOVER_SORT_DEFAULT)).toBe(false);
		expect(isDiscoverRatingSort("release.desc")).toBe(false);
	});
});

describe("discoverSortQueryValue", () => {
	it("omits popularity from query", () => {
		expect(discoverSortQueryValue(DISCOVER_SORT_DEFAULT)).toBeUndefined();
		expect(discoverSortQueryValue("rating.desc")).toBe("rating.desc");
	});
});