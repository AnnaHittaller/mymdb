<script setup>
// Search related data
const search = ref('')
const isInMyMoviesChecked = ref(false); // Checked state for "In my movies" button
const isSeenChecked = ref(false); // Checked state for "Seen" button

// Function to toggle checkbox for "In my movies" button
const toggleInMyMoviesCheckbox = () => {
    isInMyMoviesChecked.value = !isInMyMoviesChecked.value;
};

// Function to toggle checkbox for "Seen" button
const toggleSeenCheckbox = () => {
    isSeenChecked.value = !isSeenChecked.value;
};

// Rating and Genre filter options
const ratings = ['1', '2', '3', '4', '5']; // Assuming ratings are from 1 to 5
let genres = []; // Fetch genres from API and set here

// Selected filters
const selectedRatings = ref([]);
const selectedGenres = ref([]);

const selectMenuConfig = {
    option: {
        color: 'text-primary',
        selectedIcon: {
            base: 'dark:text-primary flex-shrink-0 cursor-pointer',
        },
        active: 'dark:bg-gray-600'
    },
    background: 'dark:bg-gray-900',
    placeholder: 'text-primary',
    select: 'cursor-pointer'
}
</script>

<template>
    <div>
        <div class="flex flex-col gap-4 pb-8">
            <UInput size="xl" placeholder="Search..." v-model="search" name="search"
                :ui="{ icon: { trailing: { pointer: '' } }, size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }"
                class="relative">
                <template #trailing>

                    <UButton v-show="search !== ''" color="white" variant="link" icon="i-heroicons-x-mark-20-solid"
                        :padded="false" @click="search = ''" class="pr-10" />
                    <div
                        class="bg-primary absolute right-0 top-0 h-full search-btn cursor-pointer rounded-r-md flex items-center justify-center">
                        <UIcon name="i-heroicons-magnifying-glass-20-solid" class="text-zinc-900 text-xl " />
                    </div>
                </template>
            </UInput>
            <div class="flex gap-4 items-center">
                <!-- My movies checkbox -->
                <UButton :variant="isInMyMoviesChecked ? 'solid' : 'outline'" size="sm" @click="toggleInMyMoviesCheckbox"
                    :ui="{ font: 'font-medium' }">
                    In my movies
                </UButton>

                <!-- Seen checkbox -->
                <UButton :variant="isSeenChecked ? 'solid' : 'outline'" size="sm" @click="toggleSeenCheckbox"
                    :ui="{ font: 'font-medium' }">
                    Seen
                </UButton>

                <!-- Rating filter dropdown -->
                <USelectMenu v-model="selectedRatings" size="sm" :options="ratings" multiple placeholder="My rating"
                    color="primary" :uiMenu="selectMenuConfig" />

                <!-- Genre filter dropdown -->
                <USelectMenu v-model="selectedGenres" size="sm" :options="genres" multiple searchable placeholder="Genres"
                    color="primary" :uiMenu="selectMenuConfig" />
            </div>
        </div>
        <div>
            <Heading>Results</Heading>
            <p class="text-xl">No matching result can be found.</p>
            <div class="movie-grid grid"></div>
        </div>
    </div>
</template>

<style scoped>
.search-btn {
    aspect-ratio: 1/1;
}
</style>