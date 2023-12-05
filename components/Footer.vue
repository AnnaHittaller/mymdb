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


const items = [
    [{
        label: 'user@example.com',
        slot: 'account',
        disabled: true
    }], [{
        label: 'Profile',
        icon: 'i-heroicons-user-circle',
        to: '/'
    }], [{
        label: 'Settings',
        icon: 'i-heroicons-cog-6-tooth'
    }, {
        label: 'About',
        icon: 'i-heroicons-information-circle',
        to: '/about'
    }], [{
        label: 'Sign out',
        icon: 'i-heroicons-arrow-left-on-rectangle'
    }]
]
</script>

<template>
    <footer class="flex items-center px-4 py-4 ">
        <nav class="flex justify-around sm:justify-start sm:gap-16 items-center w-full sm:flex-col sm:h-full">
            <Logo class="max-sm:hidden max-w-full flex m-0 shrink" />
            <!-- Avatar placeholder is the initials of the alt prop: must be the user name -->
            <NuxtLink to="/" class="hover-filter flex item-center" :style="hoverStyle">
                <UIcon name="i-heroicons-home" class="text-primary sm:text-3xl text-2xl" />
            </NuxtLink>
            <NuxtLink to="/" class="hover-filter flex item-center" :style="hoverStyle">
                <UIcon name="i-heroicons-list-bullet-20-solid" class="text-primary sm:text-3xl text-2xl" />
            </NuxtLink>
            <NuxtLink to="/" class="hover-filter flex item-center" :style="hoverStyle">
                <UIcon name="i-heroicons-star-solid" class="text-primary sm:text-3xl text-2xl" />
            </NuxtLink>

            <UDropdown :items="items" :ui="{ item: { disabled: 'cursor-text select-text' } }"
                :popper="{ placement: 'right-start' }">
                <UAvatar src="" :ui="{ background: 'dark:bg-gray-800' }" alt="User Name" class="avatar" />

                <template #account="{ item }">
                    <div class="text-left">
                        <p>
                            Signed in as
                        </p>
                        <p class="truncate font-medium text-gray-900 dark:text-white">
                            {{ item.label }}
                        </p>
                    </div>
                </template>

                <template #item="{ item }">
                    <span class="truncate">{{ item.label }}</span>

                    <UIcon :name="item.icon"
                        class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto hover:text-primary" />
                </template>
            </UDropdown>
        </nav>

    </footer>
</template>

<style >
footer {
    background-color: #3d3d3d;
    box-shadow: 0 0px 10px -3px rgb(0, 0, 0, 1);
}

.avatar {
    transition: .3s ease;
    border: 1px solid gray;
}

.avatar:hover {
    border: 1px solid green;
}

*[role="menuitem"]>span:nth-child(2) {
    transition: .1s ease;
}

*[role="menuitem"]:hover>span:nth-child(2) {
    color: green;
}

.hover-filter {
    filter: none;
    transition: filter 0.3s ease;
}

.hover-filter:hover {
    filter: drop-shadow(0 0 3px var(--glow-color));
}
</style>