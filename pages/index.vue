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

        home page
        <UButton to="/login" :ui="{ rounded: 'rounded-lg' }">Button</UButton>
        <UButton to="/" color="dusk">Button2</UButton>
        <Heading>Heading sample</Heading>
        <ClientOnly>
            <UButton :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'" color="gray" variant="ghost"
                aria-label="Theme" @click="isDark = !isDark" />
            <template #fallback>
                <div class="w-8 h-8" />
            </template>
            <!-- Primary color changer -->
            <select @change="handlePrimaryColorChange($event)">
                <option value="emerald">Emerald</option>
                <option value="mandy">Mandy</option>
                <option value="dusk">Dusk</option>
            </select>
        </ClientOnly>
        <UIcon name="i-wi-sleet" class="text-5xl" />

    </div>
</template> 