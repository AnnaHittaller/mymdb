<script setup>
const user = useCurrentUser()

const navLinkClass = 'nav-item'
const navLinkActiveClass = 'nav-item-active'
</script>

<template>
    <aside class="flex shrink-0 items-center bg-surface-sidebar px-4 py-4 shadow-surface-sidebar sm:items-start">
        <nav
            class="flex w-full items-center justify-around sm:sticky sm:top-4 sm:flex-col sm:items-center sm:justify-start sm:gap-6">
            <Logo class="m-0 max-w-full flex shrink max-sm:hidden" />
            <NuxtLink to="/" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
                <UIcon name="i-heroicons-home" class="nav-item-icon" />
                <span class="nav-item-label">Home</span>
            </NuxtLink>
            <NuxtLink v-if="user" to="/my-movies" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
                <UIcon name="i-heroicons-list-bullet-20-solid" class="nav-item-icon" />
                <span class="nav-item-label">My Lists</span>
            </NuxtLink>
            <NuxtLink v-if="user" to="/watch-next" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
                <UIcon name="i-heroicons-star-solid" class="nav-item-icon" />
                <span class="nav-item-label">Watch Next</span>
            </NuxtLink>
            <NuxtLink v-if="user" to="/search" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
                <UIcon name="i-heroicons-magnifying-glass-solid" class="nav-item-icon" />
                <span class="nav-item-label">Search</span>
            </NuxtLink>
            <NuxtLink v-if="user" to="/discover" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
                <UIcon name="i-heroicons-light-bulb" class="nav-item-icon" />
                <span class="nav-item-label">Discover</span>
            </NuxtLink>
            <NuxtLink v-if="user" to="/profile" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
                <UIcon name="i-heroicons-user-circle" class="nav-item-icon" />
                <span class="nav-item-label">Profile</span>
            </NuxtLink>
            <NuxtLink v-if="!user" to="/login" class="px-2 text-lg font-semibold text-primary">
                Sign in
            </NuxtLink>
        </nav>
    </aside>
</template>
