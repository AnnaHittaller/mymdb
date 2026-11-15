<script setup lang="ts">
import type { Movie } from "~/types/movie";
import type { DetailFact, DetailJob } from "~/types/detailFact";
import { formatDetailYear, formatRatingOutOfTen, formatRuntimeMinutes } from "~/utils/formatDetailFacts";
import { formatCreditNames } from "~/utils/normalizeDetailCredits";
import { togglePayloadFromCatalog } from "~/utils/catalogMoviePayload";
import { catalogMetaDescription, catalogPosterOgImage } from "~/utils/catalogSeoMeta";
import { payloadDuringHydration } from "~/utils/trendingCache";

definePageMeta({
    layout: "default",
})

const { t, locale } = useI18n()

const route = useRoute()

const movieId = computed(() => String(route.params.id))

const cachedPayload = (key: string, nuxtApp: ReturnType<typeof useNuxtApp>) =>
    payloadDuringHydration(key, nuxtApp)

const movieFetch = useFetch<Movie>(() => `/api/movies/${movieId.value}?language=${locale.value}`, {
    key: computed(() => `movie-${movieId.value}-${locale.value}`),
    watch: [locale],
    getCachedData: cachedPayload,
})
const recommendationsFetch = useFetch(() => `/api/movies/recommendations?id=${movieId.value}&language=${locale.value}`, {
    key: computed(() => `recommendations-${movieId.value}-${locale.value}`),
    watch: [locale],
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

const requestUrl = useRequestURL();

useSeoMeta({
	title: () => (movie.value?.title ? `${movie.value.title} · MyMDb` : "MyMDb"),
	description: () =>
		catalogMetaDescription(
			movie.value?.overview,
			movie.value?.title ? t("meta.seoWatchTitle", { title: movie.value.title }) : t("meta.seoMovieFallback"),
		),
	ogTitle: () => movie.value?.title,
	ogDescription: () =>
		catalogMetaDescription(
			movie.value?.overview,
			movie.value?.title ? t("meta.seoWatchTitle", { title: movie.value.title }) : t("meta.seoMovieFallback"),
		),
	ogImage: () => catalogPosterOgImage(movie.value?.poster_path),
	ogUrl: () => `${requestUrl.origin}/movie/${movieId.value}`,
	ogType: "website",
	twitterCard: "summary_large_image",
	twitterTitle: () => movie.value?.title,
	twitterDescription: () =>
		catalogMetaDescription(
			movie.value?.overview,
			movie.value?.title ? t("meta.seoWatchTitle", { title: movie.value.title }) : t("meta.seoMovieFallback"),
		),
	twitterImage: () => catalogPosterOgImage(movie.value?.poster_path),
});

const jobs = computed<DetailJob[]>(() => {
    const credits = movie.value?.detailCredits
    if (!credits) return []
    const items: DetailJob[] = []
    const directors = formatCreditNames(credits.directors)
    if (directors) {
        const label = credits.directors.length > 1 ? t("detail.directorsMany") : t("detail.directorOne")
        items.push({ icon: "i-heroicons-film", text: `${label} ${directors}` })
    }
    const music = formatCreditNames(credits.music)
    if (music) items.push({ icon: "i-heroicons-musical-note", text: t("detail.musicFact", { names: music }) })
    return items
})
</script>

<template>
    <div v-if="pending" class="px-8 py-8 text-lg">{{ $t('common.loading') }}</div>
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
        :list-payload="listPayload"
        :collection="movie.collection ?? null">
        <template #related>
            <div v-if="moviesWithPoster.length > 0" class="flex min-w-0 flex-col gap-3">
                <Heading flush tier="section">{{ $t('detail.youMayAlsoLike') }}</Heading>
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
