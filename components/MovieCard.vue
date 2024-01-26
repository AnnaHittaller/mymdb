<script setup>
//let loading = ref(false)
const { currentUserPromise } = useFirebaseAuth()
const { updateMovie, removeMovie } = useFirestore()

const userData = await currentUserPromise()
const userMoviesStore = useUserMoviesStore();
await userMoviesStore.fetchUserMovies();

const props = defineProps({
    movie: Object,
})

const { movie } = toRefs(props)
const baseImageUrl = "https://image.tmdb.org/t/p/w500"

const addToNextList = async () => {
    await updateMovie(userData.uid, movie.value.id, { next: true });
}

const removeFromNextList = async () => {
    await updateMovie(userData.uid, movie.value.id, { next: false });
}

const removeFromMovieList = async () => {
    await removeMovie(userData.uid, movie.value.id)
}

const isInMovieList = computed(() => userMoviesStore.movies.some(item => item.id === movie.value.id));

</script>

<template>
    <div class="relative pt-2 px-2 ">
        <div v-auto-animate v-if="isInMovieList">
            <!-- <UTooltip text="Add to watch next list" v-if="!movie.next"> -->
            <UIcon name="i-heroicons-star"
                class="z-20 text-2xl text-primary absolute -top-1 -right-1 transition scale-150 origin-center cursor-pointer"
                v-if="!movie.next" @click.stop="addToNextList" />
            <!-- </UTooltip> -->
            <!-- <UTooltip text="Remove from watch next list" v-if="movie.next"> -->
            <UIcon name="i-heroicons-star-20-solid"
                class="z-20 text-2xl scale-150 text-primary absolute -top-1 -right-1 transition origin-center cursor-pointer"
                v-if="movie.next" @click.stop="removeFromNextList" />
            <!-- </UTooltip> -->
        </div>
        <div v-auto-animate v-if="isInMovieList">
            <UIcon name="i-heroicons-x-circle"
                class="z-20 text-2xl scale-150 text-primary opacity-70 absolute top-8 -right-1 transition origin-center cursor-pointer hover:opacity-100"
                @click.stop="removeFromMovieList" />
        </div>
        <NuxtLink :to="`/movie/${movie.id}`" class="relative">

            <div class="flex flex-col gap-2 w-full justify-start items-start">
                <div class="bg-gray-700 max-w-[250px] relative group">
                    <div
                        class="z-20 bg-primary text-neutral-800 font-semibold p-2 absolute top-0 left-0 transition opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 origin-top-left">
                        {{ movie.rating > 0 ? movie.rating.toFixed(1) : 'Ø' }}</div>
                    <img v-if="movie" :src="`${baseImageUrl}${movie.poster}`"
                        class="object-cover w-full h-full aspect-[2/3]" />
                </div>
                <!-- <div class="flex items-center gap-2"> -->
                <!-- <UBadge class="font-bold" v-if="movie.seen">Seen</UBadge> -->
                <!-- <UBadge class="font-bold" label="4" color="yellow"></UBadge> -->
                <!-- </div> -->
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