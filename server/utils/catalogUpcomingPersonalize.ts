import type { TrendingItem } from "~/types/catalog"
import type { UpcomingCatalogOptions } from "~/server/utils/catalogUpcoming"

export function upcomingTrendKey(item: TrendingItem): string {
	return `${item.mediaType}:${item.id}`
}

export function hasUpcomingPersonalizationPrefs(options: UpcomingCatalogOptions): boolean {
	return Boolean(
		options.movieGenreIds?.length
			|| options.tvGenreIds?.length
			|| options.keywordIds?.length
			|| (options.watchProviderIds?.length && options.region),
	)
}

function genreNamesForIds(ids: number[] | undefined, names: Map<number, string>): Set<string> {
	const result = new Set<string>()
	for (const id of ids ?? []) {
		const name = names.get(id)
		if (name) result.add(name)
	}
	return result
}

export function genreMatchKeys(
	baseline: TrendingItem[],
	movieGenreIds: number[] | undefined,
	tvGenreIds: number[] | undefined,
	movieGenreMap: Map<number, string>,
	tvGenreMap: Map<number, string>,
): Set<string> {
	const movieNames = genreNamesForIds(movieGenreIds, movieGenreMap)
	const tvNames = genreNamesForIds(tvGenreIds, tvGenreMap)
	if (!movieNames.size && !tvNames.size) return new Set()

	const keys = new Set<string>()
	for (const item of baseline) {
		const names = item.mediaType === "tv" ? tvNames : movieNames
		if (!names.size) continue
		if (item.genres.some((genre) => names.has(genre))) {
			keys.add(upcomingTrendKey(item))
		}
	}
	return keys
}

export function personalizeUpcomingOrder(
	baseline: TrendingItem[],
	preferKeys: Set<string>,
	compare: (left: TrendingItem, right: TrendingItem) => number,
): TrendingItem[] {
	if (!preferKeys.size) return baseline
	const preferred: TrendingItem[] = []
	const remainder: TrendingItem[] = []
	for (const item of baseline) {
		if (preferKeys.has(upcomingTrendKey(item))) preferred.push(item)
		else remainder.push(item)
	}
	preferred.sort(compare)
	remainder.sort(compare)
	return [...preferred, ...remainder]
}
