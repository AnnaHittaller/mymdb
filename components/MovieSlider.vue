<script setup>
import { register } from 'swiper/element/bundle';
register();

const spaceBetween = 10;
const onProgress = (e) => {
  const [swiper, progress] = e.detail;
  console.log(progress)
};

const onSlideChange = (e) => {
  console.log('slide changed')
}
</script>

<template>
  <div>
    <swiper-container space-between="10" class="movieSlider">
      <swiper-slide>
        <MovieCard />
      </swiper-slide>
      <swiper-slide>
        <MovieCard />
      </swiper-slide>
      <swiper-slide>
        <MovieCard />
      </swiper-slide>
      <swiper-slide>
        <MovieCard />
      </swiper-slide>
      <swiper-slide>
        <MovieCard />
      </swiper-slide>
    </swiper-container>
  </div>
</template>

<style scoped>
.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #fff;
  max-width: 200px;

  /* Center slide text vertically */
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>