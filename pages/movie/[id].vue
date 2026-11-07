<script setup lang="ts">
import { POSTER_DETAIL_IMAGE_URL, PROFILE_IMAGE_URL } from "~/constants/movie";
import type { Movie } from "~/types/movie";
import { formatMovieRating } from "~/utils/formatMovieRating";

definePageMeta({
    layout: "default",
})

const route = useRoute()
const user = useCurrentUser()

const { isInList, movies, add, remove, setNext } = useUserDocument()

const movieId = computed(() => String(route.params.id))

const cachedPayload = (key: string, nuxtApp: ReturnType<typeof useNuxtApp>) =>
    nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]

const movieFetch = useFetch<Movie>(() => `/api/movies/${movieId.value}`, {
    key: `movie-${movieId.value}`,
    getCachedData: cachedPayload,
})
const similarFetch = useFetch(() => `/api/movies/similar?id=${movieId.value}`, {
    key: `similar-${movieId.value}`,
    getCachedData: cachedPayload,
})

const [{ data, pending, error }, { data: similar }] = await Promise.all([movieFetch, similarFetch])

const movie = computed(() => data.value)

const averageRatingLabel = computed(() =>
	movie.value ? formatMovieRating(movie.value.vote_average) : "N/A",
)
const moviesWithPoster = computed(() => similar.value ?? [])

const isInMovieList = computed(() => isInList(movieId.value));

const isInNextList = computed(() => {
    return movies.value.some((entry) => entry.id === movieId.value && entry.next);
});

const addToMovieList = async () => {
    const current = movie.value
    if (!current) return
    await add({
        id: movieId.value,
        title: current.title,
        rating: current.vote_average,
        poster: current.poster_path,
        genres: current.genres.map((genre) => genre.name),
        seen: false,
        next: false,
        timestamp: new Date()
    });
};

const removeFromMovieList = async () => {
    await remove(movieId.value)
}

const addToNextList = async () => {
    await setNext(movieId.value, true);
}

const removeFromNextList = async () => {
    await setNext(movieId.value, false);
}

// TODO: add directors, producers and music composers
</script>

<template>
    <div v-if="pending" class="px-8 py-8 text-lg">Loading…</div>
    <div v-else-if="movie && !error">
        <Heading class="block md:hidden pb-8">{{ movie.title }}</Heading>
        <div class="flex flex-col md:flex-row items-center gap-8 xl:gap-16 pb-4 text-lg md:text-base">
            <div class="flex flex-col gap-4 md:self-start md:w-[18rem] lg:w-sm md:shrink-0">
                <div class="relative" v-auto-animate>
                    <div v-auto-animate="{ duration: 150 }" v-if="user && isInMovieList">
                        <button v-if="!isInNextList" type="button" aria-label="Add to favorites"
                            class="z-20 absolute -top-1 -right-1 origin-center scale-150 cursor-pointer border-0 bg-transparent p-0 leading-none text-primary transition"
                            @click.stop="addToNextList">
                            <UIcon name="i-heroicons-heart" class="text-2xl" />
                        </button>
                        <button v-if="isInNextList" type="button" aria-label="Remove from favorites"
                            class="z-20 absolute -top-1 -right-1 origin-center scale-150 cursor-pointer border-0 bg-transparent p-0 leading-none text-primary transition"
                            @click.stop="removeFromNextList">
                            <UIcon name="i-heroicons-heart-solid" class="text-2xl" />
                        </button>
                    </div>
                    <img :src="`${POSTER_DETAIL_IMAGE_URL}${movie.poster_path}`" :alt="movie.title" width="780"
                        height="1170" fetchpriority="high" decoding="async"
                        class="w-full max-w-sm aspect-[2/3] object-cover" />
                </div>
                <div class="icon-group flex gap-4 w-full">
                    <UButton v-if="!user" icon="i-heroicons-arrow-right-on-rectangle" color="primary" variant="outline"
                        label="Sign in" class="flex gap-2 items-center justify-center text-lg" block
                        :to="{ path: '/login', query: { redirect: route.fullPath } }" />
                    <UButton v-else-if="!isInMovieList" icon="i-heroicons-list-bullet-20-solid" color="primary"
                        variant="outline" label="Add to my movies"
                        class="flex gap-2 items-center justify-center text-lg" block @click="addToMovieList" />
                    <UButton icon="i-heroicons-x-circle" color="primary" variant="outline" label="Remove from watchlist"
                        class="flex gap-2 items-center justify-center text-lg" block @click="removeFromMovieList"
                        v-else />
                </div>
            </div>
            <div class="w-full flex flex-col gap-4">
                <Heading class="hidden md:block">{{ movie.title }}</Heading>
                <div>
                    <span v-for="genre in movie?.genres" class="text-lg font-bold">
                        <div v-if="movie.genres[0] != genre" class="bg-primary h-4 w-[.25rem] inline-block ml-2 mr-1">
                        </div>
                        {{ genre.name }}
                    </span>
                </div>
                <h3 class="text-lg">{{ movie.tagline }}</h3>
                <p class="max-w-2xl">{{ movie.overview }}</p>
                <Heading class="pt-4">Details</Heading>
                <div>Release date: {{ movie.release_date }}</div>
                <div>Runtime: {{ movie.runtime }} min</div>
                <div>Average rating: {{ averageRatingLabel }}</div>
                <Heading class="pt-4">Starring</Heading>
                <div class="flex flex-wrap gap-x-6 gap-y-4 md:max-lg:gap-x-4">
                    <div v-for="actor in movie.credits.cast.slice(0, 5)" :key="actor.id"
                        class=" flex flex-col items-center text-center shrink-0 w-20 md:max-lg:w-[4.5rem]">
                        <img v-if="actor.profile_path" :src="`${PROFILE_IMAGE_URL}${actor.profile_path}`"
                            :alt="actor.name" width="185" height="278" loading="lazy" decoding="async"
                            class="w-16 h-24 rounded-md object-cover" />
                        <p class="mt-2 text-sm font-medium">{{ actor.name }}</p>
                    </div>
                </div>

            </div>
        </div>
        <Heading class="pt-4">More like this</Heading>

        <div class="movie-grid " v-if="moviesWithPoster.length > 0">
            <MovieCard :movie="movie" v-for="movie in moviesWithPoster" :key="movie.id" />
        </div>
    </div>
    <div v-else>
        <p> {{ error }}</p>
    </div>
</template>
