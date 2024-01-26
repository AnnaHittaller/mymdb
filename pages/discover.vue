<script setup>

let movies = ref([])
let currentPage = 1;

// Rating and Genre filter options 
const ratings = ['All', '9.0', '8.0', '7.0', '6.0', '5.0', '4.0', '3.0', '2.0 and below'];

const { data, pending, error } = await useFetch(`api/movies/discover?page=${currentPage}`)

const { data: genreList, pending: genrePending, error: genreError } = await useFetch('/api/movies/genres')
const genres = toRaw(genreList.value.genres).map(genre => genre.name);
console.log(genres)


watchEffect(() => {
    // Reset currentPage for a new search
    currentPage = 1;

    // Fetch data based on the current search term and page
    useFetch(`/api/movies/discover?page=${currentPage}`).then(({ data, pending, error }) => {
        // Update the movies ref with the new data, replacing existing movies
        movies.value = toRaw(data.value);
    }).catch(error => {
        console.error('Error while searching for movies:', error);
    });
});


const moviesWithPoster = computed(() => {
    return movies?.value?.filter(movie => movie.poster !== null);
});


const loadMoreMovies = async () => {
    try {
        currentPage++;
        // Fetch more movies based on the original query and current page
        const { data, pending, error } = await useFetch(`/api/movies/discover?page=${currentPage}`);

        // Append the new movies to the existing movie array
        //movieArray.push(...moreMovies.value);

        const newMovies = toRaw(data.value);
        movies.value = [...movies.value, ...newMovies.filter(newMovie => !movies.value.some(existingMovie => existingMovie.id === newMovie.id))];

    } catch (error) {
        console.error('Error while loading more movies:', error);
    }

};


// Selected filters
const selectedRatings = ref("");
const selectedGenres = ref([]);

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
            </div>
        </div>
        <div class="flex flex-col items-stretch">
            <!-- <Heading v-if="debouncedSearchTerm !== ''">Results</Heading> -->
            <!-- <p>{{ movies}}</p> -->

            <div class="movie-grid " v-if="true">
                <MovieCard :movie="movie" v-for="movie in moviesWithPoster" :key="movie.id" />
                <!-- <MovieCard :movie="movie" v-for="movie in moreMovies" :key="movie.id" /> -->
            </div>
            <UButton label="Load more" @click="loadMoreMovies" class="mt-14 mb-8 self-center" size="xl"
                v-if="moviesWithPoster.length > 0" />
        </div>
    </div>
</template>