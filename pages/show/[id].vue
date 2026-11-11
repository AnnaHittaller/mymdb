<script setup lang="ts">
import { POSTER_DETAIL_IMAGE_URL, PROFILE_IMAGE_URL } from "~/constants/movie";
import type { TvSeries } from "~/types/tv";
import { formatMovieRating } from "~/utils/formatMovieRating";
import { togglePayloadFromCatalog } from "~/utils/catalogMoviePayload";

definePageMeta({
    layout: "default",
})

const route = useRoute()
const user = useCurrentUser()

const { isInFavorites, setFavorites } = useUserDocument()
const { notifyListError } = useListCapToast()

const showId = computed(() => String(route.params.id))

const cachedPayload = (key: string, nuxtApp: ReturnType<typeof useNuxtApp>) =>
    nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]

const showFetch = useFetch<TvSeries>(() => `/api/tv/${showId.value}`, {
    key: `show-${showId.value}`,
    getCachedData: cachedPayload,
})
const similarFetch = useFetch(() => `/api/tv/similar?id=${showId.value}`, {
    key: `similar-tv-${showId.value}`,
    getCachedData: cachedPayload,
})

const [{ data, pending, error }, { data: similar }] = await Promise.all([showFetch, similarFetch])

const show = computed(() => data.value)

const averageRatingLabel = computed(() =>
    show.value ? formatMovieRating(show.value.vote_average) : "N/A",
)

const runtimeLabel = computed(() => {
    const runtimes = show.value?.episode_run_time;
    if (!runtimes?.length) return "—";
    const average = Math.round(runtimes.reduce((sum, n) => sum + n, 0) / runtimes.length);
    return `${average} min / episode`;
});

const showsWithPoster = computed(() => similar.value ?? [])

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

const inFavorites = computed(() => isInFavorites(showId.value, "tv"))

async function toggleFavorites() {
    const payload = listPayload.value
    if (!payload) return
    try {
        await setFavorites(payload, !inFavorites.value)
    } catch (error) {
        notifyListError(error)
    }
}

const {
    modalOpen: trailerModalOpen,
    activeTitle: trailerModalTitle,
    activeTrailer,
    loading: trailerLoading,
    openTrailer,
} = useTrailerPlayback();

const hasTrailer = computed(() => Boolean(show.value?.trailer));

async function onWatchTrailer() {
    const current = show.value;
    if (!current) return;
    await openTrailer({
        id: showId.value,
        mediaType: "tv",
        title: current.name,
        trailer: current.trailer,
    });
}
</script>

<template>
    <div v-if="pending" class="px-8 py-8 text-lg">Loading…</div>
    <div v-else-if="show && !error">
        <Heading class="block md:hidden pb-8">{{ show.name }}</Heading>
        <div class="flex flex-col md:flex-row items-center gap-8 xl:gap-16 pb-4 text-lg md:text-lg">
            <div class="flex flex-col gap-4 md:self-start md:w-[18rem] lg:w-sm md:shrink-0">
                <div v-auto-animate class="relative">
                    <div v-if="user" v-auto-animate="{ duration: 150 }">
                        <button
                            type="button"
                            :aria-label="inFavorites ? 'Remove from favorites' : 'Add to favorites'"
                            class="z-20 absolute -top-1 -right-1 origin-center scale-150 cursor-pointer border-0 bg-transparent p-0 leading-none text-primary transition"
                            @click.stop="toggleFavorites">
                            <UIcon
                                :name="inFavorites ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
                                class="text-2xl" />
                        </button>
                    </div>
                    <img
                        :src="`${POSTER_DETAIL_IMAGE_URL}${show.poster_path}`" :alt="show.name" width="780"
                        height="1170" fetchpriority="high" decoding="async"
                        class="w-full max-w-sm aspect-[2/3] object-cover">
                </div>
                <WatchTrailerButton
                    v-if="hasTrailer"
                    :id="showId"
                    media-type="tv"
                    :title="show.name"
                    :trailer="show.trailer"
                    :loading="trailerLoading"
                    block
                    size="lg"
                    class="text-lg"
                    @play="onWatchTrailer" />
                <UButton
                    v-if="!user"
                    icon="i-heroicons-arrow-right-on-rectangle"
                    color="primary"
                    variant="outline"
                    label="Sign in"
                    class="flex gap-2 items-center justify-center text-lg"
                    block
                    :to="{ path: '/login', query: { redirect: route.fullPath } }" />
                <CatalogListActions
                    v-else-if="listPayload"
                    :payload="listPayload"
                    block
                    size="lg"
                    class="text-lg" />
            </div>
            <div class="w-full flex flex-col gap-4">
                <Heading class="hidden md:block">{{ show.name }}</Heading>
                <div>
                    <span v-for="genre in show?.genres" :key="genre.id" class="text-xl font-bold">
                        <div v-if="show.genres[0] != genre" class="bg-primary h-4 w-[.25rem] inline-block ml-2 mr-1" />
                        {{ genre.name }}
                    </span>
                </div>
                <h3 v-if="show.tagline" class="text-xl">{{ show.tagline }}</h3>
                <p class="max-w-2xl">{{ show.overview }}</p>
                <Heading class="pt-4">Details</Heading>
                <div>First air date: {{ show.first_air_date }}</div>
                <div v-if="show.number_of_seasons">Seasons: {{ show.number_of_seasons }}</div>
                <div>Typical runtime: {{ runtimeLabel }}</div>
                <div>Average rating: {{ averageRatingLabel }}</div>
                <Heading class="pt-4">Starring</Heading>
                <div class="flex flex-wrap gap-x-6 gap-y-4 md:max-lg:gap-x-4">
                    <div
                        v-for="actor in show.credits.cast.slice(0, 5)" :key="actor.id"
                        class=" flex flex-col items-center text-center shrink-0 w-20 md:max-lg:w-[4.5rem]">
                        <img
                            v-if="actor.profile_path" :src="`${PROFILE_IMAGE_URL}${actor.profile_path}`"
                            :alt="actor.name" width="185" height="278" loading="lazy" decoding="async"
                            class="w-16 h-24 rounded-md object-cover">
                        <p class="mt-2 text-base font-medium">{{ actor.name }}</p>
                    </div>
                </div>

            </div>
        </div>
        <Heading class="pt-4">More like this</Heading>

        <div v-if="showsWithPoster.length > 0" class="movie-grid ">
            <MovieCard
                v-for="item in showsWithPoster"
                :key="`tv-${item.id}`"
                :movie="item"
                media-type="tv" />
        </div>
        <TrailerModal
            v-model:open="trailerModalOpen"
            :title="trailerModalTitle"
            :trailer="activeTrailer" />
    </div>
    <div v-else>
        <p> {{ error }}</p>
    </div>
</template>
