<script setup>
let loading = ref(false)
const movieData = ref(null);

const props = defineProps({
    // seen: Boolean,
    // rating: Number,
    // favorite: Boolean,
    movie: Object
})

const {movie} = toRefs(props)
//console.log(toRaw(movie.value))
const baseImageUrl = "https://image.tmdb.org/t/p/w500"

const fetchData = async () => {
    try {
        loading.value = true;
        const { data, pending, error } = await useFetch(`/api/movies/${movie.value.id}`);
        movieData.value = toRaw(data.value);
        //console.log(movieData.value);
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    await fetchData();
});

</script>

<template>
    <NuxtLink :to="`/movie/${movie.id}`">
        <div class="flex flex-col gap-2 w-full justify-start items-start">
            <div class="bg-gray-700 max-w-[250px] relative group">
                <div class="bg-primary text-neutral-800 font-semibold p-2 absolute top-[-3rem] left-0 transition opacity-0 scale-0 group-hover:opacity-100 group-hover:translate-y-[3rem] group-hover:scale-100 origin-top-left" >{{ movieData?.vote_average > 0 ? movieData?.vote_average.toFixed(1) : 'Ø'}}</div>
                <img v-if="movieData" :src="`${baseImageUrl}${movieData?.poster  || movieData?.poster_path}`" class="object-cover w-full h-full aspect-[2/3]" />
            </div>
            <!-- <p>{{ movie }}</p> -->
            <div class="flex items-center gap-2">
                <UBadge class="font-bold" v-if="movie.seen">Seen</UBadge>
                <!-- <UBadge class="font-bold" label="4" color="yellow"></UBadge> -->
                <UIcon name="i-heroicons-star-20-solid" v-if="movie.next" class="text-lg text-primary" />
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
</template>

<style></style>