<script setup lang="ts">
import type { Movie } from "~/types/movie";
import type { DetailFact, DetailJob } from "~/types/detailFact";
import { formatDetailYear, formatRatingOutOfTen, formatRuntimeMinutes } from "~/utils/formatDetailFacts";
import { formatCreditNames } from "~/utils/normalizeDetailCredits";
import { togglePayloadFromCatalog } from "~/utils/catalogMoviePayload";

definePageMeta({
    layout: "default",
})

const route = useRoute()

const movieId = computed(() => String(route.params.id))

const cachedPayload = (key: string, nuxtApp: ReturnType<typeof useNuxtApp>) =>
    nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]

const movieFetch = useFetch<Movie>(() => `/api/movies/${movieId.value}`, {
    key: `movie-${movieId.value}`,
    getCachedData: cachedPayload,
})
const recommendationsFetch = useFetch(() => `/api/movies/recommendations?id=${movieId.value}`, {
    key: `recommendations-${movieId.value}`,
    getCachedData: cachedPayload,
})

const [{ data, pending, error }, { data: recommendations }] = await Promise.all([movieFetch, recommendationsFetch])

const movie = computed(() => data.value)
const moviesWithPoster = computed(() => recommendations.value ?? [])

const listPayload = computed(() => {
    const current = movie.value
    if (!current) return null
    return togglePayloadFromCatalog(
        {
            id: movieId.value,
            mediaType: "movie",
            title: current.title,
            rating: current.vote_average,
            poster: current.poster_path,
            genres: current.genres.map((genre) => genre.name),
        },
        "movie",
        current.genres.map((genre) => genre.name),
    )
})

const facts = computed<DetailFact[]>(() => {
    const current = movie.value
    if (!current) return []
    const items: DetailFact[] = []
    const runtime = formatRuntimeMinutes(current.runtime)
    if (runtime) items.push({ icon: "i-heroicons-clock", text: runtime })
    const year = formatDetailYear(current.release_date)
    if (year) items.push({ icon: "i-heroicons-calendar", text: year })
    const rating = formatRatingOutOfTen(current.vote_average)
    if (rating) items.push({ icon: "i-heroicons-star-20-solid", text: rating, tone: "rating" })
    return items
})

const jobs = computed<DetailJob[]>(() => {
    const credits = movie.value?.detailCredits
    if (!credits) return []
    const items: DetailJob[] = []
    const directors = formatCreditNames(credits.directors)
    if (directors) {
        const label = credits.directors.length > 1 ? "Dirs." : "Dir."
        items.push({ icon: "i-heroicons-film", text: `${label} ${directors}` })
    }
    const music = formatCreditNames(credits.music)
    if (music) items.push({ icon: "i-heroicons-musical-note", text: `Music: ${music}` })
    return items
})
</script>

<template>
    <div v-if="pending" class="px-8 py-8 text-lg">Loading…</div>
    <MediaDetailView
        v-else-if="movie && !error"
        :title="movie.title"
        :poster-path="movie.poster_path"
        :genres="movie.genres"
        :tagline="movie.tagline"
        :overview="movie.overview"
        :facts="facts"
        :jobs="jobs"
        :keywords="movie.keywords ?? []"
        :cast="movie.detailCast"
        :gallery="movie.gallery ?? []"
        :media-id="movieId"
        media-type="movie"
        :trailer="movie.trailer"
        :list-payload="listPayload">
        <template #related>
            <div v-if="moviesWithPoster.length > 0" class="flex min-w-0 flex-col gap-3">
                <Heading flush tier="section">You may also like</Heading>
                <div class="movie-grid">
                    <MovieCard
                        v-for="item in moviesWithPoster"
                        :key="`${item.mediaType ?? 'movie'}-${item.id}`"
                        :movie="item"
                        :media-type="item.mediaType ?? 'movie'"
                        show-media-type />
                </div>
            </div>
        </template>
    </MediaDetailView>
    <div v-else>
        <p> {{ error }}</p>
    </div>
</template>
