import { CACHE_DURATION } from '~/constants/movie'

export type TmdbMovieDetails = {
	id: number
	title: string
	vote_average?: number | null
	poster_path?: string | null
}

export const fetchTmdbMovie = defineCachedFunction(
	async (id: string) => {
		const config = useRuntimeConfig()
		return await $fetch<TmdbMovieDetails>(
			`${config.apiBaseUrl}/movie/${id}?append_to_response=credits&language=en-US&page=1`,
			{
				method: 'GET',
				headers: {
					accept: 'application/json',
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			},
		)
	},
	{
		maxAge: CACHE_DURATION / 1000,
		name: 'tmdb-movie',
		getKey: (id: string) => id,
	},
)
