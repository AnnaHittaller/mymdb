<script setup lang="ts">
import { useCurrentUser } from 'vuefire';
import { useUpcomingCatalog } from '~/composables/useUpcomingCatalog';

definePageMeta({
    layout: "default",
})

const { t } = useI18n()
const user = useCurrentUser()
const { lists, catalogPrefs } = useUserDocument()

const upcomingPrefs = computed(() => (user.value ? catalogPrefs.value : null))
const { data: trendingMovies } = useTrendingCatalog('movie', { server: true })
const { data: trendingShows } = useTrendingCatalog('tv', { server: true })

const { data: upcomingItems, pending: upcomingPending } = useUpcomingCatalog(upcomingPrefs, {
    server: true,
})
</script>

<template>
    <div class="max-w-full">
        <Hero />
        <template v-if="user">
            <UserListsSection
                :limit="6"
                :show-see-all="lists.length > 6" />
        </template>
        <div v-else class="flex flex-col items-start gap-4 px-8 pb-8">
            <p class="text-lg">{{ $t('home.signInPrompt') }}</p>
            <div class="flex gap-4">
                <UButton :to="{ path: '/login', query: { redirect: '/' } }" :label="$t('nav.signIn')" class="text-lg" />
                <UButton to="/register" :label="$t('auth.register')" variant="outline" class="text-lg" />
            </div>
        </div>
        <div class="pb-8">
            <Heading class="pt-4">{{ $t('home.recommendations') }}</Heading>
            <div
                class="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 trending:grid-cols-3">
                <TrendingCollectionCard
                    class="md:col-start-1 md:row-start-2 trending:row-start-1"
                    :title="$t('home.trendingMovies')"
                    to="/trending/movies"
                    media-type="movie"
                    :items="trendingMovies ?? []" />
                <TrendingCollectionCard
                    class="order-first md:col-span-2 md:col-start-1 md:row-start-1 trending:order-none trending:col-span-1 trending:col-start-auto trending:row-start-auto"
                    :title="$t('home.comingSoon')"
                    :subtitle="t('home.comingSoonSubline')"
                    to="/coming-soon"
                    media-type="mixed"
                    variant="upcoming"
                    :items="upcomingItems ?? []"
                    :pending="upcomingPending"
                    :show-release-date="true" />
                <TrendingCollectionCard
                    class="md:col-start-2 md:row-start-2 trending:col-start-auto trending:row-start-auto"
                    :title="$t('home.trendingShows')"
                    to="/trending/shows"
                    media-type="tv"
                    :items="trendingShows ?? []" />
            </div>
        </div>
    </div>
</template>
