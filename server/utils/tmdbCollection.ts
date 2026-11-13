import { CACHE_DURATION } from "~/constants/movie";

export type TmdbCollectionPart = {
	id: number;
	title: string;
	poster_path: string | null;
	release_date: string;
	vote_average?: number | null;
};

export type TmdbCollectionResponse = {
	id: number;
	name: string;
	parts?: TmdbCollectionPart[];
};

export const fetchTmdbCollection = defineCachedFunction(
	async (id: string) => {
		const config = useRuntimeConfig();
		return await $fetch<TmdbCollectionResponse>(
			`${config.apiBaseUrl}/collection/${id}?language=en-US`,
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
		name: "tmdb-collection",
		getKey: (id: string) => id,
	},
);
