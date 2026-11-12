<script setup>
const user = useCurrentUser()

const navLinkClass = 'nav-item'
const navLinkActiveClass = 'nav-item-active'
</script>

<template>
	<aside
		class="flex shrink-0 items-center bg-surface-overlay px-4 py-4 shadow-surface-overlay sm:sticky sm:top-0 sm:h-dvh sm:flex-col sm:items-stretch sm:self-start sm:px-2">
		<nav
			class="flex h-full w-full items-center justify-around sm:flex-col sm:items-center sm:justify-start sm:gap-6">
			<Logo class="m-0 flex max-sm:hidden" />
			<NuxtLink to="/" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
				<UIcon name="i-heroicons-home" class="nav-item-icon" />
				<span class="nav-item-label">Home</span>
			</NuxtLink>
			<NuxtLink v-if="user" to="/lists" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
				<IconAddToList class="nav-item-icon" />
				<span class="nav-item-label">My Lists</span>
			</NuxtLink>
			<NuxtLink v-if="user" to="/lists/favorites" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
				<UIcon name="i-heroicons-heart" class="nav-item-icon" />
				<span class="nav-item-label">Favorites</span>
			</NuxtLink>
			<NuxtLink v-if="user" to="/browse" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
				<UIcon name="i-heroicons-fire" class="nav-item-icon" />
				<span class="nav-item-label">Browse</span>
			</NuxtLink>
			<div
				class="contents sm:mt-auto sm:flex sm:w-full sm:flex-col sm:items-center sm:gap-6">
				<NuxtLink
					v-if="user"
					to="/profile"
					:class="[navLinkClass, 'max-sm:hidden']"
					:exact-active-class="navLinkActiveClass">
					<UIcon name="i-heroicons-user-circle" class="nav-item-icon" />
					<span class="nav-item-label">Profile</span>
				</NuxtLink>
				<NuxtLink v-if="!user" to="/login" class="px-2 text-lg font-semibold text-primary">
					Sign in
				</NuxtLink>
				<NuxtLink to="/legal" :class="navLinkClass" :exact-active-class="navLinkActiveClass">
					<UIcon name="i-heroicons-information-circle" class="nav-item-icon" />
					<span class="nav-item-label">Legal</span>
				</NuxtLink>
			</div>
		</nav>
	</aside>
</template>
