import { DISCOVER_RATING_SORT_MIN_VOTE_COUNT } from "../../constants/discoverFilters"
import { isDiscoverRatingSort, normalizeDiscoverSort, tmdbDiscoverSortBy } from "../../utils/discoverSort"
import { parseIsoReleaseDate, type DiscoverQueryInput } from "./tmdbDiscoverQuery";

export function buildTmdbDiscoverTvParams(
	input: DiscoverQueryInput,
	language = "en-US",
): URLSearchParams {
	const page = Number(input.page) || 1
	const rating = Number(input.rating) || 0
	const genres = String(input.genres ?? "")
	const keywords = String(input.keywords ?? "").trim()
	const withCast = String(input.withCast ?? "").trim()
	const watchProviders = String(input.watchProviders ?? "").trim()
	const watchRegion = String(input.watchRegion ?? "").trim().toUpperCase()
	const hasWatchRegion = /^[A-Z]{2}$/.test(watchRegion)
	const releaseYearGte = Number(input.releaseYearGte) || 0
	const releaseYearLte = Number(input.releaseYearLte) || 0
	const releaseDateGte = parseIsoReleaseDate(input.releaseDateGte)
	const releaseDateLte = parseIsoReleaseDate(input.releaseDateLte)
	const hasReleaseDateWindow = Boolean(releaseDateGte && releaseDateLte)

	const sortKey = normalizeDiscoverSort(input.sort)
	const params = new URLSearchParams({
		include_adult: "false",
		language,
		page: String(page),
		sort_by: tmdbDiscoverSortBy(String(input.sort ?? ""), "tv"),
	})

	if (isDiscoverRatingSort(sortKey)) {
		params.set("vote_count.gte", String(DISCOVER_RATING_SORT_MIN_VOTE_COUNT))
	}
	if (rating > 0) params.set("vote_average.gte", String(rating))
	if (keywords) params.set("with_keywords", keywords)
	if (genres) params.set("with_genres", genres)
	if (withCast) params.set("with_cast", withCast)
	if (watchProviders && hasWatchRegion) {
		params.set("with_watch_providers", watchProviders)
		params.set("watch_region", watchRegion)
	}
	if (hasReleaseDateWindow) {
		params.set("first_air_date.gte", releaseDateGte)
		params.set("first_air_date.lte", releaseDateLte)
	} else {
		if (releaseYearGte > 0) {
			params.set("first_air_date.gte", `${releaseYearGte}-01-01`)
		}
		if (releaseYearLte > 0) {
			params.set("first_air_date.lte", `${releaseYearLte}-12-31`)
		}
	}

	return params
}
