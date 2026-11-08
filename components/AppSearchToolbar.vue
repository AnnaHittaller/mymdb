<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";

const user = useCurrentUser();
const { width: viewportWidth } = useWindowSize();
const isMobileChrome = computed(() => viewportWidth.value < 640);

const controlSize = computed(() => (isMobileChrome.value ? "lg" : "md") as "lg" | "md");
</script>

<template>
	<div class="w-full px-4 pt-4 pb-6">
		<div class="flex w-full flex-row items-center justify-between gap-2 sm:justify-end">
			<Logo class="m-0 shrink-0 sm:hidden [&_a]:justify-start" />
			<div v-if="user" class="flex shrink-0 flex-row items-center gap-2">
				<NuxtLink
					to="/search"
					class="nav-item-icon-button size-9 shrink-0 sm:size-8"
					aria-label="Search movies and shows"
				>
					<UIcon
						name="i-heroicons-magnifying-glass-20-solid"
						class="size-4 text-current sm:size-3.5"
					/>
				</NuxtLink>
				<NuxtLink to="/profile" class="shrink-0" aria-label="Profile">
					<UAvatar
						:alt="user.displayName ?? 'Profile'"
						:size="controlSize"
						class="border border-border-default"
					/>
				</NuxtLink>
			</div>
		</div>
	</div>
</template>
