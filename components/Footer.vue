<script setup>
// const glowColor = ref(config.ui.primary)
// watchEffect(() => {
//     glowColor.value = config.ui.primary;
//     //console.log(glowColor.value)
// })

const colorStore = useUiColorStore()

const hoverStyle = computed(() => {
    if (colorStore.uiColor) {
        let colorValue = '';
        switch (colorStore.uiColor) {
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
        to: '/profile'
    }], [{
        label: 'Settings',
        icon: 'i-heroicons-cog-6-tooth',
        to: '/profile/settings'
    }, {
        label: 'About',
        icon: 'i-heroicons-information-circle',
        to: '/about'
    }, {
        label: 'Contact',
        icon: 'i-heroicons-chat-bubble-left-ellipsis',
        to: '/contact'
    }], [{
        label: 'Sign out',
        icon: 'i-heroicons-arrow-left-on-rectangle'
    }]
]
// const { width } = useWindowSize()
// const popperConfig = computed(() => {
//     if (width.value <= 640) {
//         return { placement: 'top' }; // For small screens, place popper on top
//     } else {
//         return { placement: 'right-start' }; // For larger screens, place popper on the right
//     }
// });


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

            <UDropdown :items="items" :ui="{ item: { disabled: 'cursor-text select-text' } }">
                <UAvatar src="" :ui="{ background: 'dark:bg-gray-800', placeholder: 'dark:text-primary' }" alt="User Name"
                    class="avatar border hover:border-primary " />

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
                    <span class="truncate ">{{ item.label }}</span>

                    <UIcon :name="item.icon" class="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-500 ms-auto"
                        :style="hoverStyle" />
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
    transition: .2s ease;
}

*[role="menuitem"]>span:nth-child(2) {
    transition: .1s ease;
}

*[role="menuitem"]:hover>span:nth-child(2) {
    color: var(--glow-color);
}

.hover-filter {
    filter: none;
    transition: filter 0.3s ease;
}

.hover-filter:hover {
    filter: drop-shadow(0 0 3px var(--glow-color));
}
</style>