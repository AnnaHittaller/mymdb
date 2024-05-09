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
    const moviesWithTimestamp = userMoviesStore.movies.filter(movie => movie.next && movie.timestamp);
    const moviesWithoutTimestamp = userMoviesStore.movies.filter(movie => movie.next && !movie.timestamp);

    const sortedMoviesWithTimestamp = moviesWithTimestamp.sort((a, b) => {
        const timestampA = (a.timestamp as any).toDate(); // Convert Firestore Timestamp to JavaScript Date
        const timestampB = (b.timestamp as any).toDate(); 
        return timestampB.getTime() - timestampA.getTime();
    });

    return [...sortedMoviesWithTimestamp, ...moviesWithoutTimestamp];
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
        <MovieSlider v-if="watchNextMovies" :movies="watchNextMovies" />
        <div v-if="watchNextMovies.length === 0"
            class="flex gap-4 max-sm:flex-col max-sm:text-lg items-center pb-8">
            <p class="px-4">Add some movies to your watchlist first.</p>
            <UButton to="/search" label="Get movies" class="text-lg" />
        </div>
    </div>
</template> 

<style scoped></style>

<!-- TODO

checking footer profile menu z-index problems between 640 and 1024px
refresh movies and movie store (ratings and poster) when loading the app first
search page and discover page: display icons for movieCards according to user's movies from pinia
add Google authentication
create skeleton for swiper sliders and hero image / or loaders
adding toast for movie page: list modifications
add filtering options for directors / actors in the discovery page 
search and discovery load more button: don't display if all movies are loaded
search and discovery load more button: don't reshuffle the already loaded movies

filtering in watchlist/next list by genre
adding trailers and/or screenshots
including series too

-->