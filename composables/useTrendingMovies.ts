export function useTrendingMovies() {
	return useFetch("/api/movies/trending", {
		key: "trending-movies",
		getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
	});
}
