<script setup>
const route = useRoute()
console.log(route.params.id)
const nuxt = useNuxtApp()
console.log(nuxt)
</script>

<template>
    <div>
        Movie detail page, id: {{ $route.params.id }}
    </div>
</template>