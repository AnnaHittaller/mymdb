import type { CatalogCard } from "~/types/catalog"
import { parseMediaType, toCatalogCard, type TmdbMediaRow } from "~/server/utils/tmdbNormalize"

function pageParam(page: unknown): string | number {
	if (Array.isArray(page)) return pageParam(page[0])
	if (typeof page === "string" && page) return page
	if (typeof page === "number" && Number.isFinite(page)) return page
	return 1
}

export async function searchCatalogTitles(
	searchQuery: string,
	page: unknown,
	language = "en-US",
): Promise<{ results: CatalogCard[], total_pages: number }> {
	try {
		const config = useRuntimeConfig()
		const pageValue = pageParam(page)
		const headers = {
			accept: "application/json",
			Authorization: `Bearer ${config.apiBearerToken}`,
		}

		const [response, movieGenres, tvGenres] = await Promise.all([
			$fetch<{
				results: TmdbMediaRow[]
				total_pages: number
			}>(
				`${config.apiBaseUrl}/search/multi?query=${encodeURIComponent(searchQuery)}&include_adult=false&language=${encodeURIComponent(language)}&page=${pageValue}`,
				{ method: "GET", headers },
			),
			getMovieGenreNameMap(language),
			getTvGenreNameMap(language),
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
			message: "Error while searching titles.",
		})
	}
}
