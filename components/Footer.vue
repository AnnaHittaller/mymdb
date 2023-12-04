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
    <footer class="flex items-center px-4 py-4">
        <nav class="flex justify-around sm:justify-start sm:gap-16 items-center w-full sm:flex-col sm:h-full">
            <Logo class="max-sm:hidden max-w-full flex m-0 shrink" />
            <!-- Avatar placeholder is the initials of the alt prop: must be the user name -->
            <UAvatar class="max-sm:hidden" :ui="{ background: 'dark:bg-gray-800' }" src="" alt="User Name" size="2xl" />
            <NuxtLink to="/" class="hover-filter flex item-center" :style="hoverStyle">
                <UIcon name="i-heroicons-home" class="text-primary sm:text-3xl" />
            </NuxtLink>
            <NuxtLink to="/" class="hover-filter flex item-center" :style="hoverStyle">
                <UIcon name="i-heroicons-list-bullet-20-solid" class="text-primary sm:text-3xl" />
            </NuxtLink>
            <NuxtLink to="/" class="hover-filter flex item-center" :style="hoverStyle">
                <UIcon name="i-heroicons-star-solid" class="text-primary sm:text-3xl" />
            </NuxtLink>
            <!-- UI primary color changer -->

            <UPopover :popper="{ arrow: true }" class="flex items-center hover-filter text-primary"
                :style="hoverStyle">
                <UIcon name="i-ph-swatches-fill" class="text-primary text-2xl sm:text-3xl " />
                <template #panel="{ close }">
                    <div class="p-8">
                        <UButton label="Close" @click="close" />
                    </div>
                </template>
            </UPopover>

            <NuxtLink to="/" class="hover-filter flex item-center" :style="hoverStyle">
                <UIcon name="i-heroicons-ellipsis-vertical-20-solid" class="text-primary sm:text-3xl" />
            </NuxtLink>
        </nav>
    </footer>
</template>

<style >
footer {
    background-color: #3d3d3d;
    box-shadow: 0 0px 10px -3px rgb(0, 0, 0, 1);
}

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