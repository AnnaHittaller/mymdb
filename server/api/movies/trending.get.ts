type TmdbTrendingResult = {
	title: string
	id: number
	poster_path: string | null
	backdrop_path: string | null
}

export default defineCachedEventHandler(async () => {
	try {
		const config = useRuntimeConfig()
		const response = await $fetch<{ results: TmdbTrendingResult[] }>(
			`${config.apiBaseUrl}/trending/movie/week?language=en-US`,
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
			poster: item.poster_path,
			backdrop: item.backdrop_path,
		}))
	} catch {
		throw createError({
			statusCode: 404,
			message: "Couldn't fetch trending movies.",
		})
	}
}, {
	maxAge: 60 * 60,
	name: 'trending-movies',
	getKey: () => 'week',
})
