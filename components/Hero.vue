<script setup>
import { register } from 'swiper/element/bundle';

register();

const config = useRuntimeConfig();
const trendingMoviesStore = useTrendingMoviesStore();

const baseImageUrl = config.public.apiBaseImageUrl

onMounted(() => {
    trendingMoviesStore.fetchTrendingMovies()
})

let activeSlideHref = ref(null)
let backdropImage = ref(null)
let imageAltText = ref(null)

const onSlideChange = (e) => {
    const [swiper] = e.detail;
    const activeSlide = swiper.slides[swiper.activeIndex];

    const href = activeSlide.querySelector('a').getAttribute('href');
    activeSlideHref.value = href;

    const movieIdFromHref = activeSlideHref.value.match(/\d+$/)[0];

    // Find the movie based on the ID and convert proxy-wrapped array to a regular array
    const backdropMovie = Array.from(trendingMoviesStore.trendingMovies).find(
        (movie) => movie.id === Number(movieIdFromHref)
    );

    if (backdropMovie) {
        backdropImage.value = backdropMovie.backdrop;
        imageAltText.value = backdropMovie.title;
    } else {
        console.error('Movie not found with ID:', movieIdFromHref);
    }

    //https://www.youtube.com/watch?v= +key attribute from videos API
};

</script>

<template>

    <div>
        <!-- skeleton loader -->
        <div
            class="lg:bg-gradient-to-r from-[#27272a] from-[150px] to-[800px] w-full h-full pb-8 mb-8 lg:relative bg-no-repeat ">
            <!-- skeleton loader for backdrop image -->
            <USkeleton v-if="!trendingMoviesStore.isLoaded"
                class="h-[500px] 2xl:h-[600px] 3xl:h-[700px] w-full object-cover max-lg:hidden lg:relative lg:-z-10 bg-gradient-to-r from-gray-400  to-[800px]" />

            <img v-if="backdropImage" :src="`${baseImageUrl}${backdropImage}`" :alt="imageAltText"
                class="max-h-[500px] 2xl:max-h-[600px] 3xl:max-h-[700px] w-full object-cover max-lg:hidden lg:relative lg:-z-10 ">
            <Heading class="pl-8 sm:pt-4 lg:absolute lg:top-4 z-20">Now trending</Heading>

            <div v-if="trendingMoviesStore.trendingMovies.length > 0"
                class=" max-w-[100%] lg:max-w-[500px] w-full max-h-[500px] 3xl:max-h-[600px] px-8 max-lg:mx-auto z-0 lg:absolute lg:top-[50%] lg:translate-y-[-50%]">
                <swiper-container class="mySwiper w-full h-full" loop="true" effect="coverflow" grab-cursor="false"
                    centered-slides="true" pagination="false" slides-per-view="auto" coverflow-effect-rotate="10"
                    coverflow-effect-stretch="60" coverflow-effect-depth="300" coverflow-effect-modifier="1"
                    coverflow-effect-slide-shadows="true" navigation="true" autoplay-delay="8000"
                    autoplay-disable-on-interaction="false" pause-on-mouse-enter="true"
                    @swiperslidechange="onSlideChange">
                    <swiper-slide v-for="movie in trendingMoviesStore.trendingMovies" :key="movie.id">
                        <NuxtLink :to="`/movie/${movie.id}`">
                            <img :src="`${baseImageUrl}${movie.poster}`" class="relative" />
                            <p
                                class="carousel-title text-lg text-center absolute bottom-2 left-0 right-0 bg-gray-800 bg-opacity-70 duration-200">
                                {{ movie.title }}</p>
                        </NuxtLink>
                    </swiper-slide>
                </swiper-container>
            </div>
        </div>
    </div>
</template>

<style scoped>
swiper-container {
    height: 100%;
}

swiper-container::part(wrapper) {
    padding-bottom: 2rem;
    padding-top: 2rem;
}

swiper-slide {
    background-position: center;
    background-size: cover;
    width: 200px;

    @media screen and (max-width: 460px) {
        width: 150px;
    }

    @media screen and (min-width: 1536px) {
        width: 250px;
    }

    @media screen and (min-width: 1800px) {
        width: 300px;
    }
}

swiper-slide img {
    display: block;
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    /* -webkit-box-reflect: below 1px linear-gradient(transparent, transparent, #0002, #0004); */
}


swiper-container::part(button-next),
swiper-container::part(button-prev) {
    color: transparent;
    background-color: var(--computed-style);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: .75rem;
    height: 1rem;
    width: 1rem;
    background-repeat: no-repeat;
    background-size: 100% auto;
    background-position: center;

    @media screen and (max-width: 640px) {
        display: none;
    }
}

swiper-container::part(button-next) {
    background-image: url("https://api.iconify.design/heroicons:arrow-right-circle-20-solid.svg?color=%233d3d3d");
    transition: all .2s ease-in;
}

swiper-container::part(button-prev) {
    background-image: url("https://api.iconify.design/heroicons:arrow-left-circle-20-solid.svg?color=%233d3d3d");
    transition: all .2s ease-in;
}

swiper-container::part(button-prev):hover,
swiper-container::part(button-next):hover {
    scale: 1.1;
}

swiper-container::part(bullet-active),
swiper-container::part(bullet) {
    background-color: var(--computed-style);
}

.carousel-title {
    opacity: 0;
}

swiper-slide:hover .carousel-title {
    opacity: 1;
}
</style>