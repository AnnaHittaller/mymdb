<script setup>
import TrendingNowSwiper from '~/components/TrendingNowSwiper.vue';

const colorStore = useUiColorStore()



</script>

<template>
    <div>
        <Heading>Now trending</Heading>
        <TrendingNowSwiper/>
        <Heading>My movies</Heading>
        <Heading>Favorites</Heading>
    </div>
</template> 

<!-- TODO
data fetching tut with tmdb API
Komarnicki movie tut
swiper slider for movie list + favs

-->