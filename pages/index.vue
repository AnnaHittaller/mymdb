
<script setup>
const { data: trending, pending, error } = await useLazyFetch('/api/movies/trending')

const trendingMovies = toRaw(trending?.value?.results.splice(0, 10))
</script>

<template>
    <div>
        <Hero />
        <div class="flex justify-between items-center pr-4 pb-8">
            <Heading class="pl-4">My movies</Heading>
            <UButton to="/profile/my-movies" label="View All" />
        </div>
        <Slider v-if="trendingMovies" :movies="trendingMovies" />
        <div class="flex justify-between items-center pr-4 pb-8 pt-4">
            <Heading class="pl-4 pt-8">Watch next</Heading>
            <UButton to="/profile/watch-next" label="View All" />
        </div>
    </div>
</template> 

<style scoped></style>

<!-- TODO
Komarnicki movie tut
swiper slider for movie list + favs
movie-grid class make unscoped
create a composable from hoverstyle / glow-color return and also baseImageUrl
make slider bulletpoints clickable
keep-alive - to not load trending movies every time
create skeleton for swiper sliders and hero image
adding toast for movie page: rating and list modifications
disable buttons - form validation

including series too
-->