<script setup>
const user = useCurrentUser()
</script>

<template>
    <aside class="flex items-center sm:items-start px-4 py-4">
        <nav class="flex justify-around sm:justify-start sm:gap-12 items-center w-full sm:flex-col sm:sticky sm:top-4 ">
            <Logo class="max-sm:hidden max-w-full flex m-0 shrink" />
            <NuxtLink to="/"
                class="hover-filter flex items-center rounded-full size-12 justify-center hover:bg-gray-800 "
                exact-active-class="bg-gray-800">
                <UIcon name="i-heroicons-home" class="text-primary text-3xl" />
            </NuxtLink>
            <NuxtLink v-if="user" to="/my-movies"
                class="hover-filter flex items-center rounded-full size-12 justify-center hover:bg-gray-800 "
                exact-active-class="bg-gray-800">
                <UIcon name="i-heroicons-list-bullet-20-solid" class="text-primary text-3xl" />
            </NuxtLink>
            <NuxtLink v-if="user" to="/watch-next"
                class="hover-filter flex  items-center rounded-full size-12 justify-center hover:bg-gray-800 "
                exact-active-class="bg-gray-800">
                <UIcon name="i-heroicons-star-solid" class="text-primary text-3xl" />
            </NuxtLink>
            <NuxtLink v-if="user" to="/search"
                class="hover-filter flex items-center rounded-full size-12 justify-center hover:bg-gray-800 "
                exact-active-class="bg-gray-800">
                <UIcon name="i-heroicons-magnifying-glass-solid" class="text-primary text-3xl" />
            </NuxtLink>
            <NuxtLink v-if="user" to="/discover"
                class="hover-filter flex  items-center rounded-full size-12 justify-center hover:bg-gray-800 "
                exact-active-class="bg-gray-800">
                <UIcon name="i-heroicons-light-bulb" class="text-primary text-3xl" />
            </NuxtLink>
            <NuxtLink v-if="user" to="/profile"
                class="hover-filter flex  items-center rounded-full size-12 justify-center hover:bg-gray-800"
                exact-active-class="bg-gray-800">
                <UIcon name="i-heroicons-user-circle" class="text-primary text-3xl" />
            </NuxtLink>
            <NuxtLink v-if="!user" to="/login"
                class="text-primary text-lg font-semibold px-2">
                Sign in
            </NuxtLink>
        </nav>
    </aside>
</template>

<style>
aside {
    background-color: #3d3d3d;
    box-shadow: 0 0px 10px -3px rgb(0, 0, 0, 1);
}

.avatar {
    transition: .2s ease;
}

*[role="menuitem"]>span:nth-child(2) {
    transition: .1s ease;
}

.hover-filter {
    filter: none;
    transition: all 0.2s ease;
}
</style>
