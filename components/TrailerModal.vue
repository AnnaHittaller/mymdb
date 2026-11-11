<script setup lang="ts">
import { browsingModalUi } from "~/constants/browsingOverlayUi";
import type { TrailerRef } from "~/types/trailer";
import { embedUrl } from "~/utils/tmdbVideo";

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
	title: string;
	trailer: TrailerRef | null;
}>();

const iframeSrc = ref<string | null>(null);

watch(
	() => [open.value, props.trailer] as const,
	([isOpen, trailer]) => {
		if (isOpen && trailer) {
			iframeSrc.value = embedUrl(trailer.site, trailer.key);
		} else {
			iframeSrc.value = null;
		}
	},
	{ immediate: true },
);

const iframeTitle = computed(() =>
	props.trailer?.name ? `${props.title} — ${props.trailer.name}` : `Trailer: ${props.title}`,
);
</script>

<template>
	<UModal
		v-model:open="open"
		:title="title"
		:description="trailer?.name"
		:ui="{
			...browsingModalUi,
			content: 'w-[calc(100vw-2rem)] max-w-5xl',
			body: 'p-0 text-base sm:p-0',
		}">
		<template #body>
			<div
				v-if="iframeSrc"
				class="aspect-video w-full overflow-hidden rounded-b-md bg-surface-inset">
				<iframe
					:key="iframeSrc"
					:src="iframeSrc"
					:title="iframeTitle"
					class="size-full border-0"
					allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
					referrerpolicy="strict-origin-when-cross-origin"
					allowfullscreen />
			</div>
		</template>
	</UModal>
</template>
