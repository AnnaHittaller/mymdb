<script setup lang="ts">
withDefaults(
	defineProps<{
		/** When true, omit bottom padding (use in toolbar rows with actions). */
		flush?: boolean;
	}>(),
	{ flush: false },
);
</script>

<template>
	<div :class="flush ? 'pb-0' : 'pb-4'">
		<h2
			class="relative mb-0 pl-4 text-3xl leading-none before:absolute before:left-0 before:top-0 before:inline-block before:h-full before:w-1 before:bg-primary before:content-[''] md:text-4xl">
			<slot />
		</h2>
	</div>
</template>
