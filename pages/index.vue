<script setup lang="ts">
import { useUserMoviesStore } from '~/stores/useUserMoviesStore';

definePageMeta({
    middleware: "auth"
})

const { currentUserPromise } = useFirebaseAuth()
const { getUser } = useFirestore()
const userData: any = await currentUserPromise()
const user = await getUser(userData.uid)
//const {getUsers} = useFirestore()
//await getUsers()

const colorStore = useUiColorStore()
colorStore.initialize()

const userMoviesStore = useUserMoviesStore()
//console.log("AAAAAA",userMoviesStore.movies)
userMoviesStore.fetchUserMovies()
const usersMovies = toRaw(userMoviesStore?.movies)
console.log(user?.movies)

</script>

<template>
    <div class="pb-4 max-w-full">
        <Hero />
        <div class="flex justify-between items-center pr-4 pb-8">
            <Heading class="pl-4">My watchlist</Heading>
            <UButton to="/my-movies" label="View All" v-if="user?.movies.length > 2" />
        </div>
        <MovieSlider v-if="user?.movies" :movies="user.movies" />
        <div v-if="user?.movies.length === 0" class="flex gap-4 max-sm:flex-col items-center max-sm:text-lg ">
            <p class="px-4">Add some movies to your watch-list first.</p>
            <UButton to="/search" label="Get movies" class="text-lg"/>
        </div>
        <!-- <div v-if="error">Error while retrieving your movie list.</div> -->
        <div v-if="user?.movies.length > 0" class="flex justify-between items-center pr-4 pb-8 pt-4">
            <Heading class="pl-4 pt-8">Watch next</Heading>
            <UButton to="/watch-next" label="View All" v-if="user?.movies.length > 2" />
        </div>
        <!-- <MovieSlider v-if="user?.movies" :movies="user.movies" /> -->
        <div v-if="user?.movies.length > 0" class="flex gap-4 max-sm:flex-col max-sm:text-lg items-center pb-8">
            <p class="px-4">Add some movies to your watch next list first.</p>
            <UButton to="/my-movies" label="Get movies" class="text-lg"/>
        </div>
    </div>
</template> 

<style scoped></style>

<!-- TODO

error page
create a composable from baseImageUrl
meh - make slider bulletpoints clickable
keep-alive - to not load trending movies every time
create skeleton for swiper sliders and hero image
adding toast for movie page: rating and list modifications

including series too
-->