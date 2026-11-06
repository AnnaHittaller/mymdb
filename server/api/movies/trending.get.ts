type TmdbTrendingResult = {
	title: string
	id: number
	poster_path: string | null
	backdrop_path: string | null
	overview: string | null
	vote_average: number | null
	release_date: string | null
	genre_ids: number[] | null
}

type TmdbGenreList = {
	genres: { id: number, name: string }[]
}

export default defineCachedEventHandler(async () => {
	try {
		const config = useRuntimeConfig()
		const headers = {
			accept: 'application/json',
			Authorization: `Bearer ${config.apiBearerToken}`,
		}
		const [response, genreList] = await Promise.all([
			$fetch<{ results: TmdbTrendingResult[] }>(
				`${config.apiBaseUrl}/trending/movie/week?language=en-US`,
				{ method: 'GET', headers },
			),
			$fetch<TmdbGenreList>(`${config.apiBaseUrl}/genre/movie/list?language=en`, {
				method: 'GET',
				headers,
			}).catch(() => ({ genres: [] })),
		])
		const genreNames = new Map(genreList.genres.map((genre) => [genre.id, genre.name]))
		return response.results.map((item) => ({
			title: item.title,
			id: item.id,
			poster: item.poster_path,
			backdrop: item.backdrop_path,
			overview: item.overview ?? "",
			vote_average: item.vote_average ?? 0,
			release_date: item.release_date ?? "",
			genres: (item.genre_ids ?? []).flatMap((id) => {
				const name = genreNames.get(id)
				return name ? [name] : []
			}),
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
	getKey: () => 'week-genres',
})
