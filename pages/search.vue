<script setup>

// Search related data
const searchTerm = ref("")
const debouncedSearchTerm = refDebounced(searchTerm, 700)
const isInMyMoviesChecked = ref(false); // Checked state for "In my movies" button
const isSeenChecked = ref(false); // Checked state for "Seen" button


//const searchResults = toRaw(data?.value.results)
const url = computed(() => {
    // if (searchTerm.value.length >= 3) {
    return `api/movies/search?query=${debouncedSearchTerm.value}`;
    //}
    // Return an empty string if the search term is not long enough
    return '';
})

const { data, pending, error } = await useFetch(url)


// Function to toggle checkbox for "In my movies" button
const toggleInMyMoviesCheckbox = () => {
    isInMyMoviesChecked.value = !isInMyMoviesChecked.value;
};

// Function to toggle checkbox for "Seen" button
const toggleSeenCheckbox = () => {
    isSeenChecked.value = !isSeenChecked.value;
};

// Rating and Genre filter options
const ratings = ['1', '2', '3', '4', '5']; // Assuming ratings are from 1 to 5
let genres = []; // Fetch genres from API and set here

// Selected filters
const selectedRatings = ref([]);
const selectedGenres = ref([]);

const selectMenuConfig = {
    option: {
        color: 'text-primary',
        selectedIcon: {
            base: 'dark:text-primary flex-shrink-0 cursor-pointer',
        },
        active: 'dark:bg-gray-600'
    },
    background: 'dark:bg-gray-900',
    placeholder: 'text-primary',
    select: 'cursor-pointer'
}
console.log(data)
</script>

<template>
    <div>
        <div class="flex flex-col gap-4 pb-8">
            <UInput size="xl" placeholder="Search..." v-model="searchTerm" name="search"
                :ui="{ icon: { trailing: { pointer: '' } }, size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }"
                class="relative">
                <template #trailing>

                    <UButton v-show="searchTerm !== ''" color="white" variant="link" icon="i-heroicons-x-mark-20-solid"
                        :padded="false" @click="searchTerm = ''" class="pr-10" />
                    <div
                        class="bg-primary absolute right-0 top-0 h-full search-btn cursor-pointer rounded-r-md flex items-center justify-center">
                        <UIcon name="i-heroicons-magnifying-glass-20-solid" class="text-zinc-900 text-xl " />
                    </div>
                </template>
            </UInput>
            <div class="flex gap-4 items-center">
                <!-- My movies checkbox -->
                <UButton :variant="isInMyMoviesChecked ? 'solid' : 'outline'" size="sm" @click="toggleInMyMoviesCheckbox"
                    :ui="{ font: 'font-medium' }">
                    In my movies
                </UButton>

                <!-- Seen checkbox -->
                <UButton :variant="isSeenChecked ? 'solid' : 'outline'" size="sm" @click="toggleSeenCheckbox"
                    :ui="{ font: 'font-medium' }">
                    Seen
                </UButton>

                <!-- Rating filter dropdown -->
                <USelectMenu v-model="selectedRatings" size="sm" :options="ratings" multiple placeholder="My rating"
                    color="primary" :uiMenu="selectMenuConfig" />

                <!-- Genre filter dropdown -->
                <USelectMenu v-model="selectedGenres" size="sm" :options="genres" multiple searchable placeholder="Genres"
                    color="primary" :uiMenu="selectMenuConfig" />
            </div>
        </div>
        <div>
            <Heading>Results</Heading>
            <p v-if="data?.results.length === 0" class="text-xl">No matching result can be found.</p>
            <div class="movie-grid ">
                <!-- moviecard component, movie passed down as prop, results sorted by popularity??? -->
                <MovieCard :movie="movie" v-for="movie in data?.results" :key="movie.id" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.search-btn {
    aspect-ratio: 1/1;
}

.movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    row-gap: 2rem;
    column-gap: 1rem;
}
</style>