<script setup>

definePageMeta({
    middleware: "auth"
})

// Search related data
const searchTerm = ref("")
const debouncedSearchTerm = refDebounced(searchTerm, 700)

let movies = ref([])
let currentPage = 1;
let originalSearchTerm = ref("")

// Function to fetch movies for a given page
const fetchMoviesForPage = async (page) => {
    try {
        const { data, pending, error } = await useFetch(`/api/movies/search?query=${debouncedSearchTerm.value}&page=${page}`);
        return toRaw(data.value.results);
    } catch (error) {
        console.error('Error while fetching movies:', error);
        return [];
    }
};

// Computed property to generate URL for fetching movies
const url = computed(() => {
    return `api/movies/search?query=${debouncedSearchTerm.value}&page=${currentPage}`;
});

// Fetch movies when URL changes
const { data, pending, error } = await useFetch(url);

// Store search term in history state
const updateHistoryState = () => {
    const state = {
        searchTerm: searchTerm.value,
        movies: JSON.stringify(movies.value), // Serialize the movies array
        currentPage: currentPage,
    };
    window.history.replaceState(state, '', '');
};

// clear movies array when there is no search term
watchEffect(() => {
    if (searchTerm.value === '') {
        movies.value = [];
    }
})

// Watch for changes in searchTerm
watchEffect(() => {
    //console.log("o",originalSearchTerm.value, "d", debouncedSearchTerm.value)
    //console.log(currentPage)

    const fetchData = async () => {

        if (debouncedSearchTerm.value && originalSearchTerm.value !== debouncedSearchTerm.value) {
            currentPage = 1;
            movies.value = []; // Reset movies when search term changes
            originalSearchTerm.value = debouncedSearchTerm.value; // Update originalSearchTerm
        }

        // Check if searchTerm is empty before fetching movies
        if (debouncedSearchTerm.value.trim() !== '') {
            const fetchedMovies = [];
            for (let i = 1; i <= currentPage; i++) {
                const moviesData = await fetchMoviesForPage(i);
                fetchedMovies.push(...moviesData);
            }
            
            if (debouncedSearchTerm.value && originalSearchTerm.value !== debouncedSearchTerm.value) {
                movies.value = fetchedMovies;
            } else {
                const existingMovieIds = movies.value.map(movie => movie.id);
                const uniqueFetchedMovies = fetchedMovies.filter(movie => !existingMovieIds.includes(movie.id));
                movies.value.push(...uniqueFetchedMovies);
            }
        }

    };

    fetchData();
});

// Function to load more movies
const loadMoreMovies = async () => {
    currentPage++; // Increment currentPage when loading more movies
    const newMovies = await fetchMoviesForPage(currentPage);
    movies.value = [...movies.value, ...newMovies];
};

// Filter movies with poster
const moviesWithPoster = computed(() => {
    return movies.value.filter(movie => movie.poster !== null);
});

// Initialize search term and movies from history state
if (window.history.state && window.history.state.searchTerm) {
    searchTerm.value = window.history.state.searchTerm;
    originalSearchTerm.value = searchTerm.value;
    if (window.history.state.movies) {
        movies.value = JSON.parse(window.history.state.movies);
    }
    if (window.history.state.currentPage) {
        currentPage = window.history.state.currentPage;
    }
}

// Listen to popstate event to update search term and movies when user navigates back
window.addEventListener('popstate', () => {
    if (window.history.state && window.history.state.searchTerm) {
        searchTerm.value = window.history.state.searchTerm;
        if (window.history.state.movies) {
            movies.value = JSON.parse(window.history.state.movies);
        }
        if (window.history.state.currentPage) {
            currentPage = window.history.state.currentPage;
        }
    }
});

// Update history state when search term or page changes
watchEffect(() => {
    updateHistoryState();
});

</script>

<template>
    <div>
        <div class="flex flex-col gap-4 pb-8">
            <Heading>Search</Heading>
            <UInput size="xl" placeholder="Search..." v-model="searchTerm" name="search"
                :ui="{ icon: { trailing: { pointer: '' } }, size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }"
                class="relative">
                <template #trailing>
                    <UButton v-show="searchTerm !== ''" color="white" variant="link" icon="i-heroicons-x-mark-20-solid"
                        :padded="false" @click="searchTerm = ''" class="pr-10" />
                    <div
                        class="bg-primary absolute right-0 top-0 h-full search-btn rounded-r-md flex items-center justify-center">
                        <UIcon name="i-heroicons-magnifying-glass-20-solid" class="text-zinc-900 text-xl " />
                    </div>
                </template>
            </UInput>
            <div class="flex gap-4 items-center">
            </div>
        </div>
        <div class="flex flex-col items-stretch">
            <Heading v-if="debouncedSearchTerm !== '' ">Results</Heading>
            <p v-if="searchTerm !== '' && debouncedSearchTerm !== '' && moviesWithPoster && moviesWithPoster.length === 0"
                class="text-xl">No
                matching
                results can be found.</p>
            <div class="movie-grid " v-if="moviesWithPoster.length > 0">
                <MovieCard :movie="movie" v-for="movie in moviesWithPoster" :key="movie.id" />
            </div>
            <UButton label="Load more" @click="loadMoreMovies" class="mt-14 mb-8 self-center" size="xl"
                v-if="moviesWithPoster.length > 0 && data.total_pages > 1" />
        </div>
    </div>
</template>

<style scoped></style>