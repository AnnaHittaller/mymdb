import {
	DISCOVER_SORT_DEFAULT,
	type DiscoverSortKey,
} from "../constants/discoverFilters";

const DISCOVER_SORT_KEYS = new Set<DiscoverSortKey>([
	DISCOVER_SORT_DEFAULT,
	"rating.desc",
	"rating.asc",
	"release.desc",
]);

export function normalizeDiscoverSort(value: unknown): DiscoverSortKey {
	const trimmed = String(value ?? "").trim();
	if (trimmed === "" || trimmed === DISCOVER_SORT_DEFAULT) {
		return DISCOVER_SORT_DEFAULT;
	}
	return DISCOVER_SORT_KEYS.has(trimmed as DiscoverSortKey)
		? (trimmed as DiscoverSortKey)
		: DISCOVER_SORT_DEFAULT;
}

/** Omit from URL when default (TMDB popularity). */
export function discoverSortQueryValue(key: DiscoverSortKey): string | undefined {
	return key === DISCOVER_SORT_DEFAULT ? undefined : key;
}

export function isDiscoverRatingSort(key: DiscoverSortKey): boolean {
	return key === "rating.desc" || key === "rating.asc";
}

export function tmdbDiscoverSortBy(sortKey: string, media: "movie" | "tv"): string {
	const key = normalizeDiscoverSort(sortKey);
	switch (key) {
		case "rating.desc":
			return "vote_average.desc";
		case "rating.asc":
			return "vote_average.asc";
		case "release.desc":
			return media === "tv" ? "first_air_date.desc" : "primary_release_date.desc";
		default:
			return "popularity.desc";
	}
}