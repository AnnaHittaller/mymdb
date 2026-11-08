import type { DiscoverQueryInput } from "./tmdbDiscoverQuery";

export function buildTmdbDiscoverTvParams(input: DiscoverQueryInput): URLSearchParams {
	const page = Number(input.page) || 1
	const rating = Number(input.rating) || 0
	const genres = String(input.genres ?? "")
	const withCast = String(input.withCast ?? "").trim()
	const releaseYearGte = Number(input.releaseYearGte) || 0
	const releaseYearLte = Number(input.releaseYearLte) || 0

	const params = new URLSearchParams({
		include_adult: "false",
		language: "en-US",
		page: String(page),
		sort_by: "popularity.desc",
	})

	if (rating > 0) params.set("vote_average.gte", String(rating))
	if (genres) params.set("with_genres", genres)
	if (withCast) params.set("with_cast", withCast)
	if (releaseYearGte > 0) {
		params.set("first_air_date.gte", `${releaseYearGte}-01-01`)
	}
	if (releaseYearLte > 0) {
		params.set("first_air_date.lte", `${releaseYearLte}-12-31`)
	}

	return params
}
