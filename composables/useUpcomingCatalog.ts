import type { Ref } from "vue"
import type { TrendingItem } from "~/types/catalog"
import { UPCOMING_WINDOW_DAYS } from "~/constants/upcoming"
import { cachedTrendingList } from "~/utils/trendingCache"
import type { FavoriteGenreHints } from "~/composables/useFavoriteGenreHints"

type UpcomingQuery = {
	days: number
	page: number
	movie_genres?: string
	tv_genres?: string
}

function buildQuery(
	page: number,
	hints: FavoriteGenreHints | null | undefined,
): UpcomingQuery {
	const query: UpcomingQuery = { days: UPCOMING_WINDOW_DAYS, page }
	if (hints?.movieIds.length) query.movie_genres = hints.movieIds.join(",")
	if (hints?.tvIds.length) query.tv_genres = hints.tvIds.join(",")
	return query
}

export function useUpcomingCatalog(
	genreHints?: Ref<FavoriteGenreHints | null>,
	options?: { lazy?: boolean, server?: boolean },
) {
	const query = computed(() => buildQuery(1, genreHints?.value ?? null))
	const cacheKey = computed(() => {
		const hints = genreHints?.value
		if (!hints) return "catalog-upcoming-global"
		return `catalog-upcoming-${hints.movieIds.join("-")}-${hints.tvIds.join("-")}`
	})

	return useFetch<TrendingItem[]>("/api/catalog/upcoming", {
		key: cacheKey,
		query,
		lazy: options?.lazy,
		server: options?.server ?? true,
		watch: [query],
		getCachedData(key, nuxtApp) {
			return cachedTrendingList(key, nuxtApp)
		},
	})
}

export async function fetchUpcomingCatalogPage(
	page: number,
	hints?: FavoriteGenreHints | null,
): Promise<TrendingItem[]> {
	return await $fetch<TrendingItem[]>("/api/catalog/upcoming", {
		query: buildQuery(page, hints ?? null),
	})
}
