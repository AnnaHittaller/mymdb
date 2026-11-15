import { BACKDROP_COMPACT_IMAGE_URL, BACKDROP_IMAGE_URL } from "~/constants/movie";
import type { TrendingItem } from "~/types/catalog";
import { cachedTrendingList } from "~/utils/trendingCache";


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
	const { locale } = useI18n();
	const query = computed(() => ({ language: locale.value }));
	const key = computed(() => `trending-hero-${locale.value}`);
	const result = useFetch<TrendingItem[]>("/api/catalog/trending-hero", {
		key,
		query,
		lazy: options?.lazy,
		server: options?.server,
		watch: [query],
		getCachedData(fetchKey, nuxtApp) {
			return cachedTrendingList(String(fetchKey), nuxtApp);
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
