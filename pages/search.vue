<script setup>

// Search related data
const searchTerm = ref("")
const debouncedSearchTerm = refDebounced(searchTerm, 700)
const isInMyMoviesChecked = ref(false); // Checked state for "In my movies" button
const isSeenChecked = ref(false); // Checked state for "Seen" button
let movies = ref([])
let currentPage = 1;

const url = computed(() => {
    return `api/movies/search?query=${debouncedSearchTerm.value}&page=${currentPage}`;
})

const { data, pending, error } = await useFetch(url)


watchEffect(() => {
    // Your logic here to handle movies change
    //movies.value = data.value
       // Reset currentPage for a new search
    currentPage = 1;

    // Fetch data based on the current search term and page
    useFetch(`/api/movies/search?query=${debouncedSearchTerm.value}&page=${currentPage}`).then(({ data, pending, error }) => {
        // Update the movies ref with the new data, replacing existing movies
        movies.value = toRaw(data.value);
    }).catch(error => {
        console.error('Error while searching for movies:', error);
    });
});
//const initialMovies  = toRaw(data?.value) || [];
//let movieArray = []
//movieArray.push(...initialMovies)
//console.log("movieArray:",movieArray)
//const query = debouncedSearchTerm.value.toLowerCase();
//const filteredMovies = ref([])
//console.log("filteredmovies",filteredMovies.value)
//const pageSize = 20;

// const filterMovies = () => {
//     filteredMovies.value = movieArray.filter(movie => {
//         const titleMatch = movie.title.toLowerCase().includes(debouncedSearchTerm.value.toLowerCase());
//         return titleMatch;
//     });
// };

const moviesWithPoster = computed(() => {
    //this is the problem
   // movies.value.push(data.value)
    // const rawMovies = toRaw(movies.value);
    // console.log("this",rawMovies);
    // return rawMovies.filter(movie => movie.poster !== null) 
    // if (isInMyMoviesChecked) {

    //     return movies.value.filter(movie => movie.poster !== null && movie);
    // }
    return movies.value.filter(movie => movie.poster !== null);
});

// Sort the remaining movies by popularity in descending order
// const sortedMovies = computed(() => {
//     return moviesWithPoster.value.slice().sort((a, b) => b.popularity - a.popularity);
// });

//let moreMovies = ref("")
const loadMoreMovies = async () => {
    try {
        currentPage++;

        const { data, pending, error } = await useFetch(`/api/movies/search?query=${debouncedSearchTerm.value}&page=${currentPage}`);
       
       // moreMovies.value = toRaw(data.value)
        //console.log(moreMovies)
        // Update the movies ref with the new data
        console.log("movies", movies)
        const newMovies = toRaw(data.value);
             movies.value = [...movies.value, ...newMovies.filter(newMovie => !movies.value.some(existingMovie => existingMovie.id === newMovie.id))];
       // movies.value = [...movies, ...moreMovies];
       // console.log("movies after", movies)

    } catch (error) {
        console.error('Error while loading more movies:', error);
    }
};


//just for discover type search
const loadMoreMoviesss = async () => {
   try {
       currentPage++;
        if (currentPage <= 20) {
            
                // Fetch more movies based on the original query and current page
                const { data: moreMovies, pending, error }  = await useFetch(`/api/movies/search?query=${debouncedSearchTerm.value}&page=${currentPage}`);
            
                // Append the new movies to the existing movie array
                //movieArray.push(...moreMovies.value);
            
                // Apply filtering to the updated movie array
                //filterMovies()

        }
   } catch(error) {
     console.error('Error while loading more movies:', error);
   }
    
};

//     //for discover type search
// watchEffect(() => {
//     // currentPage = 1;
   
//     // filterMovies()

//     // console.log(toRaw(filteredMovies.value), filteredMovies.value.length);
//     //  if (filteredMovies.value.length < pageSize) {
//     //     loadMoreMovies();
//     // }

//    url.value = `/api/movies/search?query=${debouncedSearchTerm.value}&page=${currentPage}`
//   // const { data, pending, error } =  useFetch(url)

//     console.log(data)
//     movies = toRaw(data.value)
//     console.log(toRaw(data.value))
//     //const { data, pending, error } = await useFetch(`/api/movies/search?query=${debouncedSearchTerm.value}`)
// });



// Function to toggle checkbox for "In my movies" button
const toggleInMyMoviesCheckbox = () => {
    isInMyMoviesChecked.value = !isInMyMoviesChecked.value;
};

// Function to toggle checkbox for "Seen" button
const toggleSeenCheckbox = () => {
    isSeenChecked.value = !isSeenChecked.value;
};

// Rating and Genre filter options
// const ratings = ['1', '2', '3', '4', '5']; // Assuming ratings are from 1 to 5
// let genres = []; // Fetch genres from API and set here

// Selected filters
// const selectedRatings = ref([]);
// const selectedGenres = ref([]);

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
            <UInput size="xl" placeholder="Search..." v-model="searchTerm" name="search"
                :ui="{ icon: { trailing: { pointer: '' } }, size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }"
                class="relative">
                <template #trailing>

                    <UButton v-show="searchTerm !== ''" color="white" variant="link" icon="i-heroicons-x-mark-20-solid"
                        :padded="false" @click="searchTerm = ''" class="pr-10" />
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
                <!-- <USelectMenu v-model="selectedRatings" size="sm" :options="ratings" multiple placeholder="My rating"
                    color="primary" :uiMenu="selectMenuConfig" /> -->

                <!-- Genre filter dropdown -->
                <!-- <USelectMenu v-model="selectedGenres" size="sm" :options="genres" multiple searchable placeholder="Genres"
                    color="primary" :uiMenu="selectMenuConfig" /> -->
            </div>
        </div>
        <div class="flex flex-col items-stretch">
            <Heading v-if="debouncedSearchTerm !== ''">Results</Heading>
            <!-- <p>{{ movies}}</p> -->
            <p v-if="debouncedSearchTerm !== '' && data && data?.length === 0" class="text-xl">No matching
                results can be found.</p>
            <div class="movie-grid " v-if="moviesWithPoster.length > 0">
                <MovieCard :movie="movie" v-for="movie in moviesWithPoster" :key="movie.id" />
                <!-- <MovieCard :movie="movie" v-for="movie in moreMovies" :key="movie.id" /> -->
            </div>
            <UButton label="Load more" @click="loadMoreMovies" class="mt-14 mb-8 self-center" size="xl" v-if="moviesWithPoster.length > 0"/>
        </div>
    </div>
</template>

<style >
.search-btn {
    aspect-ratio: 1/1;
}

.movie-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    row-gap: 2rem;
    column-gap: 1rem;

}
</style>