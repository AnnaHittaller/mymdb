import { CACHE_DURATION } from '~/constants/movie'
import type { MediaType } from '~/types/catalog'

export type TmdbKeyword = {
	id: number
	name: string
}

export { formatKeywordIdsForDiscover } from '~/utils/tmdbDiscoverKeywords'

export const fetchTmdbTvKeywords = defineCachedFunction(
	async (id: string): Promise<TmdbKeyword[]> => {
		const config = useRuntimeConfig()
		const response = await $fetch<{ results: TmdbKeyword[] }>(
			`${config.apiBaseUrl}/tv/${id}/keywords`,
			{
				method: 'GET',
				headers: {
					accept: 'application/json',
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			},
		)
		return response.results ?? []
	},
	{
		maxAge: CACHE_DURATION / 1000,
		name: 'tmdb-tv-keywords',
		getKey: (id: string) => id,
	},
)

export const fetchTmdbMovieKeywords = defineCachedFunction(
	async (id: string): Promise<TmdbKeyword[]> => {
		const config = useRuntimeConfig()
		const response = await $fetch<{ keywords: TmdbKeyword[] }>(
			`${config.apiBaseUrl}/movie/${id}/keywords`,
			{
				method: 'GET',
				headers: {
					accept: 'application/json',
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			},
		)
		return response.keywords ?? []
	},
	{
		maxAge: CACHE_DURATION / 1000,
		name: 'tmdb-movie-keywords',
		getKey: (id: string) => id,
	},
)

export async function fetchTmdbKeywords(media: MediaType, id: string): Promise<TmdbKeyword[]> {
	return media === 'tv' ? fetchTmdbTvKeywords(id) : fetchTmdbMovieKeywords(id)
}
