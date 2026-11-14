<script setup lang="ts">
import { browsingModalUi } from "~/constants/browsingOverlayUi";
import type { PublishListResponse } from "~/types/share";
import { shareErrorMessage } from "~/utils/shareErrorMessage";

const open = defineModel<boolean>("open", { required: true });

const props = defineProps<{
	listId: string;
	listName: string;
}>();

const phase = ref<"confirm" | "loading" | "success" | "error">("confirm");
const shareUrl = ref("");
const errorMessage = ref("");
const toast = useToast();
const user = useCurrentUser();
const { shareUrl: nativeOrCopy, copyUrl } = useCatalogShare();

const canNativeShare = computed(
	() => import.meta.client && typeof navigator.share === "function",
);

const dismissible = computed(() => phase.value !== "loading");

watch(open, (isOpen) => {
	if (!isOpen) {
		phase.value = "confirm";
		shareUrl.value = "";
		errorMessage.value = "";
	}
});

async function createLink() {
	phase.value = "loading";
	errorMessage.value = "";
	try {
		const headers: Record<string, string> = {};
		if (user.value) {
			headers.Authorization = `Bearer ${await user.value.getIdToken()}`;
		}
		const result = await $fetch<PublishListResponse>("/api/share/lists", {
			method: "POST",
			body: { listId: props.listId },
			credentials: "include",
			headers,
		});
		shareUrl.value = result.url;
		phase.value = "success";
	} catch (error) {
		errorMessage.value = shareErrorMessage(error, "Could not create a share link. Try again.");
		phase.value = "error";
	}
}

async function copyLink() {
	if (!shareUrl.value) return;
	await copyUrl(shareUrl.value);
}

async function nativeShare() {
	if (!shareUrl.value) return;
	await nativeOrCopy({
		url: shareUrl.value,
		title: props.listName,
		text: `List “${props.listName}” on MyMDb`,
	});
}
</script>

<template>
	<UModal
		v-model:open="open"
		title="Share list"
		:dismissible="dismissible"
		:close="dismissible"
		:ui="browsingModalUi">
		<template #body>
			<div v-if="phase === 'confirm'" class="space-y-3 text-base text-fg-muted">
				<p>
					Share <span class="font-medium text-fg-default">{{ listName }}</span> as it is now — anyone with the link can view it.
				</p>
				<p>Editing the list later will not change links you already sent.</p>
			</div>
			<div v-else-if="phase === 'loading'" class="flex items-center gap-3 text-base text-fg-muted">
				<UIcon name="i-heroicons-arrow-path" class="size-5 animate-spin shrink-0" aria-hidden="true" />
				<span>Creating your link…</span>
			</div>
			<div v-else-if="phase === 'error'" class="flex items-start gap-3 text-base">
				<UIcon
					name="i-heroicons-exclamation-circle"
					class="mt-0.5 size-5 shrink-0 text-error"
					aria-hidden="true" />
				<p class="text-fg-default">
					{{ errorMessage }}
				</p>
			</div>
			<div v-else class="space-y-3">
				<p class="text-base text-fg-muted">
					Your link is ready:
				</p>
				<UInput :model-value="shareUrl" readonly class="w-full font-mono text-sm" />
			</div>
		</template>
		<template #footer>
			<div class="flex w-full flex-wrap justify-end gap-2">
				<UButton
					variant="outline"
					size="lg"
					label="Close"
					:disabled="phase === 'loading'"
					@click="open = false" />
				<template v-if="phase === 'confirm'">
					<UButton size="lg" label="Create link" @click="createLink" />
				</template>
				<template v-else-if="phase === 'error'">
					<UButton size="lg" label="Try again" @click="createLink" />
				</template>
				<template v-else-if="phase === 'success'">
					<UButton
						v-if="canNativeShare"
						size="lg"
						label="Share…"
						icon="i-heroicons-share"
						@click="nativeShare" />
					<UButton variant="outline" size="lg" label="Copy link" @click="copyLink" />
				</template>
			</div>
		</template>
	</UModal>
</template>