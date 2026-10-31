<script setup lang="ts">
import { POSTER_IMAGE_URL } from "~/constants/movie";

const user = useCurrentUser()
const { movies, isInList, remove, setNext } = useUserDocument()

const props = defineProps({
    movie: Object,
})

const { movie } = toRefs(props)
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
                <div class="relative max-w-[250px] bg-surface-poster group">
                    <div
                        class="absolute left-0 top-0 z-20 origin-top-left bg-primary p-2 font-semibold text-fg-on-accent transition sm:scale-0 sm:opacity-0 sm:group-hover:scale-100 sm:group-hover:opacity-100">
                        {{ movie?.rating ? movie.rating.toFixed(1) : (movie?.vote_average ?
                            movie.vote_average.toFixed(1) : 'Ø') }}</div>
                    <img v-if="movie && (movie.poster || movie.poster_path)"
                        :src="`${POSTER_IMAGE_URL}${movie.poster || movie.poster_path}`" :alt="movie.title"
                        width="342" height="513" loading="lazy" decoding="async"
                        class="object-cover w-full h-full aspect-[2/3]" />
                </div>

                <p class="text-left text-lg">{{ movie?.title }}</p>
            </div>
        </NuxtLink>
    </div>
</template>
