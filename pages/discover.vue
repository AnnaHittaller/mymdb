<script setup>

definePageMeta({
    middleware: "auth"
})

let movies = ref([])
let currentPage = 1;

// Rating and Genre filter options 
const ratings = ['8.0', '7.0', '6.0', '5.0', '4.0', '3.0', '2.0'];

// Selected filters
const selectedRatings = ref("");
const selectedGenres = ref([]);
let genreMap = {}; // Object to map genre names to IDs

const fetchGenres = async () => {
    try {
        const { data } = await useFetch('/api/movies/genres');
        genreMap = data.value.genres.reduce((acc, genre) => {
            acc[genre.name] = genre.id;
            return acc;
        }, {});
    } catch (error) {
        console.error('Error while fetching genres:', error);
    }
};
fetchGenres();

// Compute genre names from genreMap
const genreNames = computed(() => Object.keys(genreMap));
//console.log(genreNames)

const { data: genreList, pending: genrePending, error: genreError } = await useFetch('/api/movies/genres')
const genres = toRaw(genreList.value.genres).map(genre => genre.name);
//console.log(toRaw(genreList.value.genres))

// Clear filters function
const clearFilters = () => {
    selectedRatings.value = "";
    selectedGenres.value = [];

    currentPage = 1;

    fetchMovies();
};

const fetchMovies = async () => {
    try {
        // Fetch data based on the current filters and page
        const genreIds = selectedGenres.value.map(genre => genreMap[genre]); // Map selected genre names to IDs
        const genreQuery = genreIds.join(','); // Join multiple genre IDs with comma
        //console.log(genreQuery)
        const { data, pending, error } = await useFetch(`/api/movies/discover?page=${currentPage}&rating=${selectedRatings.value}&genres=${genreQuery}`);

        // Update the movies ref with the new data, replacing existing movies
        movies.value = toRaw(data.value);
    } catch (error) {
        console.error('Error while fetching movies:', error);
    }
};

// Watch for changes in selectedRatings and fetch movies accordingly
watch(selectedRatings, async (newRating) => {
    try {
        await fetchMovies();
    } catch (error) {
        console.error('Error while fetching movies with rating:', error);
    }
});

watchEffect(() => {
    fetchMovies();
});


const moviesWithPoster = computed(() => {
    return movies?.value?.filter(movie => movie.poster !== null);
});


const loadMoreMovies = async () => {
    try {
        currentPage++;
        // Fetch more movies based on the original query and current page
        const genreIds = selectedGenres.value.map(genre => genreMap[genre]); // Map selected genre names to IDs
        const genreQuery = genreIds.join(','); // Join multiple genre IDs with comma
        const { data, pending, error } = await useFetch(`/api/movies/discover?page=${currentPage}&rating=${selectedRatings.value}&genres=${genreQuery}`);

        const newMovies = toRaw(data.value);
        movies.value = [...movies.value, ...newMovies.filter(newMovie => !movies.value.some(existingMovie => existingMovie.id === newMovie.id))];

    } catch (error) {
        console.error('Error while loading more movies:', error);
    }
};

const selectMenuConfig = {
    option: {
        color: 'text-primary',
        selectedIcon: {
            base: 'dark:text-primary flex-shrink-0 cursor-pointer',
        },
        active: 'dark:bg-gray-800'
    },
    background: 'dark:bg-neutral-700',
    placeholder: 'text-primary',
    select: 'cursor-pointer'
}

</script>

<template>
    <div>
        <div class="flex flex-col gap-4 pb-8">
            <Heading>Discover new movies</Heading>
            <div class="flex gap-4 items-center">

                <!-- Rating filter dropdown -->
                <USelectMenu v-model="selectedRatings" size="lg" :options="ratings" placeholder="Minimum rating"
                    color="primary" :uiMenu="selectMenuConfig" class="z-50 min-w-[150px]" />

                <!-- Genre filter dropdown -->
                <USelectMenu v-model="selectedGenres" size="lg" :options="genres" multiple searchable
                    placeholder="Filter by genres" searchable-placeholder="Search by genre" color="primary"
                    :uiMenu="selectMenuConfig" class="z-50 min-w-[150px]" />

                <UButton label="Clear filters" size="lg" @click="clearFilters"/>
            </div>
        </div>
        <div class="flex flex-col items-stretch">
            <div class="movie-grid " v-if="true">
                <MovieCard :movie="movie" v-for="movie in moviesWithPoster" :key="movie.id" />
            </div>
            <UButton label="Load more" @click="loadMoreMovies" class="mt-14 mb-8 self-center" size="xl"
                v-if="moviesWithPoster.length > 0" />
        </div>
    </div>
</template>