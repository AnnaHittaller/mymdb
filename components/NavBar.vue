<script setup>
const user = useCurrentUser()

const navLinkClass = 'nav-item'
const navLinkActiveClass = 'bg-surface-nav-active'
</script>

<template>
    <aside class="flex items-center bg-surface-sidebar px-4 py-4 shadow-surface-sidebar sm:items-start">
        <nav
            class="flex w-full items-center justify-around sm:sticky sm:top-4 sm:flex-col sm:items-center sm:justify-start sm:gap-12">
            <Logo class="m-0 max-w-full flex shrink max-sm:hidden" />
            <NuxtLink to="/" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
                <UIcon name="i-heroicons-home" class="size-8 shrink-0 text-primary" />
            </NuxtLink>
            <NuxtLink v-if="user" to="/my-movies" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
                <UIcon name="i-heroicons-list-bullet-20-solid" class="size-8 shrink-0 text-primary" />
            </NuxtLink>
            <NuxtLink v-if="user" to="/watch-next" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
                <UIcon name="i-heroicons-star-solid" class="size-8 shrink-0 text-primary" />
            </NuxtLink>
            <NuxtLink v-if="user" to="/search" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
                <UIcon name="i-heroicons-magnifying-glass-solid" class="size-8 shrink-0 text-primary" />
            </NuxtLink>
            <NuxtLink v-if="user" to="/discover" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
                <UIcon name="i-heroicons-light-bulb" class="size-8 shrink-0 text-primary" />
            </NuxtLink>
            <NuxtLink v-if="user" to="/profile" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
                <UIcon name="i-heroicons-user-circle" class="size-8 shrink-0 text-primary" />
            </NuxtLink>
            <NuxtLink v-if="!user" to="/login" class="px-2 text-lg font-semibold text-primary">
                Sign in
            </NuxtLink>
        </nav>
    </aside>
</template>
