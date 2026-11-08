import type { TmdbMediaRow } from "~/server/utils/tmdbNormalize";
import { parseMediaType, toCatalogCard } from "~/server/utils/tmdbNormalize";

export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event)
		const config = useRuntimeConfig()
		const page = query.page || 1
		const searchQuery = String(query.query ?? "")
		const headers = {
			accept: 'application/json',
			Authorization: `Bearer ${config.apiBearerToken}`,
		}

		const [response, movieGenres, tvGenres] = await Promise.all([
			$fetch<{
				results: TmdbMediaRow[]
				total_pages: number
			}>(
				`${config.apiBaseUrl}/search/multi?query=${encodeURIComponent(searchQuery)}&include_adult=false&language=en-US&page=${page}`,
				{ method: 'GET', headers },
			),
			getMovieGenreNameMap(),
			getTvGenreNameMap(),
		])

		const results = response.results.flatMap((item) => {
			const mediaType = parseMediaType(item.media_type)
			if (!mediaType) return []
			const genreNames = mediaType === "tv" ? tvGenres : movieGenres
			return [toCatalogCard(item, mediaType, genreNames)]
		})

		return {
			results,
			total_pages: response.total_pages,
		}
	} catch {
		throw createError({
			statusCode: 404,
			message: 'Error while searching titles.',
		})
	}
})
