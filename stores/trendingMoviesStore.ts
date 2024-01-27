import { defineStore } from "pinia";

export const useTrendingMoviesStore = defineStore("trendingMovies", () => {
	const trendingMovies = ref([])
	const isLoaded = ref(false)
	
    const fetchTrendingMovies = async () => {
        try { 

            const {data } = await useFetch('/api/movies/trending')
			console.log("PINIA trending",data)
            trendingMovies.value = data
			isLoaded.value = true
			console.log(trendingMovies.value)
			console.log(isLoaded.value)
            return data
            
        } catch (error) {
        console.log(error);
        }
    };

	fetchTrendingMovies()

	return {
		fetchTrendingMovies, trendingMovies, isLoaded
	}
});