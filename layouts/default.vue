<script setup>
import { useRoute } from 'vue-router'

const isHomePage = computed(() => {
    const route = useRoute()
    return route.path === '/'
})

</script>

<template>
    <div class="flex flex-col justify-start min-h-screen max-w-screen sm:flex-row-reverse sm:justify-end" v-auto-animate>
        <Header class="sm:hidden pt-8" />
        <main
            class="relative max-h-full flex-grow max-sm:max-w-full max-sm:pb-14 sm:max-w-main"
            :class="{ 'p-0': isHomePage, 'p-8': !isHomePage }">
            <slot />
        </main>
        <NavBar class="nav-sticky-mobile" />
    </div>
</template>
