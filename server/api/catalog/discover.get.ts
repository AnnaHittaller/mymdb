import type { MediaType } from "~/types/catalog";
import type { TmdbMediaRow } from "~/server/utils/tmdbNormalize";
import { toCatalogCard } from "~/server/utils/tmdbNormalize";

type TmdbDiscoverResult = TmdbMediaRow & {
	popularity: number
	vote_average: number
}

function discoverMedia(query: Record<string, unknown>): MediaType {
	const media = String(query.media ?? "movie")
	if (media === "tv") return "tv"
	return "movie"
}

export default defineEventHandler(async (event) => {
	try {
		const query = getQuery(event)
		const media = discoverMedia(query)
		const config = useRuntimeConfig()
		const discoverInput = {
			page: String(query.page ?? 1),
			rating: String(query.rating ?? 0),
			genres: String(query.genres ?? ""),
			withCast: String(query.with_cast ?? ""),
			releaseYearGte: String(query.release_year_gte ?? 0),
			releaseYearLte: String(query.release_year_lte ?? 0),
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
})
