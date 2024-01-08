
<script setup>
//this has to be changed to movie lists saved to the profile
const { data: trending, pending, error } = await useFetch('/api/movies/trending')
const trendingMovies = toRaw(trending?.value.splice(0, 5))
</script>

<template>
    <div>
        <Hero />
        <div class="flex justify-between items-center pr-4 pb-8">
            <Heading class="pl-4">My movies</Heading>
            <UButton to="/profile/my-movies" label="View All" />
        </div>
        <Slider v-if="trendingMovies" :movies="trendingMovies" class="overflow-hidden" />
        <div v-if="error">Error while retrieving your movie list.</div>
        <div class="flex justify-between items-center pr-4 pb-8 pt-4">
            <Heading class="pl-4 pt-8">Watch next</Heading>
            <UButton to="/profile/watch-next" label="View All" />
        </div>
    </div>
</template> 

<style scoped></style>

<!-- TODO
Komarnicki movie tut (movie genres, details from api)
swiper slider for movie list + favs: something that it actually does work correctly and can be sized correctly
movie-grid class make unscoped
create a composable from hoverstyle / glow-color return and also baseImageUrl
make slider bulletpoints clickable
keep-alive - to not load trending movies every time
create skeleton for swiper sliders and hero image
adding toast for movie page: rating and list modifications
disable buttons - form validation

including series too
-->