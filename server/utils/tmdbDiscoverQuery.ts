export type DiscoverQueryInput = {
	page: number | string
	rating?: number | string
	genres?: string
	keywords?: string
	withCast?: string
	releaseYearGte?: number | string
	releaseYearLte?: number | string
}

export function buildTmdbDiscoverMovieParams(input: DiscoverQueryInput): URLSearchParams {
	const page = Number(input.page) || 1
	const rating = Number(input.rating) || 0
	const genres = String(input.genres ?? "")
	const keywords = String(input.keywords ?? "").trim()
	const withCast = String(input.withCast ?? "").trim()
	const releaseYearGte = Number(input.releaseYearGte) || 0
	const releaseYearLte = Number(input.releaseYearLte) || 0

	const params = new URLSearchParams({
		include_adult: "false",
		include_video: "false",
		language: "en-US",
		page: String(page),
		sort_by: "popularity.desc",
	})

	if (rating > 0) params.set("vote_average.gte", String(rating))
	if (keywords) params.set("with_keywords", keywords)
	else if (genres) params.set("with_genres", genres)
	if (withCast) params.set("with_cast", withCast)
	if (releaseYearGte > 0) {
		params.set("primary_release_date.gte", `${releaseYearGte}-01-01`)
	}
	if (releaseYearLte > 0) {
		params.set("primary_release_date.lte", `${releaseYearLte}-12-31`)
	}

	return params
}
