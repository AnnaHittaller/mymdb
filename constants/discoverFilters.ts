export const ratingItems = [
	{ label: "Any rating", value: 0 },
	{ label: "8+", value: 8 },
	{ label: "7+", value: 7 },
	{ label: "6+", value: 6 },
	{ label: "5+", value: 5 },
	{ label: "4+", value: 4 },
	{ label: "3+", value: 3 },
	{ label: "2+", value: 2 },
] as const;

export const DISCOVER_SORT_DEFAULT = "popularity" as const;

/** TMDB top-rated discover uses the same floor (movies and TV). */
export const DISCOVER_RATING_SORT_MIN_VOTE_COUNT = 200;

export type DiscoverSortKey =
	| typeof DISCOVER_SORT_DEFAULT
	| "rating.desc"
	| "rating.asc"
	| "release.desc";

export const discoverSortItems: { label: string; value: DiscoverSortKey }[] = [
	{ label: "Popularity", value: DISCOVER_SORT_DEFAULT },
	{ label: "Highest rated", value: "rating.desc" },
	{ label: "Lowest rated", value: "rating.asc" },
	{ label: "Newest", value: "release.desc" },
];
