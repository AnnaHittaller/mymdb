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
            <div class="pb-8">
                <Heading class="pt-4">Your lists</Heading>
                <div class="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
                    <MovieCollectionCard title="My movies" to="/my-movies" :movies="userMovies" />
                    <MovieCollectionCard title="Favorites" to="/watch-next" :movies="watchNextMovies" />
                </div>
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

search page and discover page: display icons for movieCards according to user's movies from useUserDocument
create skeleton for hero image / or loaders
adding toast for movie page: list modifications
add filtering options for directors / actors in the discovery page 
refactor for infinite scroll: search and discovery
create separate file for movie functions
make movie props keep the original names overall to avoid naming conflicts

filtering in watchlist/next list by genre
adding trailers and/or screenshots
including series too

-->
