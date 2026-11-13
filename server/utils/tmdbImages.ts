import { CACHE_DURATION } from "~/constants/movie";
import type { TmdbGalleryImage } from "~/utils/normalizeDetailGallery";

export type TmdbImagesResponse = {
	posters: TmdbGalleryImage[];
	backdrops: TmdbGalleryImage[];
};

export const fetchTmdbImages = defineCachedFunction(
	async (media: "movie" | "tv", id: string): Promise<TmdbImagesResponse> => {
		const config = useRuntimeConfig();
		const params = new URLSearchParams({ include_image_language: "en,null" });
		const response = await $fetch<TmdbImagesResponse>(
			`${config.apiBaseUrl}/${media}/${id}/images?${params.toString()}`,
			{
				method: "GET",
				headers: {
					accept: "application/json",
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			},
		);
		return {
			posters: response.posters ?? [],
			backdrops: response.backdrops ?? [],
		};
	},
	{
		maxAge: CACHE_DURATION / 1000,
		name: "tmdb-images",
		getKey: (media: string, id: string) => `${media}:${id}`,
	},
);
