<script setup>

definePageMeta({
    middleware: "auth"
})

// Search related data
const searchTerm = ref("")
const debouncedSearchTerm = refDebounced(searchTerm, 700)

let movies = ref([])
let currentPage = 1;

const url = computed(() => {
    return `api/movies/search?query=${debouncedSearchTerm.value}&page=${currentPage}`;
})

const { data, pending, error } = await useFetch(url)

watchEffect(() => {
    // Reset currentPage for a new search
    currentPage = 1;

    useFetch(`/api/movies/search?query=${debouncedSearchTerm.value}&page=${currentPage}`).then(({ data, pending, error }) => {

        if (data && data.value.results) {
            // Update the movies ref with the new data, replacing existing movies
            movies.value = toRaw(data.value.results);
        } else {
            console.error('No results found in the response.');
        }
    }).catch(error => {
        console.error('Error while searching for movies:', error);
    });
});

const moviesWithPoster = computed(() => {
    return movies.value.filter(movie => movie.poster !== null);
});

const loadMoreMovies = async () => {
    try {
        currentPage++;

        const { data, pending, error } = await useFetch(`/api/movies/search?query=${debouncedSearchTerm.value}&page=${currentPage}`);

        const newMovies = toRaw(data.value.results);
        movies.value = [...movies.value, ...newMovies.filter(newMovie => !movies.value.some(existingMovie => existingMovie.id === newMovie.id))];

    } catch (error) {
        console.error('Error while loading more movies:', error);
    }
};

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
            <Heading v-if="debouncedSearchTerm !== ''">Results</Heading>
            <p v-if="debouncedSearchTerm !== '' && data && data?.length === 0" class="text-xl">No matching
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