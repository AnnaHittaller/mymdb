<script setup>
const { computedStyle } = useComputedStyle()
const { logout, currentUserPromise } = useFirebaseAuth()
const { getUser } = useFirestore()
const colorStore = useUiColorStore() 

const userData = await currentUserPromise()
const user = await getUser(userData.uid)
//console.log("User:", user)

const items = [
    [{
        label: user?.email,
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
        icon: 'i-heroicons-arrow-left-on-rectangle',
        click: () => {
            handleLogout()
        }
    }]
]

const handleLogout = async () => {
    await logout();
    colorStore.colorReset();
};

</script>

<template>
    <footer class="flex items-center sm:items-start px-4 py-4">
        <nav class="flex justify-around sm:justify-start sm:gap-16 items-center w-full sm:flex-col sm:sticky sm:top-4 ">
            <Logo class="max-sm:hidden max-w-full flex m-0 shrink" />
            <NuxtLink to="/" class="hover-filter flex item-center" :style="computedStyle">
                <UIcon name="i-heroicons-home" class="text-primary text-3xl" />
            </NuxtLink>
            <NuxtLink to="/my-movies" class="hover-filter flex item-center" :style="computedStyle">
                <UIcon name="i-heroicons-list-bullet-20-solid" class="text-primary text-3xl" />
            </NuxtLink>
            <NuxtLink to="/watch-next" class="hover-filter flex item-center" :style="computedStyle">
                <UIcon name="i-heroicons-star-solid" class="text-primary text-3xl" />
            </NuxtLink>
            <NuxtLink to="/search" class="hover-filter flex item-center" :style="computedStyle">
                <UIcon name="i-heroicons-magnifying-glass-solid" class="text-primary text-3xl" />
            </NuxtLink>
            <NuxtLink to="/discover" class="hover-filter flex item-center" :style="computedStyle">
                <UIcon name="i-heroicons-light-bulb" class="text-primary text-3xl" />
            </NuxtLink>

            <!-- profile context menu -->
            <UDropdown :items="items" :ui="{ item: { disabled: 'cursor-text select-text', size: 'text-lg' }, width: 'w-max' }" class="z-40 relative " :popper="{ offsetDistance: 12 }">
                <UAvatar src=""
                    :ui="{ background: 'dark:bg-gray-800', placeholder: 'dark:text-primary', size: { sm: 'text-base' } }"
                    :alt="`${user?.username}`" class="avatar border hover:border-primary" />

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
                        :style="computedStyle" />
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
    color: var(--computed-style);
}

.hover-filter {
    filter: none;
    transition: filter 0.3s ease;
}

.hover-filter:hover {
    filter: drop-shadow(0 0 3px var(--computed-style));
}
</style>