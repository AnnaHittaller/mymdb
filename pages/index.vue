<script setup lang="ts">
definePageMeta({
    middleware: "auth",
    layout: "default",
})

const user = useCurrentUser()
// import { useUserMoviesStore } from '~/stores/useUserMoviesStore';


// const { currentUserPromise } = useFirebaseAuth()
// const userData: any = await currentUserPromise()

// const colorStore = useUiColorStore()
// colorStore.initialize()

// const userMoviesStore = useUserMoviesStore()
// // Fetch user movies when the component is mounted
// onMounted(async () => {
//     await userMoviesStore.fetchUserMovies();
// });

// // Watch for changes in the movies array
// const usersMovies = toRef(userMoviesStore, 'movies');
// const reversedMovies = computed(() => {
//     if (!usersMovies.value) return []
//     return usersMovies.value.slice().reverse()
// })

// const watchNextMovies = computed(() => {
//     const moviesWithTimestamp = userMoviesStore.movies.filter(movie => movie.next && movie.timestamp);
//     const moviesWithoutTimestamp = userMoviesStore.movies.filter(movie => movie.next && !movie.timestamp);

//     const sortedMoviesWithTimestamp = moviesWithTimestamp.sort((a, b) => {
//         const timestampA = (a.timestamp as any).toDate(); // Convert Firestore Timestamp to JavaScript Date
//         const timestampB = (b.timestamp as any).toDate(); 
//         return timestampB.getTime() - timestampA.getTime();
//     });

//     return [...sortedMoviesWithTimestamp, ...moviesWithoutTimestamp];
// })



</script>

<template>
    <div class="max-w-full">
        <Hero />
        <div class="flex justify-between items-center">
            <Heading class="pl-8">My movies {{ user?.displayName }}</Heading>
            <!-- <UButton to="/my-movies" label="View All" v-if="usersMovies.length > 2" class="text-lg" /> -->
        </div>
        <!-- <MovieSlider v-if="reversedMovies" :movies="reversedMovies" />
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
        </div> -->
    </div>
</template>

<style scoped></style>

<!-- TODO

delete sonner
checking navbar profile menu z-index problems between 640 and 1024px
refresh movies and movie store (ratings and poster) when loading the app first
search page and discover page: display icons for movieCards according to user's movies from pinia
create skeleton for swiper sliders and hero image / or loaders
adding toast for movie page: list modifications
add filtering options for directors / actors in the discovery page 
refactir for infinite scroll: search and discovery

filtering in watchlist/next list by genre
adding trailers and/or screenshots
including series too

-->