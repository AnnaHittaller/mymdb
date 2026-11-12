import { UPCOMING_WINDOW_DAYS } from "~/constants/upcoming"
import type { MediaType, TrendingItem } from "~/types/catalog"
import type { TmdbMediaRow } from "~/server/utils/tmdbNormalize"
import { toTrendingItem } from "~/server/utils/tmdbNormalize"
import { buildTmdbDiscoverMovieParams } from "~/server/utils/tmdbDiscoverQuery"
import { buildTmdbDiscoverTvParams } from "~/server/utils/tmdbDiscoverTvQuery"

export type UpcomingCatalogOptions = {
	days?: number
	page?: number
	movieGenreIds?: number[]
	tvGenreIds?: number[]
}

function utcDateIso(date: Date): string {
	return date.toISOString().slice(0, 10)
}

export function upcomingReleaseWindow(days: number): { gte: string, lte: string } {
	const start = new Date()
	start.setUTCHours(0, 0, 0, 0)
	const end = new Date(start)
	end.setUTCDate(end.getUTCDate() + Math.max(1, days))
	return { gte: utcDateIso(start), lte: utcDateIso(end) }
}

function parseGenreIds(ids: number[] | undefined): string {
	if (!ids?.length) return ""
	return ids.filter((id) => Number.isFinite(id) && id > 0).join(",")
}

function compareUpcoming(left: TrendingItem, right: TrendingItem): number {
	const byDate = left.releaseDate.localeCompare(right.releaseDate)
	if (byDate !== 0) return byDate
	const leftPop = left.popularity ?? 0
	const rightPop = right.popularity ?? 0
	return rightPop - leftPop
}

function inWindow(releaseDate: string, gte: string, lte: string): boolean {
	if (!releaseDate) return false
	return releaseDate >= gte && releaseDate <= lte
}

async function fetchUpcomingSegment(
	media: MediaType,
	page: number,
	window: { gte: string, lte: string },
	genreIds: string,
	config: ReturnType<typeof useRuntimeConfig>,
	headers: Record<string, string>,
	genreNames: Map<number, string>,
): Promise<TrendingItem[]> {
	const builder = media === "tv" ? buildTmdbDiscoverTvParams : buildTmdbDiscoverMovieParams
	const params = builder({
		page,
		genres: genreIds,
		releaseDateGte: window.gte,
		releaseDateLte: window.lte,
	})
	const response = await $fetch<{ results: TmdbMediaRow[] }>(
		`${config.apiBaseUrl}/discover/${media}?${params.toString()}`,
		{ method: "GET", headers },
	)
	return response.results.map((row) => toTrendingItem(row, media, genreNames))
}

export async function upcomingCatalogTitles(
	options: UpcomingCatalogOptions = {},
): Promise<TrendingItem[]> {
	const days = options.days ?? UPCOMING_WINDOW_DAYS
	const page = options.page ?? 1
	const window = upcomingReleaseWindow(days)
	const config = useRuntimeConfig()
	const headers = {
		accept: "application/json",
		Authorization: `Bearer ${config.apiBearerToken}`,
	}
	const movieGenres = parseGenreIds(options.movieGenreIds)
	const tvGenres = parseGenreIds(options.tvGenreIds)

	const [movieGenreMap, tvGenreMap] = await Promise.all([
		getMovieGenreNameMap(),
		getTvGenreNameMap(),
	])

	const [movieRows, tvRows] = await Promise.all([
		fetchUpcomingSegment("movie", page, window, movieGenres, config, headers, movieGenreMap),
		fetchUpcomingSegment("tv", page, window, tvGenres, config, headers, tvGenreMap),
	])

	let merged = [...movieRows, ...tvRows]
		.filter((item) => item.poster && inWindow(item.releaseDate, window.gte, window.lte))
		.sort(compareUpcoming)

	if (merged.length < 12 && page === 1) {
		const [movieExtra, tvExtra] = await Promise.all([
			fetchUpcomingSegment("movie", 2, window, movieGenres, config, headers, movieGenreMap),
			fetchUpcomingSegment("tv", 2, window, tvGenres, config, headers, tvGenreMap),
		])
		const seen = new Set(merged.map((item) => `${item.mediaType}:${item.id}`))
		const extra = [...movieExtra, ...tvExtra]
			.filter((item) => item.poster && inWindow(item.releaseDate, window.gte, window.lte))
			.filter((item) => !seen.has(`${item.mediaType}:${item.id}`))
			.sort(compareUpcoming)
		merged = [...merged, ...extra].sort(compareUpcoming)
	}

	return merged
}
