type TmdbDiscoverResult = {
	title: string
	id: number
	popularity: number
	poster_path: string | null
	backdrop_path: string | null
	genre_ids: number[]
	vote_average: number
}

type TmdbGenreList = {
	genres: { id: number, name: string }[]
}

export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event)
		const config = useRuntimeConfig()
		const params = buildTmdbDiscoverMovieParams({
			page: String(query.page ?? 1),
			rating: String(query.rating ?? 0),
			genres: String(query.genres ?? ""),
			withCast: String(query.with_cast ?? ""),
			releaseYearGte: String(query.release_year_gte ?? 0),
			releaseYearLte: String(query.release_year_lte ?? 0),
		})
		const headers = {
			accept: "application/json",
			Authorization: `Bearer ${config.apiBearerToken}`,
		}

		const [response, genreList] = await Promise.all([
			$fetch<{ results: TmdbDiscoverResult[] }>(
				`${config.apiBaseUrl}/discover/movie?${params.toString()}`,
				{ method: "GET", headers },
			),
			$fetch<TmdbGenreList>(`${config.apiBaseUrl}/genre/movie/list?language=en`, {
				method: "GET",
				headers,
			}).catch(() => ({ genres: [] })),
		])

		const genreNames = new Map(genreList.genres.map((genre) => [genre.id, genre.name]))

		return response.results.map((item) => ({
			title: item.title,
			id: item.id,
			popularity: item.popularity,
			poster: item.poster_path,
			backdrop: item.backdrop_path,
			genres: item.genre_ids.flatMap((id) => {
				const name = genreNames.get(id)
				return name ? [name] : []
			}),
			rating: item.vote_average,
		}))
	} catch {
		throw createError({
			statusCode: 404,
			message: "Error while discovering movies.",
		})
	}
})
