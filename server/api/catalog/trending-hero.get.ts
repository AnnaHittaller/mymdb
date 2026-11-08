import type { TmdbMediaRow } from "~/server/utils/tmdbNormalize";
import { normalizeTrendingAllResult } from "~/server/utils/tmdbNormalize";

export default defineCachedEventHandler(async () => {
	try {
		const config = useRuntimeConfig()
		const headers = {
			accept: 'application/json',
			Authorization: `Bearer ${config.apiBearerToken}`,
		}
		const [response, movieGenres, tvGenres] = await Promise.all([
			$fetch<{ results: TmdbMediaRow[] }>(
				`${config.apiBaseUrl}/trending/all/week?language=en-US`,
				{ method: 'GET', headers },
			),
			getMovieGenreNameMap(),
			getTvGenreNameMap(),
		])
		const genreNamesByType = { movie: movieGenres, tv: tvGenres }
		return response.results.flatMap((item) => {
			const normalized = normalizeTrendingAllResult(item, genreNamesByType)
			return normalized ? [normalized] : []
		})
	} catch {
		throw createError({
			statusCode: 404,
			message: "Couldn't fetch trending titles.",
		})
	}
}, {
	maxAge: 60 * 60,
	name: 'trending-hero',
	getKey: () => 'week-all',
})
