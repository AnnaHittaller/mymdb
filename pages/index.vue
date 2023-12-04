<script setup>

const colorMode = useColorMode()
const { handlePrimaryColorChange } = useColorChange()

const isDark = computed({
    get() {
        return colorMode.value === 'dark'
    },
    set() {
        colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    }
})

</script>

<template>
    <div>

        <Heading>Now trending</Heading>

        <UButton to="/login" :ui="{ rounded: 'rounded-lg' }">Button</UButton>
        <ClientOnly>
            <!-- <UButton :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'" color="gray" variant="ghost"
                aria-label="Theme" @click="isDark = !isDark" />
            <template #fallback>
                <div class="w-8 h-8" />
            </template> -->
            <!-- Primary color changer -->
            <select @change="handlePrimaryColorChange($event)">
                <option value="emerald">Emerald</option>
                <option value="mandy">Mandy</option>
                <option value="dusk">Dusk</option>
            </select>
        </ClientOnly>
        <Heading>My movies</Heading>
        <Heading>Favorites</Heading>
    </div>
</template> 

<!-- TODO
Swiper for now trending, test with random img
pinia store for color change button into footer (pinia todos)
color change popper menu
popper menu for kebab icon: about, contact, profile
data fetching tut with tmdb API
Komarnicki movie tut
swiper slider for movie list + favs

-->