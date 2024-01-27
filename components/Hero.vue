<script setup>
import { register } from 'swiper/element/bundle';
register();
 
const trendingMoviesStore = useTrendingMoviesStore();
const { computedStyle } = useComputedStyle()
//const { data: trending, pending, error } = await useFetch('/api/movies/trending')

const isLoading = computed(() => !trendingMoviesStore.isLoaded);
const movies = computed(() => trendingMoviesStore.trendingMovies);
//console.log(movies.value)

// onMounted(async () => {
//     console.log(trendingMoviesStore.trendingMovies, trendingMoviesStore.trendingMovies.length)
//     if (trendingMoviesStore.trendingMovies.length === 0) {
//         try {
//             loading.value = true
//             await trendingMoviesStore.fetchTrendingMovies();
//             console.log("Trending movies fetched had no value", useTrendingMoviesStore.trendingMovies, trendingMoviesStore.trendingMovies.length);
//         } catch (error) {
//             console.error("Error fetching trending movies:", error);
//         } finally {
//             loading.value = false
//         }
//     }
//     trendingMovies.value = useTrendingMoviesStore.trendingMovies
// });


const baseImageUrl = "https://image.tmdb.org/t/p/original"



let hrefValue = ref(null)
let backdropImage = ref(null)
let imageAlt = ref(null)

const onSlideChange = (e) => {
    //console.log("sore tre m", trendingMoviesStore.trendingMovies)
    const [swiper, progress] = e.detail;
    //console.log(e.detail)
    const activeSlide = swiper.slides[swiper.activeIndex];
    //console.log(activeSlide)

    const href = activeSlide.querySelector('a').getAttribute('href');
    hrefValue.value = href;
    //console.log(hrefValue.value, backdropImage.value, imageAlt.value)

    const movieIdFromHref = hrefValue.value.match(/\d+$/)[0];
    //console.log(movieIdFromHref)
    //console.log(movies)

//    const backdropMovie = movies.value.find(movie => movie.id === Number(movieIdFromHref));
//    console.log(backdropMovie)
    // Check if movies.value is an array before using find function
     // Access trendingMovies directly from the store
    const trendingMovies = useTrendingMoviesStore().trendingMovies;
    //console.log(typeof(trendingMovies.value), trendingMovies.value)
    const movieArray = Array.from(trendingMovies.value); // Convert proxy-wrapped array to a regular array
    const backdropMovie = movieArray.find(movie => movie.id === Number(movieIdFromHref));
    //const backdropMovie = trendingMovies.find(movie => movie.id === Number(movieIdFromHref));

    if (backdropMovie) {
        backdropImage.value = backdropMovie.backdrop;
        imageAlt.value = backdropMovie.title;
    } else {
        console.error('Movie not found with ID:', movieIdFromHref);
    }

    // if (backdropMovie) {
    //     backdropImage.value = backdropMovie.backdrop;
    // }

    // imageAlt.value = backdropMovie.title

    //https://www.youtube.com/watch?v= +key attribute from videos API
}


</script>

<template>
    <div>
        <!-- <p>{{ toRaw(movies.value)}}</p> -->
        <div v-if="!isLoading"
            class="lg:bg-gradient-to-r from-[#27272a] via-[#27272a] from-[400px] to-[600px] 2xl:to-[900px] 3xl:from-[600px] 3xl:to-[800px] w-full h-full pb-8 mb-8 bg-contain bg-no-repeat bg-right lg:relative">
            <img v-if="movies && movies.value.length" :src="`${baseImageUrl}${backdropImage}`" :alt="`${imageAlt}`"
                class="max-h-[500px] 2xl:max-h-[600px] ml-auto max-lg:hidden lg:relative lg:-z-10 ">
            <USkeleton v-if="isLoading"
                class="h-full w-full max-h-[500px] 2xl:max-h-[600px] ml-auto max-lg:hidden lg:relative lg:-z-10  " />
            <Heading class="pl-4 sm:pt-4 lg:absolute lg:top-0 z-20">Now trending</Heading>
            <div v-if="movies && movies.value.length > 0"
                class="max-w-[500px] sm:max-w-[700px] 3xl:max-w-[850px] w-full max-h-[500px] px-4 max-lg:mx-auto z-0  lg:absolute lg:top-[50%] lg:translate-y-[-50%]">
                <swiper-container class="mySwiper max-w-full h-full" loop="true" effect="coverflow" grab-cursor="false"
                    centered-slides="true" pagination="false" slides-per-view="auto" coverflow-effect-rotate="15"
                    coverflow-effect-stretch="0" coverflow-effect-depth="300" coverflow-effect-modifier="1"
                    coverflow-effect-slide-shadows="true" navigation="true" autoplay-delay="5000" pauseOnMouseEnter="true"
                    @swiperslidechange="onSlideChange" :style="computedStyle">
                    <swiper-slide v-for="movie in movies.value" :key="movie.id">
                        <NuxtLink :to="`/movie/${movie.id}`">
                            <img :src="`${baseImageUrl}${movie.poster}`" class="relative" />
                            <p
                                class="carousel-title text-lg text-center absolute bottom-2 left-0 right-0 bg-gray-800 bg-opacity-70 duration-200">
                                {{ movie.title }}</p>
                        </NuxtLink>
                    </swiper-slide>
                </swiper-container>
            </div>
            <!-- <div v-if="error"> {{ error }}</div> -->
        </div>
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

swiper-container::part(pagination) {
    position: absolute;
    bottom: 0;
}

.carousel-title {
    opacity: 0;

}

swiper-slide:hover .carousel-title {
    opacity: 1;
}
</style>