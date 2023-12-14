<script setup>
import { register } from 'swiper/element/bundle';
register();

const { data: trending, pending, error } = await useFetch('/api/movies/trending')

const trendingMovies = toRaw(trending?.value.results.splice(0, 10))
//console.log("DATA tre m:", trendingMovies)
//console.log(toRaw(trending.value.results))
const baseImageUrl = "https://image.tmdb.org/t/p/original"


let hrefValue = ref(null)
let backdropImage = ref(null)
let imageAlt = ref(null)

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

    imageAlt.value = backdropMovie.title

    //console.log('Href attribute:', hrefValue.value);
    //https://www.youtube.com/watch?v= +key attribute from videos API
}

const colorStore = useUiColorStore()

const hoverStyle = computed(() => {
    if (colorStore.uiColor) {
        let colorValue = '';
        switch (colorStore.uiColor) {
            case 'mandy':
                colorValue = "#ea546c";
                break;
            case 'dusk':
                colorValue = "#839dd1";
                break;
            case 'emerald':
                colorValue = "#10b981";
                break;
            default:
                colorValue = '';
        }
        return {
            '--glow-color': colorValue,
        };
    }
    return {}; // Return an empty object if the value is not yet available
});

</script>

<template>
    <div
        class="lg:bg-gradient-to-r from-[#27272a] via-[#27272a] from-[400px] to-[600px] 2xl:to-[900px] 3xl:from-[600px] 3xl:to-[800px] w-full h-full pb-8 mb-8 bg-contain bg-no-repeat bg-right lg:relative">
        <img v-if="trendingMovies" :src="`${baseImageUrl}${backdropImage}`" :alt="`${imageAlt}`"
            class="max-h-[500px] 2xl:max-h-[600px] ml-auto max-lg:hidden lg:relative lg:-z-10 ">
        <!-- <USkeleton v-if="pending" class="max-h-[500px] 2xl:max-h-[600px] h-full max-lg:hidden lg:relative lg:-z-10 " /> -->
        <Heading class="pl-4 sm:pt-4 z-20 lg:absolute lg:top-0">Now trending</Heading>
        <div v-if="trendingMovies"
            class="max-w-[500px] sm:max-w-[700px] 3xl:max-w-[850px] w-full max-h-[500px] px-4 max-lg:mx-auto z-20  lg:absolute lg:top-[50%] lg:translate-y-[-50%]">
            <swiper-container class="mySwiper max-w-full h-full" loop="true" effect="coverflow" grab-cursor="false"
                centered-slides="true" pagination="true" slides-per-view="auto" coverflow-effect-rotate="15"
                coverflow-effect-stretch="0" coverflow-effect-depth="300" coverflow-effect-modifier="1"
                coverflow-effect-slide-shadows="true" navigation="true" autoplay-delay="5000" pauseOnMouseEnter="true"
                @swiperslidechange="onSlideChange" :style="hoverStyle" :pagination="{
                    clickable: true,
                }">
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

swiper-container::part(wrapper) {
    padding-bottom: 2rem;
    padding-left: 2rem;
    padding-right: 2rem;
}

swiper-slide {
    background-position: center;
    background-size: cover;
    max-width: 200px;

    @media screen and (max-width: 460px) {
        max-width: 150px;
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
    background-color: var(--glow-color);
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
}

swiper-container::part(button-prev) {
    background-image: url("https://api.iconify.design/heroicons:arrow-left-circle-20-solid.svg?color=%233d3d3d");
}

swiper-container::part(bullet-active),
swiper-container::part(bullet) {
    background-color: var(--glow-color);
}

swiper-container::part(pagination) {
    position: absolute;
    bottom: 0;
}
</style>