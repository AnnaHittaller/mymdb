<script setup lang="ts">
import { BASE_IMAGE_URL, MOVIE_API_URL } from "~/constants/movie";
import type { Movie, UserMovie } from "~/types/movie";
// definePageMeta({
//     middleware: "auth"
// })

const route = useRoute()

const user = useCurrentUser()
const db = useFirestore()

const userData = useUserData(db, user.value?.uid as string);

const movieId = computed(() => route.params.id)

const { data, pending, error } = await useFetch(`/api/movies/${movieId.value}`)
const movie = toRaw(data?.value)

// getting similar movies
const { data: similar, pending: similarPending, error: similarError } = await useFetch(`/api/movies/similar?id=${movieId.value}`)

const moviesWithPoster = computed(() => {
    const filtered = similar.value.filter((movie: Movie) => movie.poster_path !== null);
    return filtered
});

const isInMovieList = computed(() => {
    return userData?.value?.movies?.some((movie: UserMovie) => movie.id === route.params.id) || false;
});
const isInNextList = computed(() => {
    return userData?.value?.movies?.some((movie: UserMovie) => movie.id === route.params.id && movie.next) || false;
});

const addToMovieList = async () => {
    await addMovie(db, user.value?.uid as string,
        {
            id: route.params.id as string,
            title: movie.title,
            rating: movie.vote_average,
            poster: movie.poster_path,
            seen: false,
            next: false,
            timestamp: new Date()
        });
};

watch(userData, (newVal) => {
    console.log("User data updated:", newVal);
});

const removeFromMovieList = async () => {
    await removeMovie(db, user.value?.uid as string, route.params.id as string)
}

const addToNextList = async () => {
    await updateMovie(db, user.value?.uid as string, route.params.id as string, { next: true });
}

const removeFromNextList = async () => {
    await updateMovie(db, user.value?.uid as string, route.params.id as string, { next: false });
}

// TODO: add directors, producers and music composers
</script>

<template>
    <div v-if="movie && !error">
        <Heading class="block md:hidden">{{ movie.title }}</Heading>
        <div class="flex flex-col md:flex-row items-center gap-8 xl:gap-16 pb-4 text-lg md:text-base">
            <div class="flex flex-col gap-4 md:self-start md:w-[18rem] lg:w-sm md:shrink-0">
                <div class="relative" v-auto-animate>
                    <div v-auto-animate="{ duration: 150 }" v-if="isInMovieList">
                        <UIcon name="i-heroicons-star"
                            class="z-20 text-2xl text-primary absolute -top-1 -right-1 transition scale-150 origin-center cursor-pointer"
                            v-if="!isInNextList" @click.stop="addToNextList" />
                        <UIcon name="i-heroicons-star-20-solid"
                            class="z-20 text-2xl scale-150 text-primary absolute -top-1 -right-1 transition origin-center cursor-pointer"
                            v-if="isInNextList" @click.stop="removeFromNextList" />
                    </div>
                    <img :src="`${BASE_IMAGE_URL}${movie.poster_path}`" :alt="`${movie.title}`"
                        class="w-full max-w-sm  " />
                </div>
                <div class="icon-group flex gap-4 w-full">
                    <UButton v-if="!isInMovieList" icon="i-heroicons-list-bullet-20-solid" color="primary"
                        variant="outline" label="Add to my movies"
                        class="flex gap-2 items-center justify-center text-lg" block @click="addToMovieList" />
                    <UButton icon="i-heroicons-x-circle" color="primary" variant="outline" label="Remove from watchlist"
                        class="flex gap-2 items-center justify-center text-lg" block @click="removeFromMovieList"
                        v-if="isInMovieList" />
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
                <div>Average rating: {{ movie.vote_average.toFixed(1) }}</div>
                <Heading class="pt-4">Actors</Heading>
                <div class="flex flex-wrap gap-x-6 gap-y-4 md:max-lg:gap-x-4">
                    <div v-for="actor in movie.credits.cast.slice(0, 5)" :key="actor.id"
                        class=" flex flex-col items-center text-center shrink-0 w-20 md:max-lg:w-[4.5rem]">
                        <img :src="`${BASE_IMAGE_URL}${actor.profile_path}`" :alt="actor.name"
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

<style scoped></style>
