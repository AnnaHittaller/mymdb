<script setup>

const el = ref(null)

const isHomePage = computed(() => {
    const route = useRoute()
    return route.path === '/'
})

</script>

<template>
    <div class="flex flex-col sm:flex-row-reverse justify-start min-h-screen max-w-screen">
        <Header class="sm:hidden pt-8" />
        <main class="flex-grow max-h-full relative" :class="{ 'p-0': isHomePage, 'p-4': !isHomePage }">
            <slot />
        </main>
        <Footer class="" ref="el" />
    </div>
</template>

<style scoped>
main {

    @media screen and (max-width: 640px) {
        max-width: 100%;
    }

    @media screen and (min-width: 640px) {
        max-width: calc(100% - 85px - 2rem);
    }

    @media screen and (min-width: 768px) {
        max-width: calc(100% - 96px - 2rem);
    }
}
</style>