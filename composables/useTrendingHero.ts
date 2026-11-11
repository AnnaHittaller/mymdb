import { BACKDROP_COMPACT_IMAGE_URL, BACKDROP_IMAGE_URL } from "~/constants/movie";
import type { TrendingItem } from "~/types/catalog";
import { cachedTrendingList } from "~/utils/trendingCache";

const TRENDING_HERO_KEY = "trending-hero";

let warmedBackdrop = false;

function warmFirstBackdrop(path: string) {
	if (warmedBackdrop) return;
	warmedBackdrop = true;
	const run = () => {
		const img = new Image();
		const base = window.innerWidth < 1280 ? BACKDROP_COMPACT_IMAGE_URL : BACKDROP_IMAGE_URL;
		img.src = `${base}${path}`;
	};
	if ("requestIdleCallback" in window) requestIdleCallback(run);
	else setTimeout(run, 1200);
}

export function useTrendingHero(options?: { lazy?: boolean; server?: boolean }) {
	const result = useFetch<TrendingItem[]>("/api/catalog/trending-hero", {
		key: TRENDING_HERO_KEY,
		lazy: options?.lazy,
		server: options?.server,
		getCachedData(key, nuxtApp) {
			return cachedTrendingList(key, nuxtApp);
		},
	});

	if (import.meta.client) {
		const route = useRoute();
		watch(result.data, (items) => {
			if (!items) return;
			const backdrop = items[0]?.backdrop;
			if (backdrop && route.path !== "/") warmFirstBackdrop(backdrop);
		}, { immediate: true });
	}

	return result;
}
