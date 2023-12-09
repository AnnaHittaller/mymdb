<script setup>
const isHomePage = computed(() => {
    const route = useRoute()
    return route.path === '/'
})

</script>

<template>
    <div class="flex flex-col sm:flex-row-reverse justify-start min-h-screen">

        <Header class="sm:hidden pt-8" />
        <main class="flex-grow max-h-full relative" :class="{ 'p-0': isHomePage, 'p-4': !isHomePage }">
            <slot />
        </main>
        <Footer class="" />

    </div>
</template>