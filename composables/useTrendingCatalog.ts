import type { MediaType, TrendingItem } from "~/types/catalog";
import { cachedTrendingList } from "~/utils/trendingCache";

export function useTrendingCatalog(type: MediaType, options?: { lazy?: boolean; server?: boolean }) {
	return useFetch<TrendingItem[]>("/api/catalog/trending", {
		key: `catalog-trending-${type}`,
		query: { type, page: 1 },
		lazy: options?.lazy,
		server: options?.server,
		getCachedData(key, nuxtApp) {
			return cachedTrendingList(key, nuxtApp);
		},
	});
}

export async function fetchTrendingCatalogPage(
	type: MediaType,
	page: number,
): Promise<TrendingItem[]> {
	return await $fetch<TrendingItem[]>("/api/catalog/trending", {
		query: { type, page },
	});
}
