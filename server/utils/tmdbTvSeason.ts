import { CACHE_DURATION } from "~/constants/movie";
import type { DetailEpisode, DetailSeasonResponse } from "~/types/detailEpisode";

type TmdbSeasonEpisode = {
	air_date?: string;
	episode_number: number;
	name: string;
	overview?: string;
	runtime?: number | null;
	still_path?: string | null;
	vote_average?: number;
};

type TmdbSeasonResponse = {
	season_number: number;
	backdrop_path?: string | null;
	episodes?: TmdbSeasonEpisode[];
};

export const fetchTmdbTvSeason = defineCachedFunction(
	async (showId: string, seasonNumber: string) => {
		const config = useRuntimeConfig();
		return await $fetch<TmdbSeasonResponse>(
			`${config.apiBaseUrl}/tv/${showId}/season/${seasonNumber}?language=en-US`,
			{
				method: "GET",
				headers: {
					accept: "application/json",
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			},
		);
	},
	{
		maxAge: CACHE_DURATION / 1000,
		name: "tmdb-tv-season",
		getKey: (showId: string, seasonNumber: string) => `${showId}-${seasonNumber}`,
	},
);

export function normalizeDetailSeason(
	raw: TmdbSeasonResponse,
): DetailSeasonResponse {
	const episodes: DetailEpisode[] = (raw.episodes ?? [])
		.slice()
		.sort((a, b) => a.episode_number - b.episode_number)
		.map((episode) => ({
			episode_number: episode.episode_number,
			name: episode.name?.trim() || `Episode ${episode.episode_number}`,
			overview: episode.overview?.trim() ?? "",
			runtime: episode.runtime ?? null,
			air_date: episode.air_date ?? "",
			still_path:
				typeof episode.still_path === "string" ? episode.still_path : null,
			vote_average: episode.vote_average ?? 0,
		}));

	const backdrop =
		typeof raw.backdrop_path === "string" ? raw.backdrop_path : null;

	return {
		season_number: raw.season_number,
		season_backdrop_path: backdrop,
		episodes,
	};
}
