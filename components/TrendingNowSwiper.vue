        
<script setup>
// import function to register Swiper custom elements
import { register } from 'swiper/element/bundle';
// register Swiper custom elements
register();
</script>

<template>
    <div class="max-w-[500px] w-full max-h-[500px] py-8">
        <swiper-container class="mySwiper" loop="true" effect="coverflow" grab-cursor="true" centered-slides="true"
            slides-per-view="auto" coverflow-effect-rotate="15" coverflow-effect-stretch="0" coverflow-effect-depth="300"
            coverflow-effect-modifier="1" coverflow-effect-slide-shadows="true" navigation="true">
            <swiper-slide>
                <!-- Here comes a separate movie div component ? -->
                <img src=" https://swiperjs.com/demos/images/nature-1.jpg" />
            </swiper-slide>
            <swiper-slide>
                <img src="https://swiperjs.com/demos/images/nature-2.jpg" />
            </swiper-slide>
            <swiper-slide>
                <img src="https://swiperjs.com/demos/images/nature-3.jpg" />
            </swiper-slide>
            <swiper-slide>
                <img src="https://swiperjs.com/demos/images/nature-4.jpg" />
            </swiper-slide>
            <swiper-slide>
                <img src="https://swiperjs.com/demos/images/nature-5.jpg" />
            </swiper-slide>
            <swiper-slide>
                <img src="https://swiperjs.com/demos/images/nature-6.jpg" />
            </swiper-slide>
            <swiper-slide>
                <img src="https://swiperjs.com/demos/images/nature-7.jpg" />
            </swiper-slide>
            <swiper-slide>
                <img src="https://swiperjs.com/demos/images/nature-8.jpg" />
            </swiper-slide>
            <swiper-slide>
                <img src="https://swiperjs.com/demos/images/nature-5.jpg" />
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
</style>