<script setup>
definePageMeta({
    middleware: "auth"
})

const { currentUserPromise } = useFirebaseAuth()
const { getUser } = useFirestore()
const userData = await currentUserPromise()
const user = await getUser(userData.uid)

const userMoviesStore = useUserMoviesStore();
await userMoviesStore.fetchUserMovies();

const searchTerm = ref("")
const debouncedSearchTerm = refDebounced(searchTerm, 700)

const watchNextMovies = userMoviesStore.movies.filter(movie => movie.next)

const filteredMovies = computed(() => {
    return userMoviesStore.movies.filter(movie => {
        return movie.next && movie.title.toLowerCase().includes(debouncedSearchTerm.value.toLowerCase());
    });
});
</script>

<template>
    <div>
        <div class="flex gap-4 items-center justify-start">
            <Heading>Watch next</Heading>
            <UBadge variant="outline" class="mb-4">{{ watchNextMovies.length }}</UBadge>
        </div>
        <UInput size="xl" placeholder="Filter for title..." v-model="searchTerm" name="search"
            :ui="{ icon: { trailing: { pointer: '' } }, size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }"
            class="relative mb-8">
            <template #trailing>

                <UButton v-show="searchTerm !== ''" color="white" variant="link" icon="i-heroicons-x-mark-20-solid"
                    :padded="false" @click="searchTerm = ''" class="pr-10" />
                <div
                    class="bg-primary absolute right-0 top-0 h-full search-btn rounded-r-md flex items-center justify-center">
                    <UIcon name="i-heroicons-magnifying-glass-20-solid" class="text-zinc-900 text-xl " />
                </div>
            </template>
        </UInput>
        <div class="flex flex-col items-stretch">
            <Heading v-if="debouncedSearchTerm !== ''">Results</Heading>
            <p v-if="debouncedSearchTerm !== '' && watchNextMovies && filteredMovies.length === 0" class="text-xl">No
                matching
                results can be found.</p>
            <p v-if="watchNextMovies.length === 0">You have no movies on your watch next list.</p>
            <div class="movie-grid " v-if="filteredMovies.length > 0">
                <MovieCard :movie="movie" v-for="movie in filteredMovies" :key="movie.id" />
            </div>
        </div>
    </div>
</template>

<style scoped></style>