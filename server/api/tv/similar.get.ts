import { CACHE_DURATION } from '~/constants/movie'
import type { MediaType } from '~/types/catalog'

type TmdbSimilarResult = {
	id: number
	name: string
	poster_path: string | null
	vote_average: number
	genre_ids: number[]
}

export default defineCachedEventHandler(async (event) => {
	try {
		const config = useRuntimeConfig()
		const query = getQuery(event)
		const headers = {
			accept: 'application/json',
			Authorization: `Bearer ${config.apiBearerToken}`,
		}

		const [response, genreNames] = await Promise.all([
			$fetch<{ results: TmdbSimilarResult[] }>(
				`${config.apiBaseUrl}/tv/${query.id}/similar?language=en-US&page=1`,
				{ method: 'GET', headers },
			),
			getTvGenreNameMap(),
		])

		return response.results
			.filter((item) => item.poster_path)
			.map((item) => ({
				id: item.id,
				mediaType: 'tv' as MediaType,
				title: item.name,
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
			message: "Similar shows can't be found",
		})
	}
}, {
	maxAge: CACHE_DURATION / 1000,
	name: 'similar-tv',
	getKey: (event) => String(getQuery(event).id),
})
