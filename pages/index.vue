
<script setup>
const { data: trending, pending, error } = await useLazyFetch('/api/movies/trending')

const trendingMovies = toRaw(trending?.value?.results.splice(0, 10))
</script>

<template>
    <div>
        <Hero />
        <Heading class="pl-4">My movies</Heading>
       
        <Slider v-if="trendingMovies" :movies="trendingMovies"/>
        
        <Heading class="pl-4 pt-8">Favorites</Heading>
    </div>
</template> 

<style scoped></style>

<!-- TODO
Komarnicki movie tut
swiper slider for movie list + favs
create a composable from hoverstyle / glow-color return and also baseImageUrl
make slider bulletpoints clickable
create skeleton for swiper sliders and hero image
adding toast for movie page: rating and list modifications

including series too
-->