<script setup>
const route = useRoute()
const colorStore = useUiColorStore()
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
    <div class="flex flex-col items-center">
        <div>

            <img :src="`${baseImageUrl}${movie.poster_path}`" :alt="`${movie.title}`">
        </div>
        <div class="w-full">
            <span v-for="genre in movie?.genres" class="text-lg font-bold">
                <div v-if="movie.genres[0] != genre" class="bg-primary h-4 w-[.25rem] inline-block"></div>
                {{ genre.name }}
            </span>
            <p>{{ movie.overview }}</p>
        </div>
    </div>
    <Heading>More like this</Heading>
</template> 