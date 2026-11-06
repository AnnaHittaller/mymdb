<script setup lang="ts">
import type { UserMovie } from "~/types/movie";

definePageMeta({
	middleware: "auth",
});

const { watchNext } = useUserDocument();
const searchTerm = ref("");
const debouncedSearchTerm = refDebounced(searchTerm, 700);

const filteredMovies = computed(() => {
	const term = debouncedSearchTerm.value.toLowerCase();
	return watchNext.value.filter((movie: UserMovie) => movie.title.toLowerCase().includes(term));
});
</script>

<template>
    <div>
        <div class="flex gap-4 items-center justify-start">
            <Heading>Favorites</Heading>
        </div>
        <UInput size="xl" placeholder="Filter for title..." v-model="searchTerm" name="search"
            :ui="{ base: 'text-xl placeholder:italic', trailing: 'pointer-events-none' }"
            class="relative mb-8 w-full">
            <template #trailing>

                <UButton v-show="searchTerm !== ''" color="neutral" variant="link" icon="i-heroicons-x-mark-20-solid"
                    square @click="searchTerm = ''" class="pointer-events-auto pr-10" />
                <div
                    class="bg-primary absolute right-0 top-0 h-full search-btn rounded-r-md flex items-center justify-center">
                    <UIcon name="i-heroicons-magnifying-glass-20-solid" class="text-fg-on-accent text-xl " />
                </div>
            </template>
        </UInput>
        <div class="flex flex-col items-stretch">
            <Heading v-if="debouncedSearchTerm !== ''">Results</Heading>
            <p v-if="debouncedSearchTerm !== '' && filteredMovies.length === 0" class="text-xl">No
                matching
                results can be found.</p>
            <p v-if="watchNext.length === 0">You have no movies in your favorites.</p>
            <div class="movie-grid " v-if="filteredMovies.length > 0">
                <MovieCard :movie="movie" v-for="movie in filteredMovies" :key="movie.id" />
            </div>
        </div>
    </div>
</template>
