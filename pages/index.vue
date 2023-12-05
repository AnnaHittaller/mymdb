<script setup>
import TrendingNowSwiper from '~/components/TrendingNowSwiper.vue';


const colorMode = useColorMode()
const { handlePrimaryColorChange } = useColorChange()

//const isDark = computed({
 //   get() {
 //       return colorMode.value === 'dark'
 //   },
 //   set() {
 //       colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
 //   }
//})

</script>

<template>
    <div>
        <Heading>Now trending</Heading>
        <TrendingNowSwiper/>
        <UButton to="/login" :ui="{ rounded: 'rounded-lg' }">Button</UButton>
        <ClientOnly>
            <!-- UI primary color changer -->
            <select @change="handlePrimaryColorChange($event)">
                <option value="emerald">Emerald</option>
                <option value="mandy">Mandy</option>
                <option value="dusk">Dusk</option>
            </select>
        </ClientOnly>
        <Heading>My movies</Heading>
        <Heading>Favorites</Heading>
        <!-- UI primary color changer end -->

    </div>
</template> 

<!-- TODO
pinia store for color change button into footer (pinia todos)
color change menu
data fetching tut with tmdb API
Komarnicki movie tut
swiper slider for movie list + favs

-->