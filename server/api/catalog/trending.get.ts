import type { MediaType } from "~/types/catalog";
import type { TmdbMediaRow } from "~/server/utils/tmdbNormalize";
import { toTrendingItem } from "~/server/utils/tmdbNormalize";

function trendingMediaType(query: Record<string, unknown>): MediaType | null {
	const type = String(query.type ?? "")
	if (type === "movie" || type === "tv") return type
	return null
}

export default defineCachedEventHandler(async (event) => {
	const mediaType = trendingMediaType(getQuery(event))
	if (!mediaType) {
		throw createError({
			statusCode: 400,
			message: 'Query "type" must be movie or tv',
		})
	}
	try {
		const query = getQuery(event)
		const page = Number(query.page) || 1
		const config = useRuntimeConfig()
		const headers = {
			accept: 'application/json',
			Authorization: `Bearer ${config.apiBearerToken}`,
		}
		const genreMapPromise = mediaType === "tv" ? getTvGenreNameMap() : getMovieGenreNameMap()
		const [response, genreNames] = await Promise.all([
			$fetch<{ results: TmdbMediaRow[] }>(
				`${config.apiBaseUrl}/trending/${mediaType}/week?language=en-US&page=${page}`,
				{ method: 'GET', headers },
			),
			genreMapPromise,
		])
		return response.results.map((item) => toTrendingItem(item, mediaType, genreNames))
	} catch {
		throw createError({
			statusCode: 404,
			message: `Couldn't fetch trending ${mediaType === "tv" ? "shows" : "movies"}.`,
		})
	}
}, {
	maxAge: 60 * 60,
	name: 'catalog-trending',
	getKey: (event) => {
		const query = getQuery(event)
		const type = String(query.type ?? "")
		const page = String(query.page ?? 1)
		return `${type}:${page}`
	},
})
