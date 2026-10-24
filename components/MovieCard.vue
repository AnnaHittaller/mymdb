<script setup lang="ts">
const user = useCurrentUser()
const { movies, isInList, remove, setNext } = useUserDocument()

const props = defineProps({
    movie: Object,
})

const { movie } = toRefs(props)
const config = useRuntimeConfig();
const baseImageUrl = config.public.apiBaseImageUrl
const movieId = computed(() => movie?.value?.id.toString() || '')

const addToNextList = async () => {
    await setNext(movieId.value, true);
}

const removeFromNextList = async () => {
    await setNext(movieId.value, false);
}

const removeFromMovieList = async () => {
    await remove(movieId.value)
}

const isInMovieList = computed(() => isInList(movieId.value));

const isInNextList = computed(() => {
    return movies.value.some((entry) => entry.id === movieId.value && entry.next);
});

</script>

<template>
    <div class="relative pt-2 px-2 group">

        <div v-auto-animate v-if="user && isInMovieList">
            <UIcon name="i-heroicons-star"
                class="z-20 text-2xl text-primary absolute -top-1 -right-1 transition scale-150 origin-center cursor-pointer sm:opacity-50 sm:hover:opacity-100"
                v-if="!isInNextList" @click.stop="addToNextList" />
            <UIcon name="i-heroicons-star-20-solid"
                class="z-20 text-2xl scale-150 text-primary absolute -top-1 -right-1 transition origin-center cursor-pointer"
                v-if="isInNextList" @click.stop="removeFromNextList" />
        </div>
        <div v-auto-animate v-if="user && isInMovieList">
            <UIcon name="i-heroicons-x-circle"
                class="z-20 text-2xl scale-150 text-primary sm:opacity-0 absolute top-8 -right-1 transition origin-center cursor-pointer sm:group-hover:opacity-100"
                @click.stop="removeFromMovieList" />
        </div>
        <NuxtLink :to="`/movie/${movie?.id}`" class="relative">

            <div class="flex flex-col gap-2 w-full justify-start items-start">
                <div class="bg-gray-700 max-w-[250px] relative group">
                    <div
                        class="z-20 bg-primary text-neutral-800 font-semibold p-2 absolute top-0 left-0 transition sm:opacity-0 sm:scale-0 sm:group-hover:opacity-100 sm:group-hover:scale-100 sm:origin-top-left">
                        {{ movie?.rating ? movie.rating.toFixed(1) : (movie?.vote_average ?
                            movie.vote_average.toFixed(1) : 'Ø') }}</div>
                    <img v-if="movie" :src="`${baseImageUrl}${movie.poster || movie.poster_path}`"
                        class="object-cover w-full h-full aspect-[2/3]" />
                </div>

                <p class="text-left text-lg">{{ movie?.title }}</p>
            </div>
        </NuxtLink>
    </div>
</template>

<style></style>