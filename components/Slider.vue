        
<script setup>
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Navigation } from 'vue3-carousel'
let currentSlide = ref(0)

const props = defineProps(
    { movies: Array }
)
const { movies } = toRefs(props)

const currentSlideObject = (slide, index) => {
    if (index === currentSlide.value) {
        movies.value = slide
    }
}

const baseImageUrl = "https://image.tmdb.org/t/p/original"
</script>

<template>
    <div class="max-w-full px-4 ">
        <Carousel ref="carousel" v-model="currentSlide" :items-to-show="5" :items-to-scroll="1" :wrap-around="false"
            :transition="500" snapAlign="start" class="bg-transparent">
            <Slide v-for="slide, index in movies" :key="slide"
                class="flex items-center object-cover bg-transparent max-w-full">
                <div class="object-cover h-[100%] hover:brightness-125 cursor-pointer mr-4">
                    <img v-if="movies" style="user-select: none" class="pointer-events-none h-[100%] z-[-1]"
                        :src="`${baseImageUrl}${slide.poster_path}`">
                </div>
            </Slide>
        </Carousel>
    </div>
</template>

<style scoped>
.carousel__prev,
.carousel__next,
.carousel__prev:hover,
.carousel__next:hover {
    color: white;
}
</style>