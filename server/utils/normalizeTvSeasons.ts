import type { TvSeasonSummary } from "~/types/tv";

type TmdbTvSeasonsSource = {
	seasons?: TvSeasonSummary[];
	number_of_seasons?: number;
};

export function normalizeTvSeasons(source: TmdbTvSeasonsSource): TvSeasonSummary[] {
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
