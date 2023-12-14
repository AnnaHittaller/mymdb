<script setup>
const route = useRoute()
//const nuxt = useNuxtApp()
//console.log(nuxt)
const movieId = computed(() => route.params.id)
const baseImageUrl = "https://image.tmdb.org/t/p/w500"

const { data: movieData, pending, error } = await useFetch(`/api/movies/${movieId.value}`)
const movie = toRaw(movieData?.value)
//console.log(movie)

const ratingBadge = reactive({
    red: 'outline',
    orange: 'outline',
    amber: 'outline',
    lime: 'outline',
    green: 'outline'
})

let selectedRating = null;

const toggleBadge = (color, rating) => {
    if (selectedRating && selectedRating.color === color) {
        // If the same badge is clicked again, deselect it
        for (const key in ratingBadge) {
            ratingBadge[key] = 'outline';
        }
        selectedRating = null; // Reset selected rating
    } else {
        for (const key in ratingBadge) {
            ratingBadge[key] = key === color ? 'solid' : 'outline';
        }
        selectedRating = { color, rating };
    }
}

// Function to update the database with the selected rating
// const updateDatabase = () => {
//     if (selectedRating) {
//         const { color, rating } = selectedRating;
//         // Perform database update using the selectedRating value
//         console.log(`Updating database with color: ${color} and rating: ${rating}`);
//         // You can make an API call or perform any necessary action to update the database here
//     } else {
//         console.log('No rating selected');
//     }
// }

</script>

<template>
    <Heading>{{ movie?.title }}</Heading>
    <div class="flex flex-col md:flex-row items-center gap-8 xl:gap-16 pb-4">
        <div class="flex flex-col gap-4 items-center">
            <img :src="`${baseImageUrl}${movie.poster_path}`" :alt="`${movie.title}`" class="w-full max-w-sm lg:max-w-xl">
            <div class="icon-group flex gap-4">
                    <UButton icon="i-heroicons-list-bullet-20-solid" color="primary" variant="outline" label="My movies"
                        class="flex flex-col gap-1 w-16" />
                    <UButton icon="i-heroicons-star-solid" color="primary" variant="outline" label="Watch next"
                        class="flex flex-col gap-1 w-16" />
                    <UButton icon="i-heroicons-check-circle" color="primary" variant="outline" label="Seen"
                        class="flex flex-col gap-1 w-16" />
                </div>
        </div>
        <div class="w-full flex flex-col gap-4">
            <div>

                <span v-for="genre in movie?.genres" class="text-lg font-bold">
                    <div v-if="movie.genres[0] != genre" class="bg-primary h-4 w-[.25rem] inline-block ml-2 mr-1"></div>
                    {{ genre.name }}
                </span>
            </div>
            <h3 class="text-lg">{{ movie.tagline }}</h3>
            <p class="max-w-2xl">{{ movie.overview }}</p>
            <Heading class="pt-4">Actors</Heading>
            <div>
                <span v-for="actor in movie.credits.cast.slice(0, 4)">{{ actor.name }}, </span>
                <span>{{ movie.credits.cast[4].name }}</span>
            </div>
            <Heading class="pt-4">My rating</Heading>
            <div class="flex gap-2">
                <UBadge color="red" :variant="ratingBadge.red" @click="toggleBadge('red', 1)" label="1" size="md"
                    class="cursor-pointer" />
                <UBadge color="orange" :variant="ratingBadge.orange" @click="toggleBadge('orange', 2)" label="2" size="md"
                    class="cursor-pointer" />
                <UBadge color="amber" :variant="ratingBadge.amber" @click="toggleBadge('amber', 3)" label="3" size="md"
                    class="cursor-pointer" />
                <UBadge color="lime" :variant="ratingBadge.lime" @click="toggleBadge('lime', 4)" label="4" size="md"
                    class="cursor-pointer" />
                <UBadge color="green" :variant="ratingBadge.green" @click="toggleBadge('green', 5)" label="5" size="md"
                    class="cursor-pointer" />
            </div>
            <!-- <div class="icon-group flex gap-4">
                <UButton icon="i-heroicons-list-bullet-20-solid" color="primary" variant="outline" label="My movies"
                    class="flex flex-col gap-1" />
                <UButton icon="i-heroicons-star-solid" color="primary" variant="outline" label="Watch next"
                    class="flex flex-col gap-1" />
                <UButton icon="i-heroicons-check-circle" color="primary" variant="outline" label="Seen"
                    class="flex flex-col gap-1" />
            </div> -->
        </div>
    </div>
    <Heading class="pt-4">More like this</Heading>
</template> 

<style scoped></style>

