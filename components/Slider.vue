        
<script setup>
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Navigation } from 'vue3-carousel'

let isAtEnd = ref(false)
const handleSlideEnd = (data) => {
    // Update the reactive variable to show or hide the gradient div
    console.log(data)
    //isAtEnd.value = isEnd
}

const props = defineProps(
    { movies: Array }
)
const { movies } = toRefs(props)

// const currentSlideObject = (slide, index) => {
//     if (index === currentSlide.value) {
//         movies.value = slide
//     }
// }

const breakpoints = {
    0: {
        itemsToShow: 3,
    },
    640: {
        itemsToShow: 3,
    },
    768: {
        itemsToShow: 4,
    },
    1024: {
        itemsToShow: 6,
    },
    1280: {
        itemsToShow: 8,
    },
    1536: {
        itemsToShow: 10,
    },
}

const baseImageUrl = "https://image.tmdb.org/t/p/original"

</script>

<template>
    <div class="max-w-full px-4 relative">
        <div v-if="!isAtEnd"
            class="w-full h-full z-10 bg-gradient-to-l from-[#27272a] via--[#27272a] from-0% to-20% absolute top-0 left-0 pointer-events-none" />
        <Carousel ref="carousel" :breakpoints="breakpoints" :items-to-scroll="1" :wrap-around="false" :transition="500"
            snapAlign="start" class="bg-transparent movie-carousel" @slide-end="handleSlideEnd">
            <Slide v-for="slide, index in movies" :key="slide"
                class="flex items-center object-cover bg-transparent max-w-full">
                <div class="object-cover h-[100%] hover:shadow-lg cursor-pointer mr-4">
                    <NuxtLink :to="`/movie/${slide.id}`">
                        <img v-if="movies" style="user-select: none" class="pointer-events-none h-[100%] z-[-1]"
                            :src="`${baseImageUrl}${slide.poster_path}`">
                    </NuxtLink>
                </div>
            </Slide>
            <template #addons>
                <Navigation class="nav-arrow" />
            </template>
        </Carousel>
    </div>
</template>

<style scoped>
.nav-arrow .carousel__prev,
.nav-arrow .carousel__next,
.nav-arrow .carousel__prev:hover,
.nav-arrow .carousel__next:hover {
    color: white;

}
</style>