<script setup lang="ts">
const { visible, backLinkLabel, goBack } = useStackBack();
</script>

<template>
	<button
		v-if="visible"
		type="button"
		class="-ml-1 mb-0 inline-flex min-h-11 max-w-full cursor-pointer items-center gap-1.5 rounded-lg px-1 text-base font-semibold text-fg-muted transition-colors hover:text-primary focus-visible:outline-3 focus-visible:outline-primary/25 max-md:min-h-10"
		@click="goBack">
		<UIcon name="i-heroicons-chevron-left-20-solid" class="size-5 shrink-0" aria-hidden="true" />
		<span class="truncate">{{ backLinkLabel }}</span>
	</button>
</template>