<script setup>
import { register } from 'swiper/element/bundle';
register();

// const spaceBetween = 10;
// const onProgress = (e) => {
//   const [swiper, progress] = e.detail;
//   console.log(progress)
// };

const lastSlide = ref(false);

const onSlideChange = (e) => {
  lastSlide.value = e.detail[0].isEnd;
  console.log(e.detail[0])
};
</script>

<template>
  <div class="w-full relative px-4">
    <div
      class="w-full h-full z-10 bg-gradient-to-l from-[#27272a] from-0% to-15%  absolute top-0 left-0 pointer-events-none"
      :class="{ 'hidden': lastSlide }"></div>
    <swiper-container space-between="20" class="movieSlider" centered-slides="false" navigation="true" :loop="false"
      @swiperslidechange="onSlideChange" slides-per-view="auto">
      <swiper-slide v-for="  card   in   10  " :key="card" auto-scroll-offset="1" class="">
        <MovieCard />
      </swiper-slide>
    </swiper-container>
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
</style>