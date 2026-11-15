import type { MaybeRefOrGetter, Ref } from "vue"
import { toValue } from "vue"
import type { TrendingItem } from "~/types/catalog"
import { UPCOMING_WINDOW_DAYS } from "~/constants/upcoming"
import {
	type CatalogPrefs,
	catalogPrefsAffectUpcoming,
	upcomingCacheKeySuffix,
} from "~/domain/user-document/catalogPrefs"
import { cachedTrendingList } from "~/utils/trendingCache"

type UpcomingQuery = {
	days: number
	page: number
	language: string
	region?: string
	movie_genres?: string
	tv_genres?: string
	watch_providers?: string
	keywords?: string
}

function buildQuery(
	page: number,
	prefs: CatalogPrefs | null | undefined,
	language: string,
): UpcomingQuery {
	const query: UpcomingQuery = { days: UPCOMING_WINDOW_DAYS, page, language }
	if (!catalogPrefsAffectUpcoming(prefs)) return query
	if (prefs!.watchProviderIds.length && prefs!.region) query.region = prefs!.region
	if (prefs!.movieGenreIds.length) query.movie_genres = prefs!.movieGenreIds.join(",")
	if (prefs!.tvGenreIds.length) query.tv_genres = prefs!.tvGenreIds.join(",")
	if (prefs!.watchProviderIds.length) query.watch_providers = prefs!.watchProviderIds.join(",")
	if (prefs!.keywordIds.length) query.keywords = prefs!.keywordIds.join(",")
	return query
}

export function useUpcomingCatalog(
	catalogPrefs?: Ref<CatalogPrefs | null | undefined> | MaybeRefOrGetter<CatalogPrefs | null | undefined>,
	options?: { lazy?: boolean, server?: boolean },
) {
	const { locale } = useI18n()
	const query = computed(() => buildQuery(1, toValue(catalogPrefs), locale.value))
	const cacheKey = computed(
		() => `catalog-upcoming-${locale.value}-${upcomingCacheKeySuffix(toValue(catalogPrefs))}`,
	)

	return useFetch<TrendingItem[]>("/api/catalog/upcoming", {
		key: cacheKey,
		query,
		lazy: options?.lazy,
		server: options?.server ?? true,
		watch: [query, cacheKey],
		getCachedData(key, nuxtApp) {
			return cachedTrendingList(key, nuxtApp)
		},
	})
}

export async function fetchUpcomingCatalogPage(
	page: number,
	prefs?: CatalogPrefs | null,
): Promise<TrendingItem[]> {
	const { locale } = useI18n()
	return await $fetch<TrendingItem[]>("/api/catalog/upcoming", {
		query: buildQuery(page, prefs, locale.value),
	})
}
