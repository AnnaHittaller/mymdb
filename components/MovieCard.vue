<script setup>
let loading = ref(false)
// const toggleLoad = () => {
//     loading.value = !loading.value
//     console.log(loading.value)
// }
defineProps({
    seen: Boolean,
    rating: Number,
    favorite: Boolean,
    movie: Object
})

const baseImageUrl = "https://image.tmdb.org/t/p/w500"
</script>

<template>
    <NuxtLink :to="`/movie/${movie.id}`">
        <div class="flex flex-col gap-2 w-full justify-start items-start">
            <div class="bg-gray-700 ">
                <img :src="`${baseImageUrl}${movie.poster  || movie.poster_path}`" class="object-cover w-full h-full aspect-[2/3]" />
            </div>
            <div class="flex items-center gap-2">
                <UBadge class="font-bold">Seen</UBadge>
                <UBadge class="font-bold" label="4" color="yellow"></UBadge>
                <UIcon name="i-heroicons-star-20-solid" class="text-lg text-primary" />
            </div>
            <p class="text-left">{{ movie.title }}</p>
        </div>
        <!-- Skeleton loader -->
        <!-- <div v-if="loading" class="flex flex-col gap-2">
            <USkeleton class="min-w-[100px] max-w-[150px] aspect-[2/3] dark:bg-gray-500" :ui="{ rounded: 'rounded-none' }" />
            <div class="flex items-center gap-2">
                <USkeleton class="w-10 h-5 dark:bg-gray-500"></USkeleton>
                <USkeleton class="w-5 h-5  dark:bg-gray-500" :ui="{ rounded: 'rounded-full' }"></USkeleton>
                <USkeleton class="w-5 h-5  dark:bg-gray-500" :ui="{ rounded: 'rounded-full' }"></USkeleton>
            </div>
        </div> -->
        <!-- <button @click="toggleLoad">Load</button> -->
    </NuxtLink>
</template>

<style></style>