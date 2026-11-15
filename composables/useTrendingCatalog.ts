import type { MediaType, TrendingItem } from "~/types/catalog";
import { cachedTrendingList } from "~/utils/trendingCache";

export function useTrendingCatalog(type: MediaType, options?: { lazy?: boolean; server?: boolean }) {
	const { locale } = useI18n();
	const query = computed(() => ({ type, page: 1, language: locale.value }));
	const key = computed(() => `catalog-trending-${type}-${locale.value}`);
	return useFetch<TrendingItem[]>("/api/catalog/trending", {
		key,
		query,
		lazy: options?.lazy,
		server: options?.server,
		watch: [query],
		getCachedData(fetchKey, nuxtApp) {
			return cachedTrendingList(String(fetchKey), nuxtApp);
		},
	});
}

export async function fetchTrendingCatalogPage(
	type: MediaType,
	page: number,
): Promise<TrendingItem[]> {
	const { locale } = useI18n();
	return await $fetch<TrendingItem[]>("/api/catalog/trending", {
		query: { type, page, language: locale.value },
	});
}
