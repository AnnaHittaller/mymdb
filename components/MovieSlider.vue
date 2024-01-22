<script setup>
import { register } from 'swiper/element/bundle';
register();

// const spaceBetween = 10;
// const onProgress = (e) => {
//   const [swiper, progress] = e.detail;
//   console.log(progress)
// };
const props = defineProps(
  { movies: Array }
)
const { movies } = toRefs(props)

const lastSlide = ref(false);
const firstSlide = ref(true)

const onSlideChange = (e) => {
  lastSlide.value = e.detail[0].isEnd;
  firstSlide.value = e.detail[0].isBeginning;
  //console.log(e.detail[0])
};

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
  1024: {
    slidesPerView: 6,
  },
  1280: {
    slidesPerView: 8,
  },
  1536: {
    slidesPerView: 10,
  },
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
  <div class=" relative px-4">
    <!-- <div
      class="w-full h-full z-10 bg-gradient-to-l from-[#27272a] from-0% to-15%  absolute top-0 left-0 pointer-events-none"
      :class="{ 'hidden': lastSlide }"></div> -->
    <swiper-container space-between="15" class="movieSlider z-0" centered-slides="false" navigation="true" :loop="false"
      :style="hoverStyle" @swiperslidechange="onSlideChange" :breakpoints="breakpoints">
      <swiper-slide v-for="  movie, index   in   movies  " :key="index" auto-scroll-offset="1" class="">

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


  /* Center slide text vertically */
  display: flex;
  justify-content: center;
  align-items: center;
}


swiper-container.movieSlider::part(button-next),
swiper-container.movieSlider::part(button-prev) {
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
  position: absolute;
  top:30%;


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
</style>