<script setup lang="ts">
defineProps<{
	title?: string;
}>();
</script>

<template>
	<section
		class="@container min-w-0 max-w-full rounded-[12px] border border-border-default bg-surface-elevated p-4 shadow-surface-overlay">
		<h3
			v-if="title"
			class="mb-3 text-base font-semibold uppercase tracking-wide text-fg-default">
			{{ title }}
		</h3>
		<slot />
	</section>
</template>
