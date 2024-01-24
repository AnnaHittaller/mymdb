<script setup lang="ts">
import { useUserMoviesStore } from '~/stores/useUserMoviesStore';

definePageMeta({
    middleware: "auth"
})

const { currentUserInfo, currentUserPromise } = useFirebaseAuth()
const { getUser } = useFirestore()
const userData:any = await currentUserPromise()
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

//this has to be changed to movie lists saved to the profile
const { data: trending, pending, error } = await useFetch('/api/movies/trending')
const trendingMovies = toRaw(trending?.value.splice(0, 15))
</script>

<template>
    <div class="pb-4 max-w-full">
        <Hero />
        <div class="flex justify-between items-center pr-4 pb-8">
            <Heading class="pl-4">My movies</Heading>
            <UButton to="/profile/my-movies" label="View All" />
        </div>
        <!-- <p>{{ currentUserInfo?.uid }}</p> -->
        <MovieSlider v-if="user?.movies" :movies="user.movies" />

        <div v-if="error">Error while retrieving your movie list.</div>
        <div class="flex justify-between items-center pr-4 pb-8 pt-4">
            <Heading class="pl-4 pt-8">Watch next</Heading>
            <UButton to="/profile/watch-next" label="View All" />
        </div>
    </div>
</template> 

<style scoped></style>

<!-- TODO
Komarnicki movie tut (movie genres, details from api)
vuefire
error page
movie-grid class make unscoped
create a composable from baseImageUrl
meh - make slider bulletpoints clickable
keep-alive - to not load trending movies every time
create skeleton for swiper sliders and hero image
adding toast for movie page: rating and list modifications

including series too
-->