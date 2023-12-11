<script setup>
const route = useRoute()
//console.log(route.params.id)
//const nuxt = useNuxtApp()
//console.log(nuxt)
const movieId = computed(() => route.params.id)
const baseImageUrl = "https://image.tmdb.org/t/p/w500"

const { data: movieData, pending, error } = await useFetch(`/api/movies/${movieId.value}`)
const movie = toRaw(movieData?.value)
console.log(movie)
</script>

<template>
    <Heading>{{ movie?.title }}</Heading>
    <div class="flex flex-col md:flex-row  items-center gap-8 pb-8">
        <div class="">
            <img :src="`${baseImageUrl}${movie.poster_path}`" :alt="`${movie.title}`" class="w-full max-w-sm">
        </div>
        <div class="w-full flex flex-col gap-4">
            <div>

                <span v-for="genre in movie?.genres" class="text-lg font-bold">
                    <div v-if="movie.genres[0] != genre" class="bg-primary h-4 w-[.25rem] inline-block ml-2 mr-1"></div>
                    {{ genre.name }}
                </span>
            </div>
            <h3 class="text-lg">{{ movie.tagline }}</h3>
            <p class="max-w-xl">{{ movie.overview }}</p>
            <Heading class="pb-0">My rating</Heading>
            <p>kfdjhgghdj</p>
            <Heading class="pb-0">Actors</Heading>
            <div>
                <span v-for="actor in movie.credits.cast.slice(0, 4)">{{ actor.name}}, </span>
                <span>{{ movie.credits.cast[4].name }}</span>
            </div>
            <div class="icon-group">
                <!-- Nuxt UI buttons -->
            </div>
        </div>
    </div>
    <Heading>More like this</Heading>
</template> 

<style scoped></style>