import type { TvSeasonSummary } from "~/types/tv";

type TvWithSeasons = {
	seasons?: TvSeasonSummary[];
	number_of_seasons?: number;
};

/** Prefer TMDB `seasons[]`; otherwise synthesize from `number_of_seasons`. */
export function buildTvSeasonSummaries(source: TvWithSeasons | null | undefined): TvSeasonSummary[] {
	if (!source) return [];
	const fromApi = (source.seasons ?? []).filter((season) => season.season_number > 0);
	if (fromApi.length > 0) return fromApi;

	const count = source.number_of_seasons ?? 0;
	if (count <= 0) return [];

	return Array.from({ length: count }, (_, index) => {
		const seasonNumber = index + 1;
		return {
			air_date: "",
			episode_count: 0,
			id: seasonNumber,
			name: `Season ${seasonNumber}`,
			overview: "",
			poster_path: null,
			season_number: seasonNumber,
			vote_average: 0,
		};
	});
}
