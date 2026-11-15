import { useMediaQuery } from "@vueuse/core";

const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * False during SSR and the hydration render. `useMediaQuery` reads the live
 * viewport during client setup, which disagrees with the server HTML.
 */
export function useIsDesktop() {
	const matches = useMediaQuery(DESKTOP_QUERY);
	const afterHydration = ref(false);
	onMounted(() => {
		afterHydration.value = true;
	});
	return computed(() => (afterHydration.value ? matches.value : false));
}
