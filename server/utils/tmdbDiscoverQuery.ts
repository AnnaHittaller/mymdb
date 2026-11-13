export type DiscoverQueryInput = {
	page: number | string
	rating?: number | string
	genres?: string
	keywords?: string
	withCast?: string
	region?: string
	watchRegion?: string
	watchProviders?: string
	releaseYearGte?: number | string
	releaseYearLte?: number | string
	releaseDateGte?: string
	releaseDateLte?: string
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function parseIsoReleaseDate(value: unknown): string {
	const trimmed = String(value ?? "").trim()
	return ISO_DATE.test(trimmed) ? trimmed : ""
}

export function buildTmdbDiscoverMovieParams(input: DiscoverQueryInput): URLSearchParams {
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
	const region = String(input.region ?? "").trim().toUpperCase()
	const hasRegion = /^[A-Z]{2}$/.test(region)

	const params = new URLSearchParams({
		include_adult: "false",
		include_video: "false",
		language: "en-US",
		page: String(page),
		sort_by: "popularity.desc",
	})

	if (rating > 0) params.set("vote_average.gte", String(rating))
	if (keywords) params.set("with_keywords", keywords)
	if (genres) params.set("with_genres", genres)
	if (withCast) params.set("with_cast", withCast)
	if (watchProviders && hasWatchRegion) {
		params.set("with_watch_providers", watchProviders)
		params.set("watch_region", watchRegion)
	}
	if (hasReleaseDateWindow) {
		if (hasRegion) {
			params.set("region", region)
			params.set("release_date.gte", releaseDateGte)
			params.set("release_date.lte", releaseDateLte)
		} else {
			params.set("primary_release_date.gte", releaseDateGte)
			params.set("primary_release_date.lte", releaseDateLte)
		}
	} else {
		if (releaseYearGte > 0) {
			params.set("primary_release_date.gte", `${releaseYearGte}-01-01`)
		}
		if (releaseYearLte > 0) {
			params.set("primary_release_date.lte", `${releaseYearLte}-12-31`)
		}
	}

	return params
}
