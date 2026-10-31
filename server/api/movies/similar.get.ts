import { CACHE_DURATION } from '~/constants/movie'

type TmdbSimilarResult = {
	id: number
	title: string
	poster_path: string | null
	vote_average: number
}

export default defineCachedEventHandler(async (event) => {
	try {
		const config = useRuntimeConfig()
		const query = getQuery(event)

		const response = await $fetch<{ results: TmdbSimilarResult[] }>(
			`https://api.themoviedb.org/3/movie/${query.id}/similar?language=en-US&page=1`,
			{
				method: 'GET',
				headers: {
					accept: 'application/json',
					Authorization: `Bearer ${config.apiBearerToken}`,
				},
			},
		)

		return response.results
			.filter((item) => item.poster_path)
			.map((item) => ({
				id: item.id,
				title: item.title,
				poster: item.poster_path,
				rating: item.vote_average,
			}))
	} catch {
		throw createError({
			statusCode: 404,
			message: "Similar movies can't be found",
		})
	}
}, {
	maxAge: CACHE_DURATION / 1000,
	name: 'similar',
	getKey: (event) => String(getQuery(event).id),
})
