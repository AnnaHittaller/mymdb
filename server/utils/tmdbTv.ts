import { CACHE_DURATION } from '~/constants/movie'

export type TmdbTvDetails = {
	id: number
	name: string
	vote_average?: number | null
	poster_path?: string | null
	genres?: { id: number, name: string }[]
}

export const fetchTmdbTv = defineCachedFunction(
	async (id: string) => {
		const config = useRuntimeConfig()
		return await $fetch<TmdbTvDetails>(
			`${config.apiBaseUrl}/tv/${id}?append_to_response=credits,aggregate_credits,videos&language=en-US&page=1`,
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
		name: 'tmdb-tv-aggregate-credits',
		getKey: (id: string) => id,
	},
)
