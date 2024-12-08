<script setup>
import { useRoute } from 'vue-router'

const isHomePage = computed(() => {
    const route = useRoute()
    return route.path === '/'
})

</script>

<template>
    <div class="flex flex-col sm:flex-row-reverse justify-start min-h-screen max-w-screen" v-auto-animate>
        <Header class="sm:hidden pt-8" />
        <main class="flex-grow max-h-full relative" :class="{ 'p-0': isHomePage, 'p-8': !isHomePage }">
            <slot />
        </main>
        <NavBar class="navbar-sticky-sm" />
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

    .navbar-sticky-sm {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        z-index: 1000;
    }

}
</style>