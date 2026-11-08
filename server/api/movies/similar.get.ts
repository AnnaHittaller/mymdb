import { CACHE_DURATION } from '~/constants/movie'

type TmdbSimilarResult = {
	id: number
	title: string
	poster_path: string | null
	vote_average: number
	genre_ids: number[]
}

type TmdbGenreList = {
	genres: { id: number, name: string }[]
}

export default defineCachedEventHandler(async (event) => {
	try {
		const config = useRuntimeConfig()
		const query = getQuery(event)
		const headers = {
			accept: 'application/json',
			Authorization: `Bearer ${config.apiBearerToken}`,
		}

		const [response, genreList] = await Promise.all([
			$fetch<{ results: TmdbSimilarResult[] }>(
				`https://api.themoviedb.org/3/movie/${query.id}/similar?language=en-US&page=1`,
				{ method: 'GET', headers },
			),
			$fetch<TmdbGenreList>(`${config.apiBaseUrl}/genre/movie/list?language=en`, {
				method: 'GET',
				headers,
			}).catch(() => ({ genres: [] })),
		])

		const genreNames = new Map(genreList.genres.map((genre) => [genre.id, genre.name]))

		return response.results
			.filter((item) => item.poster_path)
			.map((item) => ({
				id: item.id,
				mediaType: 'movie' as const,
				title: item.title,
				poster: item.poster_path,
				rating: item.vote_average,
				genres: item.genre_ids.flatMap((id) => {
					const name = genreNames.get(id)
					return name ? [name] : []
				}),
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
