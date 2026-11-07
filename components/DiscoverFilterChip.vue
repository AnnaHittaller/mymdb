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
	<UBadge color="neutral" variant="subtle" size="lg" class="gap-1">
		{{ label }}
		<UButton
			color="neutral"
			variant="link"
			icon="i-heroicons-x-mark-20-solid"
			size="xs"
			:aria-label="removeLabel"
			@click="emit('remove')"
		/>
	</UBadge>
</template>
