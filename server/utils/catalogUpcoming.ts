import { MAX_CATALOG_GENRE_PREFS, MAX_CATALOG_KEYWORD_PREFS } from "~/domain/user-document/catalogPrefs"
import {
	flatrateWatchProviders,
	providerIdsForDiscover,
} from "~/server/utils/tmdbWatchProviders"
import {
	genreMatchKeys,
	hasUpcomingPersonalizationPrefs,
	personalizeUpcomingOrder,
	upcomingTrendKey,
} from "~/server/utils/catalogUpcomingPersonalize"
import { UPCOMING_WINDOW_DAYS } from "~/constants/upcoming"
import type { MediaType, TrendingItem } from "~/types/catalog"
import type { TmdbMediaRow } from "~/server/utils/tmdbNormalize"
import { toTrendingItem } from "~/server/utils/tmdbNormalize"
import { buildTmdbDiscoverMovieParams } from "~/server/utils/tmdbDiscoverQuery"
import { buildTmdbDiscoverTvParams } from "~/server/utils/tmdbDiscoverTvQuery"

export type UpcomingCatalogOptions = {
	days?: number
	page?: number
	region?: string | null
	movieGenreIds?: number[]
	tvGenreIds?: number[]
	watchProviderIds?: number[]
	keywordIds?: number[]
}

type DiscoverFilters = {
	genres?: string
	keywords?: string
	watchProviders?: string
	watchRegion?: string
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
	return ids
		.filter((id) => Number.isFinite(id) && id > 0)
		.slice(0, MAX_CATALOG_GENRE_PREFS)
		.join("|")
}

function parseDiscoverIds(ids: number[] | undefined, max: number): string {
	if (!ids?.length) return ""
	return ids
		.filter((id) => Number.isFinite(id) && id > 0)
		.slice(0, max)
		.join("|")
}

function parseRegion(value: string | null | undefined): string | undefined {
	if (!value) return undefined
	const region = value.trim().toUpperCase()
	return /^[A-Z]{2}$/.test(region) ? region : undefined
}

function compareUpcoming(left: TrendingItem, right: TrendingItem): number {
	const leftPop = left.popularity ?? 0
	const rightPop = right.popularity ?? 0
	return rightPop - leftPop
}

function inWindow(releaseDate: string, gte: string, lte: string): boolean {
	if (!releaseDate) return false
	return releaseDate >= gte && releaseDate <= lte
}

function normalizeSegment(
	rows: TrendingItem[],
	window: { gte: string, lte: string },
): TrendingItem[] {
	return rows
		.filter((item) => item.poster && inWindow(item.releaseDate, window.gte, window.lte))
		.sort(compareUpcoming)
}

async function fetchUpcomingSegment(
	media: MediaType,
	page: number,
	window: { gte: string, lte: string },
	filters: DiscoverFilters,
	config: ReturnType<typeof useRuntimeConfig>,
	headers: Record<string, string>,
	genreNames: Map<number, string>,
): Promise<TrendingItem[]> {
	const builder = media === "tv" ? buildTmdbDiscoverTvParams : buildTmdbDiscoverMovieParams
	const params = builder({
		page,
		genres: filters.genres ?? "",
		keywords: filters.keywords ?? "",
		releaseDateGte: window.gte,
		releaseDateLte: window.lte,
		...(filters.watchProviders && filters.watchRegion
			? { watchProviders: filters.watchProviders, watchRegion: filters.watchRegion }
			: {}),
	})
	const response = await $fetch<{ results: TmdbMediaRow[] }>(
		`${config.apiBaseUrl}/discover/${media}?${params.toString()}`,
		{ method: "GET", headers },
	)
	return response.results.map((row) => toTrendingItem(row, media, genreNames))
}

async function fetchBaselinePage(
	page: number,
	window: { gte: string, lte: string },
	config: ReturnType<typeof useRuntimeConfig>,
	headers: Record<string, string>,
	movieGenreMap: Map<number, string>,
	tvGenreMap: Map<number, string>,
): Promise<TrendingItem[]> {
	const empty: DiscoverFilters = {}
	const [movieRows, tvRows] = await Promise.all([
		fetchUpcomingSegment("movie", page, window, empty, config, headers, movieGenreMap),
		fetchUpcomingSegment("tv", page, window, empty, config, headers, tvGenreMap),
	])
	return normalizeSegment([...movieRows, ...tvRows], window).sort(compareUpcoming)
}

async function discoverMatchKeys(
	window: { gte: string, lte: string },
	filters: DiscoverFilters,
	config: ReturnType<typeof useRuntimeConfig>,
	headers: Record<string, string>,
	movieGenreMap: Map<number, string>,
	tvGenreMap: Map<number, string>,
): Promise<Set<string>> {
	const [movieRows, tvRows] = await Promise.all([
		fetchUpcomingSegment("movie", 1, window, filters, config, headers, movieGenreMap),
		fetchUpcomingSegment("tv", 1, window, filters, config, headers, tvGenreMap),
	])
	const keys = new Set<string>()
	for (const item of [...movieRows, ...tvRows]) {
		if (item.poster && inWindow(item.releaseDate, window.gte, window.lte)) {
			keys.add(upcomingTrendKey(item))
		}
	}
	return keys
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

	const [movieGenreMap, tvGenreMap] = await Promise.all([
		getMovieGenreNameMap(),
		getTvGenreNameMap(),
	])

	let merged = await fetchBaselinePage(page, window, config, headers, movieGenreMap, tvGenreMap)

	if (merged.length < 12 && page === 1) {
		const extraPage = await fetchBaselinePage(2, window, config, headers, movieGenreMap, tvGenreMap)
		const seen = new Set(merged.map((item) => upcomingTrendKey(item)))
		const extra = extraPage.filter((item) => !seen.has(upcomingTrendKey(item)))
		merged = [...merged, ...extra].sort(compareUpcoming)
	}

	if (page === 1 && hasUpcomingPersonalizationPrefs(options)) {
		const preferKeys = genreMatchKeys(
			merged,
			options.movieGenreIds,
			options.tvGenreIds,
			movieGenreMap,
			tvGenreMap,
		)

		const keywordFilter = parseDiscoverIds(options.keywordIds, MAX_CATALOG_KEYWORD_PREFS)
		if (keywordFilter) {
			const keywordKeys = await discoverMatchKeys(
				window,
				{ keywords: keywordFilter },
				config,
				headers,
				movieGenreMap,
				tvGenreMap,
			)
			for (const key of keywordKeys) preferKeys.add(key)
		}

		const watchRegion = parseRegion(options.region)
		const requestedProviders = options.watchProviderIds ?? []
		if (watchRegion && requestedProviders.length) {
			const [movieProviders, tvProviders] = await Promise.all([
				flatrateWatchProviders("movie", watchRegion),
				flatrateWatchProviders("tv", watchRegion),
			])
			const movieProviderFilter = providerIdsForDiscover(requestedProviders, movieProviders)
			const tvProviderFilter = providerIdsForDiscover(requestedProviders, tvProviders)
			const tasks: Promise<Set<string>>[] = []
			if (movieProviderFilter) {
				tasks.push(discoverMatchKeys(
					window,
					{ watchProviders: movieProviderFilter, watchRegion },
					config,
					headers,
					movieGenreMap,
					tvGenreMap,
				))
			}
			if (tvProviderFilter) {
				tasks.push(discoverMatchKeys(
					window,
					{ watchProviders: tvProviderFilter, watchRegion },
					config,
					headers,
					movieGenreMap,
					tvGenreMap,
				))
			}
			const providerKeySets = await Promise.all(tasks)
			for (const set of providerKeySets) {
				for (const key of set) preferKeys.add(key)
			}
		}

		merged = personalizeUpcomingOrder(merged, preferKeys, compareUpcoming)
	}

	return merged
}
