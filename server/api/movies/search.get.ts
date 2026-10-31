type TmdbSearchResult = {
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

		const response = await $fetch<{
			results: TmdbSearchResult[]
			total_pages: number
		}>(
			`${config.apiBaseUrl}/search/movie?query=${query.query}&include_adult=false&language=en-US&page=${page}`,
			{
				method: 'GET',
				headers: {
					accept: 'application/json',
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			},
		)

		return {
			results: response.results.map((item) => ({
				title: item.title,
				id: item.id,
				popularity: item.popularity,
				poster: item.poster_path,
				backdrop: item.backdrop_path,
				genres: item.genre_ids,
				rating: item.vote_average,
			})),
			total_pages: response.total_pages,
		}
	} catch {
		throw createError({
			statusCode: 404,
			message: 'Error while searching for movies.',
		})
	}
})
