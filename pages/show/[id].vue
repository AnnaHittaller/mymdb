<script setup lang="ts">
import type { TvSeries } from "~/types/tv";
import type { DetailFact, DetailJob } from "~/types/detailFact";
import { formatDetailYear, formatRatingOutOfTen, formatRuntimeMinutes } from "~/utils/formatDetailFacts";
import { formatCreditNames } from "~/utils/normalizeDetailCredits";
import { togglePayloadFromCatalog } from "~/utils/catalogMoviePayload";
import { buildTvSeasonSummaries } from "~/utils/buildTvSeasonSummaries";

definePageMeta({
    layout: "default",
})

const route = useRoute()

const showId = computed(() => String(route.params.id))

const cachedPayload = (key: string, nuxtApp: ReturnType<typeof useNuxtApp>) =>
    nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]

const showFetch = useFetch<TvSeries>(() => `/api/tv/${showId.value}`, {
    key: `show-${showId.value}`,
    getCachedData: cachedPayload,
})
const recommendationsFetch = useFetch(() => `/api/tv/recommendations?id=${showId.value}`, {
    key: `recommendations-tv-${showId.value}`,
    getCachedData: cachedPayload,
})

const [{ data, pending, error }, { data: recommendations }] = await Promise.all([showFetch, recommendationsFetch])

const show = computed(() => data.value)
const showsWithPoster = computed(() => recommendations.value ?? [])
const episodeSeasons = computed(() => buildTvSeasonSummaries(show.value))

const listPayload = computed(() => {
    const current = show.value
    if (!current) return null
    return togglePayloadFromCatalog(
        {
            id: showId.value,
            mediaType: "tv",
            title: current.name,
            rating: current.vote_average,
            poster: current.poster_path,
            genres: current.genres.map((genre) => genre.name),
        },
        "tv",
        current.genres.map((genre) => genre.name),
    )
})

function countLabel(count: number, singular: string, plural: string): string {
    return `${count} ${count === 1 ? singular : plural}`
}

const facts = computed<DetailFact[]>(() => {
    const current = show.value
    if (!current) return []
    const items: DetailFact[] = []
    const runtimes = current.episode_run_time
    const average = runtimes?.length
        ? Math.round(runtimes.reduce((sum, minutes) => sum + minutes, 0) / runtimes.length)
        : null
    const runtime = formatRuntimeMinutes(average)
    if (runtime) items.push({ icon: "i-heroicons-clock", text: `${runtime} / ep` })
    const year = formatDetailYear(current.first_air_date)
    if (year) items.push({ icon: "i-heroicons-calendar", text: year })
    const rating = formatRatingOutOfTen(current.vote_average)
    if (rating) items.push({ icon: "i-heroicons-star-20-solid", text: rating, tone: "rating" })
    if (current.number_of_seasons) {
        items.push({
            icon: "i-heroicons-rectangle-stack",
            text: countLabel(current.number_of_seasons, "season", "seasons"),
        })
    }
    if (current.number_of_episodes) {
        items.push({
            icon: "i-heroicons-queue-list",
            text: countLabel(current.number_of_episodes, "episode", "episodes"),
        })
    }
    if (current.status) items.push({ icon: "i-heroicons-information-circle", text: current.status })
    return items
})

const jobs = computed<DetailJob[]>(() => {
    const credits = show.value?.detailCredits
    if (!credits) return []
    const items: DetailJob[] = []
    const createdBy = formatCreditNames(credits.createdBy)
    if (createdBy) items.push({ icon: "i-heroicons-pencil", text: `Created by ${createdBy}` })
    const music = formatCreditNames(credits.music)
    if (music) items.push({ icon: "i-heroicons-musical-note", text: `Music: ${music}` })
    return items
})
</script>

<template>
    <div v-if="pending" class="px-8 py-8 text-lg">Loading…</div>
    <MediaDetailView
        v-else-if="show && !error"
        :title="show.name"
        :poster-path="show.poster_path"
        :genres="show.genres"
        :tagline="show.tagline"
        :overview="show.overview"
        :facts="facts"
        :jobs="jobs"
        :keywords="show.keywords ?? []"
        :cast="show.detailCast"
        :gallery="show.gallery ?? []"
        :media-id="showId"
        media-type="tv"
        :trailer="show.trailer"
        :list-payload="listPayload"
        :episode-seasons="episodeSeasons">
        <template #related>
            <div v-if="showsWithPoster.length > 0" class="flex min-w-0 flex-col gap-3">
                <Heading flush tier="section">You may also like</Heading>
                <div class="movie-grid">
                    <MovieCard
                        v-for="item in showsWithPoster"
                        :key="`${item.mediaType ?? 'tv'}-${item.id}`"
                        :movie="item"
                        :media-type="item.mediaType ?? 'tv'"
                        show-media-type />
                </div>
            </div>
        </template>
    </MediaDetailView>
    <div v-else>
        <p> {{ error }}</p>
    </div>
</template>
