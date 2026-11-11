<script setup lang="ts">
const user = useCurrentUser();

/** Match toolbar search `UButton` (`class="size-10"`). */
const toolbarIconClass = "size-10 shrink-0";
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
					:class="toolbarIconClass"
					:ui="{ leadingIcon: 'size-5 sm:size-4' }"
				/>
				<NuxtLink to="/profile" :class="toolbarIconClass" aria-label="Profile">
					<UAvatar
						:alt="user.displayName ?? 'Profile'"
						:ui="{ root: `${toolbarIconClass} border border-border-default` }"
					/>
				</NuxtLink>
			</div>
		</div>
	</div>
</template>
