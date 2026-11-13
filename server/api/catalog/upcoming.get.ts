import { CACHE_DURATION } from "~/constants/movie"
import { UPCOMING_WINDOW_DAYS } from "~/constants/upcoming"
import { upcomingCatalogTitles } from "~/server/utils/catalogUpcoming"

function parseIdList(value: unknown): number[] | undefined {
	const raw = String(value ?? "").trim()
	if (!raw) return undefined
	const ids = raw
		.split(",")
		.map((part) => Number.parseInt(part, 10))
		.filter((id) => Number.isFinite(id) && id > 0)
	return ids.length > 0 ? ids : undefined
}

function parseDays(value: unknown): number {
	const parsed = Number(value)
	if (!Number.isFinite(parsed) || parsed < 1) return UPCOMING_WINDOW_DAYS
	return Math.min(parsed, 90)
}

function parsePage(value: unknown): number {
	const parsed = Number(value) || 1
	return parsed < 1 ? 1 : parsed
}

function parseRegion(value: unknown): string | undefined {
	const raw = String(value ?? "").trim().toUpperCase()
	return /^[A-Z]{2}$/.test(raw) ? raw : undefined
}

export default defineCachedEventHandler(async (event) => {
	const query = getQuery(event)
	const days = parseDays(query.days)
	const page = parsePage(query.page)
	const region = parseRegion(query.region)
	const movieGenreIds = parseIdList(query.movie_genres)
	const tvGenreIds = parseIdList(query.tv_genres)
	const watchProviderIds = parseIdList(query.watch_providers)
	const keywordIds = parseIdList(query.keywords)

	try {
		return await upcomingCatalogTitles({
			days,
			page,
			region: region ?? null,
			movieGenreIds,
			tvGenreIds,
			watchProviderIds,
			keywordIds,
		})
	} catch {
		throw createError({
			statusCode: 404,
			message: "Couldn't fetch upcoming titles.",
		})
	}
}, {
	maxAge: CACHE_DURATION / 1000,
	name: "catalog-upcoming",
	getKey: (event) => {
		const query = getQuery(event)
		const days = String(query.days ?? UPCOMING_WINDOW_DAYS)
		const page = String(query.page ?? 1)
		const movieGenres = String(query.movie_genres ?? "").trim()
		const tvGenres = String(query.tv_genres ?? "").trim()
		const providers = String(query.watch_providers ?? "").trim()
		const keywords = String(query.keywords ?? "").trim()
		const region = providers ? (parseRegion(query.region) ?? "") : ""
		if (!movieGenres && !tvGenres && !providers && !keywords) {
			return `${days}:${page}:shared`
		}
		return `${days}:${page}:${region}:${movieGenres}:${tvGenres}:${providers}:${keywords}`
	},
})
