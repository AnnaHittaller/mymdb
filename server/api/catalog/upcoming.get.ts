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

export default defineCachedEventHandler(async (event) => {
	const query = getQuery(event)
	const days = parseDays(query.days)
	const page = parsePage(query.page)
	const movieGenreIds = parseIdList(query.movie_genres)
	const tvGenreIds = parseIdList(query.tv_genres)

	try {
		return await upcomingCatalogTitles({
			days,
			page,
			movieGenreIds,
			tvGenreIds,
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
		return `${days}:${page}:${movieGenres}:${tvGenres}`
	},
})
