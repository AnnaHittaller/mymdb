<script setup>
let loading = ref(false)
// const toggleLoad = () => {
//     loading.value = !loading.value
//     console.log(loading.value)
// }
defineProps({
    seen: Boolean,
    rating: Number,
    favorite: Boolean
})

 
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="aspect-[2/3] bg-gray-500 min-w-[100px] max-w-[150px] ">
        </div>
        <div class="flex items-center gap-2">
            <UBadge class="font-bold">Seen</UBadge>
            <UBadge class="font-bold" label="4" color="yellow"></UBadge>
            <UIcon name="i-heroicons-star-20-solid" class="text-lg text-primary"/>
        </div>
    </div>
    <!-- Skeleton loader -->
    <div v-if="loading" class="flex flex-col gap-2">
        <USkeleton class="min-w-[100px] max-w-[150px] aspect-[2/3] dark:bg-gray-500" :ui="{ rounded: 'rounded-none' }" />
        <div class="flex items-center gap-2">
            <USkeleton class="w-10 h-5 dark:bg-gray-500"></USkeleton>
            <USkeleton class="w-5 h-5  dark:bg-gray-500" :ui="{ rounded: 'rounded-full' }"></USkeleton>
            <USkeleton class="w-5 h-5  dark:bg-gray-500" :ui="{ rounded: 'rounded-full' }"></USkeleton>
        </div>
    </div>
    <!-- <button @click="toggleLoad">Load</button> -->
    <br />

</template>

<style></style>