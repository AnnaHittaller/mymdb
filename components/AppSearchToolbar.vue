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
				<UButton
					to="/search"
					variant="iconbutton"
					color="custom"
					size="icon"
					square
					icon="i-heroicons-magnifying-glass-20-solid"
					aria-label="Search movies and shows"
					class="size-9 shrink-0 sm:size-8"
					:ui="{ leadingIcon: 'size-4 sm:size-3.5' }"
				/>
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
