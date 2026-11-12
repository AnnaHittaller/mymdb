import type { CatalogCard, MediaType } from "~/types/catalog"
import type { TmdbMediaRow } from "~/server/utils/tmdbNormalize"
import { toCatalogCard } from "~/server/utils/tmdbNormalize"
import { castIdsFromWithCastParam } from "~/utils/browseQuery"

type TmdbDiscoverResult = TmdbMediaRow & {
	popularity: number
	vote_average: number
}

function asString(value: unknown): string {
	if (Array.isArray(value)) return value.map((entry) => String(entry ?? "")).join(",")
	if (value == null) return ""
	return String(value)
}

export function discoverMedia(query: Record<string, unknown>): MediaType {
	const media = asString(query.media)
	if (media === "tv") return "tv"
	return "movie"
}

export async function discoverCatalogTitles(
	query: Record<string, unknown>,
): Promise<CatalogCard[]> {
	try {
		const media = discoverMedia(query)
		const config = useRuntimeConfig()
		const discoverInput = {
			page: asString(query.page) || "1",
			rating: asString(query.rating) || "0",
			genres: asString(query.genres),
			withCast: castIdsFromWithCastParam(asString(query.with_cast)),
			releaseYearGte: asString(query.release_year_gte) || "0",
			releaseYearLte: asString(query.release_year_lte) || "0",
		}
		const params = media === "tv"
			? buildTmdbDiscoverTvParams(discoverInput)
			: buildTmdbDiscoverMovieParams(discoverInput)
		const headers = {
			accept: "application/json",
			Authorization: `Bearer ${config.apiBearerToken}`,
		}

		const genreMapPromise = media === "tv" ? getTvGenreNameMap() : getMovieGenreNameMap()
		const [response, genreNames] = await Promise.all([
			$fetch<{ results: TmdbDiscoverResult[] }>(
				`${config.apiBaseUrl}/discover/${media}?${params.toString()}`,
				{ method: "GET", headers },
			),
			genreMapPromise,
		])

		return response.results.map((item) => toCatalogCard(item, media, genreNames))
	} catch {
		throw createError({
			statusCode: 404,
			message: "Error while discovering titles.",
		})
	}
}
