import { parseIsoReleaseDate, type DiscoverQueryInput } from "./tmdbDiscoverQuery";

export function buildTmdbDiscoverTvParams(input: DiscoverQueryInput): URLSearchParams {
	const page = Number(input.page) || 1
	const rating = Number(input.rating) || 0
	const genres = String(input.genres ?? "")
	const keywords = String(input.keywords ?? "").trim()
	const withCast = String(input.withCast ?? "").trim()
	const releaseYearGte = Number(input.releaseYearGte) || 0
	const releaseYearLte = Number(input.releaseYearLte) || 0
	const releaseDateGte = parseIsoReleaseDate(input.releaseDateGte)
	const releaseDateLte = parseIsoReleaseDate(input.releaseDateLte)
	const hasReleaseDateWindow = Boolean(releaseDateGte && releaseDateLte)

	const params = new URLSearchParams({
		include_adult: "false",
		language: "en-US",
		page: String(page),
		sort_by: hasReleaseDateWindow ? "first_air_date.asc" : "popularity.desc",
	})

	if (rating > 0) params.set("vote_average.gte", String(rating))
	if (keywords) params.set("with_keywords", keywords)
	else if (genres) params.set("with_genres", genres)
	if (withCast) params.set("with_cast", withCast)
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
