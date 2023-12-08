<script setup>
import { register } from 'swiper/element/bundle';
register();

const { data: trending, pending, error } = await useFetch('/api/movies/trending')

const trendingMovies = toRaw(trending.value.results.splice(0, 10))
console.log("DATA tre m:", trendingMovies)
//console.log(toRaw(trending.value.results))
const baseImageUrl = "https://image.tmdb.org/t/p/original"


let hrefValue = ref(null)
let backdropImage = ref(null)

const onSlideChange = (e) => {
    const [swiper, progress] = e.detail;
    const activeSlide = swiper.slides[swiper.activeIndex];

    const href = activeSlide.querySelector('a').getAttribute('href');
    hrefValue.value = href;

    const movieIdFromHref = hrefValue.value.match(/\d+$/)[0];
    const backdropMovie = trendingMovies.find(movie => movie.id === Number(movieIdFromHref));

    if (backdropMovie) {
        //console.log(backdropMovie.backdrop_path, Number(movieIdFromHref));
        backdropImage.value = backdropMovie.backdrop_path;
    }

    //console.log('Href attribute:', hrefValue.value);
    //https://www.youtube.com/watch?v= +key attribute from videos API
}

</script>

<template>
    <div class="bg-gradient-to-r from-[#27272a] from-40% md:from-30% to-80% md:to-70% w-full h-full">
        <img :src="`${baseImageUrl}${backdropImage}`" alt="" class="max-h-[500px] ml-auto max-lg:hidden  ">
        <Heading >Now trending</Heading>
        <!-- <div class="hero max-sm:hidden relative">  -->
            <!-- <img :src="`${baseImageUrl}${backdropImage}`" alt="" class="max-h-[500px] ml-auto"> -->
            <!-- <div class="bg-gradient-to-r from-[#27272a] from-40% md:from-30% to-80% md:to-70% w-full h-full absolute top-0 bottom-0 z-10"></div> -->
            
        <!-- </div> -->

        <div class="max-w-[500px] sm:max-w-[700px] w-full max-h-[500px] py-8  max-sm:mx-auto lg:absolute sm:top-0 z-20">
            <swiper-container class="mySwiper w-full " loop="true" effect="coverflow" grab-cursor="true"
                centered-slides="true" slides-per-view="auto" coverflow-effect-rotate="15" coverflow-effect-stretch="0"
                coverflow-effect-depth="300" coverflow-effect-modifier="1" coverflow-effect-slide-shadows="true"
                navigation="true" @swiperslidechange="onSlideChange">
                <swiper-slide v-for="movie in trendingMovies" :key="movie.id">
                    <NuxtLink :to="`/movie/${movie.id}`">
                        <img :src="`${baseImageUrl}${movie.poster_path}`" />
                    </NuxtLink>
                </swiper-slide>
            </swiper-container>
        </div>
        <!-- <div v-if="trending">DataNEW: {{ trending }}</div> -->
        <!-- <div v-if="error">error: {{ error }}</div>
        <div v-else-if="pending">Loading</div> -->
    </div>
</template>

<style scoped>
swiper-container {
    height: 100%;
}

swiper-slide {
    background-position: center;
    background-size: cover;
    max-width: 200px;
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
    color: white;
    background-color: #27272a;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: .75rem;
    height: 2rem;
    width: 2rem;

    @media screen and (max-width: 640px) {
        display: none;
    }
}
</style>