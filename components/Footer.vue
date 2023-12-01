<script setup>
const { config } = useColorChange()
const glowColor = ref(config.ui.primary)
watchEffect(() => {
    glowColor.value = config.ui.primary;
    //console.log(glowColor.value)
})

const hoverStyle = computed(() => {
    if (glowColor.value) {
        let colorValue = '';
        switch (glowColor.value) {
            case 'mandy':
                colorValue = "#ea546c";
                break;
            case 'dusk':
                colorValue = "#839dd1";
                break;
            case 'emerald':
                colorValue = "#10b981";
                break;
            default:
                colorValue = '';
        }
        return {
            '--glow-color': colorValue,
        };
    }
    return {}; // Return an empty object if the value is not yet available
});


</script>

<template>
    <footer>
        <nav class="flex justify-evenly items-center">
            <NuxtLink to="/" class="hover-filter" :style="hoverStyle">
                <UIcon name="i-heroicons-home" class="text-primary" />
            </NuxtLink>
            <NuxtLink to="/" class="hover-filter" :style="hoverStyle">
                <UIcon name="i-heroicons-list-bullet-20-solid" class="text-primary" />
            </NuxtLink>
            <NuxtLink to="/" class="hover-filter" :style="hoverStyle">
                <UIcon name="i-heroicons-star-solid" class="text-primary" />
            </NuxtLink>
            <NuxtLink to="/" class="hover-filter" :style="hoverStyle">
                <UIcon name="i-heroicons-ellipsis-vertical-20-solid" class="text-primary" />
            </NuxtLink>
        </nav>
    </footer>
</template>

<style >
footer a span {
    font-size: 1.5rem;
}

.hover-filter {
    filter: none;
    transition: filter 0.3s ease;
}

.hover-filter:hover {
    filter: drop-shadow(0 0 3px var(--glow-color));
}
</style>