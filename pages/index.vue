<script setup lang="ts">
import { useCurrentUser } from 'vuefire';

definePageMeta({
    layout: "default",
})

const user = useCurrentUser()
const { movies: userMovies, watchNext: watchNextMovies } = useUserDocument()
</script>

<template>
    <div class="max-w-full">
        <Hero />
        <template v-if="user">
            <div class="flex justify-between items-center pr-8 pb-4 gap-8">
                <Heading class="pl-8">My movies {{ user?.displayName }}</Heading>
                <UButton to="/my-movies" label="View All" v-if="userMovies.length > 2" class="text-lg" />
            </div>
            <MovieSlider v-if="userMovies" :movies="userMovies" />
            <div v-if="userMovies.length === 0" class="flex gap-4 max-sm:flex-col items-center max-sm:text-lg ">
                <p class="px-8">Add some movies to your watchlist first.</p>
                <UButton to="/search" label="Get movies" class="text-lg" />
            </div>
            <div class="flex justify-between items-center pr-8 pb-8 pt-4">
                <Heading class="pl-8 pt-8">Favorites</Heading>
                <UButton to="/watch-next" label="View All" v-if="watchNextMovies.length > 2" class="text-lg" />
            </div>
            <MovieSlider v-if="watchNextMovies" :movies="watchNextMovies" />
            <div v-if="watchNextMovies.length === 0"
                class="flex gap-4 max-sm:flex-col max-sm:text-lg items-center pb-8">
                <p class="px-8">Add some movies to your watchlist first.</p>
                <UButton to="/search" label="Get movies" class="text-lg" />
            </div>
        </template>
        <div v-else class="flex flex-col items-start gap-4 px-8 pb-8">
            <p class="text-lg">Sign in to keep your watchlist and favorites.</p>
            <div class="flex gap-4">
                <UButton :to="{ path: '/login', query: { redirect: '/' } }" label="Sign in" class="text-lg" />
                <UButton to="/register" label="Register" variant="outline" class="text-lg" />
            </div>
        </div>
    </div>
</template>

<!-- TODO

delete sonner
search page and discover page: display icons for movieCards according to user's movies from useUserDocument
create skeleton for swiper sliders and hero image / or loaders
adding toast for movie page: list modifications
add filtering options for directors / actors in the discovery page 
refactor for infinite scroll: search and discovery
create separate file for movie functions
make movie props keep the original names overall to avoid naming conflicts

filtering in watchlist/next list by genre
adding trailers and/or screenshots
including series too

-->