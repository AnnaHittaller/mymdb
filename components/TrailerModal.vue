<script setup lang="ts">
import { browsingModalUi } from "~/constants/browsingOverlayUi";
import type { TrailerRef } from "~/types/trailer";
import { embedUrl } from "~/utils/tmdbVideo";

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
	title: string;
	trailer: TrailerRef | null;
}>();

const { preferences, isConsentExpired, updatePreferences } = useCookieConsent();

const embedsAllowed = computed(
	() => preferences.value.embeddedVideo === true && !isConsentExpired.value,
);

const iframeSrc = ref<string | null>(null);

watch(
	() => [open.value, props.trailer, embedsAllowed.value] as const,
	([isOpen, trailer, allowed]) => {
		iframeSrc.value = isOpen && trailer && allowed ? embedUrl(trailer.site, trailer.key) : null;
	},
	{ immediate: true },
);

function allowEmbeds() {
	updatePreferences({ embeddedVideo: true });
}

function keepEmbedsOff() {
	updatePreferences({ embeddedVideo: false });
}

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
			<div v-else class="space-y-4 p-6">
				<p>
					This trailer plays on {{ trailer?.site === "Vimeo" ? "Vimeo" : "YouTube" }}.
					Loading it connects to that site and can store data on your device.
				</p>
				<p class="text-sm text-fg-muted">
					Not now is saved the same way as Play trailer. You can switch later under
					<NuxtLink to="/legal#cookies" class="text-primary hover:underline" @click="open = false">Legal → Cookies</NuxtLink>.
				</p>
				<div class="flex flex-wrap gap-3">
					<UButton type="button" @click="allowEmbeds">Play trailer</UButton>
					<UButton type="button" color="neutral" variant="outline" @click="keepEmbedsOff">Not now</UButton>
				</div>
			</div>
		</template>
	</UModal>
</template>
