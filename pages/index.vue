<script setup lang="ts">
import { useUserMoviesStore } from '~/stores/useUserMoviesStore';

definePageMeta({
    middleware: "auth"
})

const { currentUserPromise } = useFirebaseAuth()
const userData: any = await currentUserPromise()

const colorStore = useUiColorStore()
colorStore.initialize()

const userMoviesStore = useUserMoviesStore()
// Fetch user movies when the component is mounted
onMounted(async () => {
    await userMoviesStore.fetchUserMovies();
});

// Watch for changes in the movies array
const usersMovies = toRef(userMoviesStore, 'movies');
const reversedMovies = computed(() => {
    if (!usersMovies.value) return []
    return usersMovies.value.slice().reverse()
})

const watchNextMovies = computed(() => {
    return userMoviesStore.movies.filter(movie => movie.next)
})
const reversedWatchNextMovies = computed(() => {
    return watchNextMovies.value.slice().reverse()
})

</script>

<template>
    <div class="pb-4 max-w-full">
        <Hero />
        <div class="flex justify-between items-center pr-4 pb-8">
            <Heading class="pl-4">My movies</Heading>
            <UButton to="/my-movies" label="View All" v-if="usersMovies.length > 2" class="text-lg" />
        </div>
        <MovieSlider v-if="reversedMovies" :movies="reversedMovies" />
        <div v-if="reversedMovies.length === 0" class="flex gap-4 max-sm:flex-col items-center max-sm:text-lg ">
            <p class="px-4">Add some movies to your watchlist first.</p>
            <UButton to="/search" label="Get movies" class="text-lg" />
        </div>
        <div class="flex justify-between items-center pr-4 pb-8 pt-4">
            <Heading class="pl-4 pt-8">Watch next</Heading>
            <UButton to="/watch-next" label="View All" v-if="watchNextMovies.length > 2" class="text-lg" />
        </div>
        <MovieSlider v-if="reversedWatchNextMovies" :movies="reversedWatchNextMovies" />
        <div v-if="reversedWatchNextMovies.length === 0"
            class="flex gap-4 max-sm:flex-col max-sm:text-lg items-center pb-8">
            <p class="px-4">Add some movies to your watchlist first.</p>
            <UButton to="/search" label="Get movies" class="text-lg" />
        </div>
    </div>
</template> 

<style scoped></style>

<!-- TODO

create skeleton for swiper sliders and hero image / or loaders
adding toast for movie page: list modifications
make a store for the user instance - auth middleware
add timestamp for the movie updates and display next list according to date of modification
search results to id page then back: keep search results alive
add Google authentication
add filtering options for directors / actors in the discovery page
search and discovery load more button: don't display if all movies are loaded
search and discovery load more button: don't reshuffle the already loaded movies

filtering in watchlist/next list by genre
adding trailers and/or screenshots
search page and discover page: display icons for movieCards according to user's movies from pinia
including series too

-->