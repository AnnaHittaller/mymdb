<script setup lang="ts">
import { useCurrentUser } from 'vuefire';

definePageMeta({
    layout: "default",
})

const user = useCurrentUser()
const { movies: userMovies, watchNext: watchNextMovies } = useUserDocument()
const { data: trendingMovies } = useTrendingCatalog('movie', { server: true })
const { data: trendingShows } = useTrendingCatalog('tv', { server: true })
</script>

<template>
    <div class="max-w-full">
        <Hero />
        <div class="pb-8">
            <Heading class="pt-4">Trending</Heading>
            <div class="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
                <TrendingCollectionCard
                    title="Trending movies"
                    to="/trending/movies"
                    media-type="movie"
                    :items="trendingMovies ?? []" />
                <TrendingCollectionCard
                    title="Trending shows"
                    to="/trending/shows"
                    media-type="tv"
                    :items="trendingShows ?? []" />
            </div>
        </div>
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
