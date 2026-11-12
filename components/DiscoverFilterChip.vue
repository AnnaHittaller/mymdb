<script setup lang="ts">
defineProps<{
	label: string
	removeLabel: string
}>()

const emit = defineEmits<{
	remove: []
}>()
</script>

<template>
	<button
		type="button"
		class="group inline-flex cursor-pointer items-center gap-1 rounded-md bg-surface-hover px-2 py-1 text-base text-fg-default transition-colors hover:bg-surface-inset"
		:aria-label="removeLabel"
		@click="emit('remove')">
		{{ label }}
		<UIcon
			name="i-heroicons-x-mark-20-solid"
			class="size-4 shrink-0 text-fg-muted transition-colors group-hover:text-fg-default" />
	</button>
</template>
