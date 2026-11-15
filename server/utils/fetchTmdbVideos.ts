import { CACHE_DURATION } from "~/constants/movie";
import type { TrailerRef, TmdbVideoResult } from "~/types/trailer";
import { pickBestTrailer } from "~/utils/tmdbVideo";
import type { MediaType } from "~/types/catalog";

type TmdbVideosResponse = {
	id: number;
	results: TmdbVideoResult[];
};

export const fetchTmdbVideos = defineCachedFunction(
	async (id: string, mediaType: MediaType, language = "en-US"): Promise<TrailerRef | null> => {
		const config = useRuntimeConfig();
		const segment = mediaType === "tv" ? "tv" : "movie";
		const response = await $fetch<TmdbVideosResponse>(
			`${config.apiBaseUrl}/${segment}/${id}/videos?language=${encodeURIComponent(language)}`,
			{
				method: "GET",
				headers: {
					accept: "application/json",
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			},
		);
		return pickBestTrailer(response.results ?? []);
	},
	{
		maxAge: CACHE_DURATION / 1000,
		name: "tmdb-videos",
		getKey: (id: string, mediaType: MediaType, language = "en-US") => `${mediaType}:${id}:${language}`,
	},
);
