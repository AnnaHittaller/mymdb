import { defineStore } from "pinia";

export const useTrendingMoviesStore = defineStore("trendingMovies", () => {
	const trendingMovies = ref([]);
	const isLoaded = ref(false);

	const fetchTrendingMovies = async () => {
		try {
			// Check local storage for cached data
			const cachedData = JSON.parse(
				localStorage.getItem("trendingMovies") || "{}"
			);
			const now = new Date();
			const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
			const cachedTime = new Date(cachedData.timestamp).getTime();
			const nowTime = now.getTime();

			if (cachedTime && nowTime - cachedTime < CACHE_DURATION) {
				console.log("Using cached trending movies");
				trendingMovies.value = cachedData.movies || [];
				isLoaded.value = true;
				return;
			}

			// Fetch new data if cache is invalid or absent
			console.log("Fetching new trending movies");
			const { data } = await useFetch("/api/movies/trending");
			trendingMovies.value = data.value;
			isLoaded.value = true;

			// Save data and timestamp to local storage
			localStorage.setItem(
				"trendingMovies",
				JSON.stringify({
					movies: data.value,
					timestamp: now.toISOString(),
				})
			);
		} catch (error) {
			console.error("Error fetching trending movies:", error);
		}
	};

	// Ensure data is fetched on store creation if not already cached
	fetchTrendingMovies();

	return {
		fetchTrendingMovies,
		trendingMovies,
		isLoaded,
	};
});
