type TmdbDiscoverResult = {
	title: string
	id: number
	popularity: number
	poster_path: string | null
	backdrop_path: string | null
	genre_ids: number[]
	vote_average: number
}

export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event)
		const config = useRuntimeConfig()
		const page = query.page || 1
		const rating = query.rating || 0
		const genres = query.genres || ''

		const response = await $fetch<{ results: TmdbDiscoverResult[] }>(
			`${config.apiBaseUrl}/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc&vote_average.gte=${rating}&with_genres=${genres}`,
			{
				method: 'GET',
				headers: {
					accept: 'application/json',
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			},
		)

		return response.results.map((item) => ({
			title: item.title,
			id: item.id,
			popularity: item.popularity,
			poster: item.poster_path,
			backdrop: item.backdrop_path,
			genres: item.genre_ids,
			rating: item.vote_average,
		}))
	} catch {
		throw createError({
			statusCode: 404,
			message: 'Error while discovering movies.',
		})
	}
})
