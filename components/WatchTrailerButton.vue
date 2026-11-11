<script setup lang="ts">
import type { MediaType } from "~/types/catalog";
import type { TrailerRef } from "~/types/trailer";

const props = withDefaults(
	defineProps<{
		id: number | string;
		mediaType: MediaType;
		title: string;
		trailer?: TrailerRef | null;
		loading?: boolean;
		disabled?: boolean;
		block?: boolean;
		size?: "xs" | "sm" | "md" | "lg" | "xl";
		ui?: Record<string, string>;
	}>(),
	{
		trailer: null,
		loading: false,
		disabled: false,
		block: false,
		size: "md",
	},
);

const emit = defineEmits<{
	play: [];
}>();

const unavailable = computed(() => props.disabled);

function onClick() {
	if (unavailable.value || props.loading) return;
	emit("play");
}
</script>

<template>
	<UButton
		type="button"
		icon="i-heroicons-play-20-solid"
		color="primary"
		variant="outline"
		label="Watch trailer"
		:size="size"
		:block="block"
		:loading="loading"
		:disabled="unavailable"
		:aria-disabled="unavailable || undefined"
		:ui="{
			base: 'leading-none',
			label: 'leading-none',
			leadingIcon: 'shrink-0',
			...ui,
		}"
		@click="onClick" />
</template>
