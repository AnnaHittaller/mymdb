<script setup lang="ts">
import { useCurrentUser } from 'vuefire';
import { useFavoriteGenreHints } from '~/composables/useFavoriteGenreHints';
import { useUpcomingCatalog } from '~/composables/useUpcomingCatalog';

definePageMeta({
    layout: "default",
})

const user = useCurrentUser()
const { lists, moviesInList, favoritesListId } = useUserDocument()
const { data: trendingMovies } = useTrendingCatalog('movie', { server: true })
const { data: trendingShows } = useTrendingCatalog('tv', { server: true })

const favorites = computed(() => moviesInList(favoritesListId))
const genreHints = useFavoriteGenreHints(favorites)

const personalizationReady = ref(false)
onMounted(() => {
    personalizationReady.value = true
})

const activeHints = computed(() => (
    personalizationReady.value && user.value ? genreHints.value : null
))

const { data: upcomingItems, pending: upcomingPending } = useUpcomingCatalog(activeHints, {
    server: true,
})

const upcomingTitle = computed(() => (
    activeHints.value ? 'Coming soon for you' : 'Coming soon'
))
</script>

<template>
    <div class="max-w-full">
        <Hero />
        <div class="pb-8">
            <Heading class="pt-4">Trending</Heading>
            <div class="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-4">
                <TrendingCollectionCard
                    title="Trending movies"
                    to="/trending/movies"
                    media-type="movie"
                    :items="trendingMovies ?? []" />
                <TrendingCollectionCard
                    :title="upcomingTitle"
                    to="/coming-soon"
                    media-type="mixed"
                    variant="upcoming"
                    :items="upcomingItems ?? []"
                    :pending="upcomingPending"
                    :show-release-date="true"
                    :leading-genre-override="activeHints?.highlightGenre ?? null"
                    :leading-genre-caption="activeHints ? 'Based on your taste for:' : undefined" />
                <TrendingCollectionCard
                    title="Trending shows"
                    to="/trending/shows"
                    media-type="tv"
                    :items="trendingShows ?? []" />
            </div>
        </div>
        <template v-if="user">
            <UserListsSection
                :limit="6"
                :show-see-all="lists.length > 6" />
        </template>
        <div v-else class="flex flex-col items-start gap-4 px-8 pb-8">
            <p class="text-lg">Sign in to keep your lists and favorites.</p>
            <div class="flex gap-4">
                <UButton :to="{ path: '/login', query: { redirect: '/' } }" label="Sign in" class="text-lg" />
                <UButton to="/register" label="Register" variant="outline" class="text-lg" />
            </div>
        </div>
    </div>
</template>
