<script setup>
import { useWindowSize } from '@vueuse/core'

const { width, height } = useWindowSize()

const isHomePage = computed(() => {
    const route = useRoute()
    return route.path === '/'
}) 

const routePath = computed(() => {
    const route = useRoute()
    return route.path
})

const lastScrollTop = ref(0);
const scrollingDown = ref(false);
const footerHidden = ref(true);
let scrollTimeout;
 
if (width.value >= 640) {
    footerHidden.value = false
}

const handleScroll = () => {
    clearTimeout(scrollTimeout);
    const st = window.scrollY || document.documentElement.scrollTop;
    scrollingDown.value = st > lastScrollTop.value;
    lastScrollTop.value = st <= 0 ? 0 : st;

    // Show/hide footer based on scrolling direction
    if (width.value <= 639) {
        footerHidden.value = true
        if (scrollingDown.value && footerHidden.value) {
            footerHidden.value = false;
        } else if (!scrollingDown.value && !footerHidden.value) {
            footerHidden.value = true;
        }
    } else {
        footerHidden.value = false; // Ensure footer is always visible on larger screens
    }

    // Set timeout to hide footer on mobile after 3 seconds of no scrolling and when not at the bottom of the page
    const scrollBottom = height.value + window.scrollY >= document.body.offsetHeight;
    if (!scrollBottom) {
        startScrollTimeout()
    }
};


onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});


watch([width, height, routePath, footerHidden], () => {
    if (width.value >= 640 || height.value >= document.body.offsetHeight) {
        footerHidden.value = false
    }
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});

const clearScrollTimeout = () => {
    clearTimeout(scrollTimeout);
};

const startScrollTimeout = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (width.value <= 639) {
            footerHidden.value = true;
        }
    }, 3000);
};

</script>

<template>
    <div class="flex flex-col sm:flex-row-reverse justify-start min-h-screen max-w-screen" v-auto-animate>
        <Header class="sm:hidden pt-8" />
        <main class="flex-grow max-h-full relative" :class="{ 'p-0': isHomePage, 'p-4': !isHomePage }">
            <slot />
        </main>
        <Footer v-if="!footerHidden" class="footer-sticky-sm" @mouseenter="clearScrollTimeout"
            @mouseleave="startScrollTimeout" />
    </div>
</template>

<style scoped>
main {

    @media screen and (max-width: 639px) {
        max-width: 100%;
        padding-bottom: 56px;
    }

    @media screen and (min-width: 640px) {
        max-width: calc(100% - 96px - 2rem);
    }

}

@media screen and (max-width: 639px) {

    .footer-sticky-sm {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        z-index: 1000;
    }

}
</style>