<script setup>
//let loading = ref(false)
const { currentUserPromise } = useFirebaseAuth()
const { updateMovie } = useFirestore()

const userData = await currentUserPromise()

const props = defineProps({
    movie: Object
})

const { movie } = toRefs(props)
const baseImageUrl = "https://image.tmdb.org/t/p/w500"

const addToNextList = async () => {
    await updateMovie(userData.uid, movie.value.id, { next: true });
}

const removeFromNextList = async () => {
    await updateMovie(userData.uid, movie.value.id, { next: false });
}

</script>

<template>
    <div class="relative pt-1 px-1">
        <UIcon name="i-heroicons-star"
            class="z-20 text-2xl text-primary absolute top-2 right-2 transition hover:scale-150 origin-bottom-left cursor-pointer"
            v-if="!movie.next" @click.stop="addToNextList" />
        <UIcon name="i-heroicons-star-20-solid"
            class="z-20 text-2xl scale-150 text-primary absolute top-2 right-2 transition hover:scale-150 origin-bottom-left cursor-pointer"
            v-if="movie.next" @click.stop="removeFromNextList" />
        <NuxtLink :to="`/movie/${movie.id}`">
            <div class="flex flex-col gap-2 w-full justify-start items-start">
                <div class="bg-gray-700 max-w-[250px] relative group">
                    <div
                        class="z-20 bg-primary text-neutral-800 font-semibold p-2 absolute top-0 left-0 transition opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 origin-top-left">
                        {{ movie.rating > 0 ? movie.rating.toFixed(1) : 'Ø' }}</div>
                    <img v-if="movie" :src="`${baseImageUrl}${movie.poster}`"
                        class="object-cover w-full h-full aspect-[2/3]" />
                </div>
                <!-- <p>{{ movie }}</p> -->
                <div class="flex items-center gap-2">
                    <UBadge class="font-bold" v-if="movie.seen">Seen</UBadge>
                    <!-- <UBadge class="font-bold" label="4" color="yellow"></UBadge> -->
                </div>
                <p class="text-left">{{ movie.title }}</p>
            </div>
            <!-- Skeleton loader -->
            <!-- <div v-if="loading" class="flex flex-col gap-2 w-full">
                <USkeleton class="max-w-[250px] aspect-[2/3] dark:bg-gray-500" :ui="{ rounded: 'rounded-none' }" />
                <div class="flex items-center gap-2">
                    <USkeleton class="w-10 h-5 dark:bg-gray-500"></USkeleton>
                    <USkeleton class="w-5 h-5  dark:bg-gray-500" :ui="{ rounded: 'rounded-full' }"></USkeleton>
                    <USkeleton class="w-5 h-5  dark:bg-gray-500" :ui="{ rounded: 'rounded-full' }"></USkeleton>
                </div>
            </div> -->
        </NuxtLink>
    </div>
</template>

<style></style>