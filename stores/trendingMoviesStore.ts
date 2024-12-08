 import { defineStore } from "pinia";

// export const useTrendingMoviesStore = defineStore("trendingMovies", () => {
// 	const trendingMovies = ref([])
// 	const isLoaded = ref(false)
	
//     const fetchTrendingMovies = async () => {
//         try { 

//             const {data } = await useFetch('/api/movies/trending')
//             trendingMovies.value = data
// 			isLoaded.value = true
// 			console.log(trendingMovies.value)
// 			//console.log(isLoaded.value)
//             return data
            
//         } catch (error) {
//         console.log(error);
//         }
//     };

// 	fetchTrendingMovies()

// 	return {
// 		fetchTrendingMovies, trendingMovies, isLoaded
// 	}
// });

export const useTrendingMoviesStore = defineStore('trendingMovies', () => {
  const trendingMovies = ref([]);
  const isLoaded = ref(false);

  const fetchTrendingMovies = async () => {
    try {
      // Check local storage for cached data
      const cachedData = JSON.parse(localStorage.getItem('trendingMovies') || '{}');
      const now = new Date();
      
      if (cachedData.timestamp && new Date(cachedData.timestamp).getDate() === now.getDate()) {
        console.log('Using cached trending movies');
        trendingMovies.value = cachedData.movies || [];
        isLoaded.value = true;
        return;
      }

      // Fetch new data if cache is invalid or absent
      console.log('Fetching new trending movies');
      const { data } = await useFetch('/api/movies/trending');
      trendingMovies.value = data.value;
      isLoaded.value = true;

      // Save data and timestamp to local storage
      localStorage.setItem(
        'trendingMovies',
        JSON.stringify({
          movies: data.value,
          timestamp: now.toISOString(),
        })
      );
    } catch (error) {
      console.error('Error fetching trending movies:', error);
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