<script setup>
import { register } from 'swiper/element/bundle';
register();
const { computedStyle } = useComputedStyle()

const props = defineProps(
  { movies: Array }
)
const { movies } = toRefs(props)

const currentBreakpoint = ref(900);

const breakpoints = {
  0: {
    slidesPerView: 2,
  },
  400: {
    slidesPerView: 3,
  },
  700: {
    slidesPerView: 4,
  },
  900: {
    slidesPerView: 5,
  },
  1100: {
    slidesPerView: 6,
  },
  1280: {
    slidesPerView: 7,
  },
  1536: {
    slidesPerView: 9,
  },
  1920: {
    slidesPerView: 11,
  },
}

const shouldDisplayNavigation = computed(() => {
  const slidesPerView = breakpoints[currentBreakpoint.value]?.slidesPerView;
  return movies.value.length > slidesPerView;
});

watch([movies, currentBreakpoint], () => {
  shouldDisplayNavigation.value;
});

onMounted(() => {
  window.addEventListener('resize', handleResize);
  currentBreakpoint.value = getInitialBreakpoint(); 
  shouldDisplayNavigation.value;
});

const handleResize = () => {
  currentBreakpoint.value = getInitialBreakpoint();
};

function getInitialBreakpoint() {
  const windowWidth = window.innerWidth;
  return Object.keys(breakpoints)
    .sort((a, b) => b - a) 
    .find(breakpoint => windowWidth >= parseInt(breakpoint)) || 900; // Default to 900 if no matching breakpoint found
}


</script> 

<template>
  <div class="relative px-4">
    <!-- <div
      class="w-full h-full z-10 bg-gradient-to-l from-[#27272a] from-0% to-15%  absolute top-0 left-0 pointer-events-none"
      :class="{ 'hidden': lastSlide }"></div> -->
    <swiper-container space-between="10" class="movieSlider z-0" centered-slides="false"
      :navigation="shouldDisplayNavigation" :loop="false" :style="computedStyle" @swiperslidechange="onSlideChange"
      :breakpoints="breakpoints">
      <swiper-slide v-for="movie in movies" :key="movie.id" auto-scroll-offset="1" class="" v-auto-animate>

        <MovieCard :movie="movie" class="" />

      </swiper-slide>
    </swiper-container>
    <!-- <div
      class="w-full h-full z-10 bg-gradient-to-r from-[#27272a] from-0% to-15%  absolute top-0 left-0 pointer-events-none"
      :class="{ 'hidden': firstSlide }"></div> -->
  </div>
</template>

<style scoped>
swiper-container {
  width: 100%;
  height: 100%;
}

swiper-slide {
  text-align: center;
  font-size: 18px;
  max-width: max-content;

  display: flex;
  justify-content: center;
  align-items: center;
}


swiper-container.movieSlider::part(button-next),
swiper-container.movieSlider::part(button-prev) {
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
  position: absolute;
  top: 40%;
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
</style>