<script setup lang="ts">
import type { MediaType } from "~/types/catalog";
import { catalogMediaIcon, catalogMediaLabel } from "~/utils/catalogMediaDisplay";
import { defaultMediaType } from "~/utils/catalogKey";

const props = defineProps<{
	mediaType: MediaType;
	/** Top-left poster chip (icon only). */
	overlay?: boolean;
	/** Inline within a muted metadata line (hero). */
	embedded?: boolean;
}>();

const resolved = computed(() => defaultMediaType(props.mediaType));
const icon = computed(() => catalogMediaIcon(resolved.value));
const label = computed(() => catalogMediaLabel(resolved.value));
</script>

<template>
	<span
		v-if="overlay"
		class="absolute left-1.5 top-1.5 inline-flex items-center justify-center rounded bg-surface-overlay/50 p-1.5 text-fg-default backdrop-blur-sm"
		:aria-label="label">
		<UIcon :name="icon" class="block size-4 shrink-0" aria-hidden="true" />
	</span>
	<span
		v-else-if="embedded"
		class="inline-flex items-center gap-0.5 text-base align-[-0.05em] text-fg-muted">
		<UIcon :name="icon" class="size-4 shrink-0" aria-hidden="true" />
		<span>{{ label }}</span>
	</span>
	<span v-else class="inline-flex items-center gap-1 text-base leading-tight text-fg-muted">
		<UIcon :name="icon" class="size-5 shrink-0" aria-hidden="true" />
		<span>{{ label }}</span>
	</span>
</template>
