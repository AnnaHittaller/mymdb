<script setup>
const { currentUserPromise } = useFirebaseAuth()
const { getUser, addMovie, removeMovie, updateMovie } = useFirestore()

const route = useRoute()
const userData = await currentUserPromise()
const user = await getUser(userData.uid)
const userMoviesStore = useUserMoviesStore();
await userMoviesStore.fetchUserMovies();
//const nuxt = useNuxtApp()
//console.log(nuxt)
const movieId = computed(() => route.params.id)
const baseImageUrl = "https://image.tmdb.org/t/p/w500"

const { data, pending, error } = await useFetch(`/api/movies/${movieId.value}`)
const movie = toRaw(data?.value)

const { data: similar, pending: similarPending, error: similarError } = await useFetch(`/api/movies/similar?id=${movieId.value}`)
//const similarMovies = toRaw(similar.value.results)
//console.log("SIMILAR", toRaw(similar.value))
//console.log(similar);

const moviesWithPoster = computed(() => {
    //console.log(similarMovies)
    const filtered = similar.value.filter(movie => movie.poster !== null);
    //console.log(filtered)
    return filtered
});

// const isInMovieList = computed(() => {
//     return user.movies.some(movie => movie.id === route.params.id)
// })

// const isInNextList = computed(() => {
//     return user.movies.some(movie => movie.id === route.params.id && movie.next)
// })

const isInMovieList = computed(() => userMoviesStore.movies.some(movie => movie.id === route.params.id));
const isInNextList = computed(() => userMoviesStore.movies.some(movie => movie.id === route.params.id && movie.next));

// code for rating badges - for later development

// const ratingBadge = reactive({
//     red: 'outline',
//     orange: 'outline',
//     amber: 'outline',
//     lime: 'outline',
//     green: 'outline'
// })

// let selectedRating = null;

// const toggleBadge = (color, rating) => {
//     if (selectedRating && selectedRating.color === color) {
//         // If the same badge is clicked again, deselect it
//         for (const key in ratingBadge) {
//             ratingBadge[key] = 'outline';
//         }
//         selectedRating = null; // Reset selected rating
//     } else {
//         for (const key in ratingBadge) {
//             ratingBadge[key] = key === color ? 'solid' : 'outline';
//         }
//         selectedRating = { color, rating };
//     }
// }

const movieToAdd = {
    id: route.params.id,
    title: movie.title,
    rating: movie.vote_average,
    poster: movie.poster_path,
    seen: false,
    next: false
}

const addToMovieList = async () => {
    await addMovie(userData.uid, movieToAdd);
};

const removeFromMovieList = async () => {
    await removeMovie(userData.uid, route.params.id)
}

const addToNextList = async () => {
    await updateMovie(userData.uid, route.params.id, { next: true });
}

const removeFromNextList = async () => {
    await updateMovie(userData.uid, route.params.id, { next: false });
}

</script>

<template>
    <div v-if="movie">
        <Heading>{{ movie?.title }}</Heading>
        <div class="flex flex-col md:flex-row items-center gap-8 xl:gap-16 pb-4">
            <div class="flex flex-col gap-4 items-center">
                <div class="relative" v-auto-animate>
                    <div v-auto-animate="{duration: 150}" v-if="isInMovieList" >
                        <UIcon name="i-heroicons-star"
                            class="z-20 text-2xl text-primary absolute -top-1 -right-1 transition scale-150 origin-center cursor-pointer"
                            v-if="!isInNextList" @click.stop="addToNextList" />
                        <UIcon name="i-heroicons-star-20-solid"
                            class="z-20 text-2xl scale-150 text-primary absolute -top-1 -right-1 transition origin-center cursor-pointer"
                            v-if="isInNextList" @click.stop="removeFromNextList" />
                    </div>
                    <img :src="`${baseImageUrl}${movie.poster_path}`" :alt="`${movie.title}`"
                        class="w-full max-w-sm lg:max-w-xl ">
                </div>
                <div class="icon-group flex gap-4 w-full">
                    <UButton icon="i-heroicons-list-bullet-20-solid" color="primary" variant="outline"
                        label="Add to my movies" class="flex gap-2 items-center justify-center text-lg" block
                        @click="addToMovieList" v-if="!isInMovieList" />
                    <UButton icon="i-heroicons-x-circle" color="primary" variant="outline" label="Remove from watchlist"
                        class="flex gap-2 items-center justify-center text-lg" block @click="removeFromMovieList"
                        v-if="isInMovieList" />
                    <!-- <UButton icon="i-heroicons-check-circle" color="primary" variant="outline" label="Seen"
                        class="flex flex-col gap-1 w-24" /> -->
                </div>
            </div>
            <div class="w-full flex flex-col gap-4">
                <div>
                    <span v-for="genre in movie?.genres" class="text-lg font-bold">
                        <div v-if="movie.genres[0] != genre" class="bg-primary h-4 w-[.25rem] inline-block ml-2 mr-1"></div>
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
                <div>
                    <span v-for="actor in movie.credits.cast.slice(0, 4)">{{ actor.name }}, </span>
                    <span>{{ movie.credits.cast[4].name }}</span>
                </div>
                <!-- Badge group - for later development -->

                <!-- <Heading class="pt-4">MyMDb rating</Heading>
                <div class="flex gap-2">
                    <UBadge color="red" :variant="ratingBadge.red" @click="toggleBadge('red', 1)" label="1" size="md"
                        class="cursor-pointer" />
                    <UBadge color="orange" :variant="ratingBadge.orange" @click="toggleBadge('orange', 2)" label="2"
                        size="md" class="cursor-pointer" />
                    <UBadge color="amber" :variant="ratingBadge.amber" @click="toggleBadge('amber', 3)" label="3" size="md"
                        class="cursor-pointer" />
                    <UBadge color="lime" :variant="ratingBadge.lime" @click="toggleBadge('lime', 4)" label="4" size="md"
                        class="cursor-pointer" />
                    <UBadge color="green" :variant="ratingBadge.green" @click="toggleBadge('green', 5)" label="5" size="md"
                        class="cursor-pointer" />
                </div> -->
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

