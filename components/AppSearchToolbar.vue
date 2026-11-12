<script setup lang="ts">
const user = useCurrentUser();

/** Match prior toolbar profile `UAvatar` sizing. */
const toolbarIconClass = "size-10 shrink-0";
</script>

<template>
	<div class="w-full px-4 pt-4 pb-6 sm:pt-2 sm:pb-3">
		<div class="flex w-full flex-row items-center justify-between gap-2 max-sm:min-h-10 sm:hidden">
			<Logo class="m-0 shrink-0 [&_a]:justify-start" />
			<NuxtLink
				v-if="user"
				to="/profile"
				:class="[toolbarIconClass, 'group rounded-full']"
				aria-label="Profile">
				<UAvatar
					:alt="user.displayName ?? 'Profile'"
					:ui="{
						root: `${toolbarIconClass} border border-border-default transition-colors group-hover:border-primary`,
					}"
				/>
			</NuxtLink>
		</div>
	</div>
</template>
