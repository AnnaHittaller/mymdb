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
	<UBadge
		as="button"
		type="button"
		color="neutral"
		variant="subtle"
		size="lg"
		class="group cursor-pointer gap-1"
		:aria-label="removeLabel"
		@click="emit('remove')">
		{{ label }}
		<UIcon
			name="i-heroicons-x-mark-20-solid"
			class="size-4 shrink-0 text-fg-muted transition-colors group-hover:text-white" />
	</UBadge>
</template>
