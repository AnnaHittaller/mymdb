<script setup lang="ts">
import type { ToggleMoviePayload } from "~/domain/user-document/createUserDocument";

const props = defineProps<{
	payload: ToggleMoviePayload | null;
}>();

const route = useRoute();
const user = useCurrentUser();
const { isInFavorites, setFavorites } = useUserDocument();
const { notifyListError } = useListCapToast();

const pickerOpen = ref(false);

const loginTo = computed(() => ({
	path: "/login",
	query: { redirect: route.fullPath },
}));

const inFavorites = computed(() => {
	const payload = props.payload;
	if (!payload) return false;
	return isInFavorites(payload.id, payload.mediaType);
});

const favoritesLabel = computed(() =>
	inFavorites.value ? "Remove from favorites" : "Add to favorites",
);

const detailActionUi = {
	base: "!size-12 shrink-0 p-0",
	leadingIcon: "!size-6",
};

async function toggleFavorites() {
	const payload = props.payload;
	if (!payload) return;
	try {
		await setFavorites(payload, !inFavorites.value);
	} catch (error) {
		notifyListError(error);
	}
}

function onShare() {
	// Share is added in a later change.
	return;
}
</script>

<template>
	<div>
		<div class="flex items-center justify-center gap-8">
			<UButton
				v-if="!user"
				color="custom"
				variant="iconbutton"
				size="icon"
				square
				:ui="detailActionUi"
				aria-label="Sign in to save to a list"
				:to="loginTo">
				<IconAddToList class="size-6" />
			</UButton>
			<UButton
				v-else
				color="custom"
				variant="iconbutton"
				size="icon"
				square
				:ui="detailActionUi"
				aria-label="Save to list"
				:disabled="!payload"
				@click="pickerOpen = true">
				<IconAddToList class="size-6" />
			</UButton>

			<UButton
				v-if="!user"
				color="custom"
				variant="iconbutton"
				size="icon"
				square
				:ui="detailActionUi"
				icon="i-heroicons-heart"
				aria-label="Sign in to add to favorites"
				:to="loginTo" />
			<UButton
				v-else
				color="custom"
				variant="iconbutton"
				size="icon"
				square
				:ui="inFavorites
					? { ...detailActionUi, leadingIcon: '!size-6 text-primary' }
					: detailActionUi
					"
				:icon="inFavorites ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
				:aria-label="favoritesLabel"
				:disabled="!payload"
				@click="toggleFavorites" />

			<UButton
				color="custom"
				variant="iconbutton"
				size="icon"
				square
				:ui="detailActionUi"
				icon="i-heroicons-share"
				aria-label="Share"
				@click="onShare" />
		</div>
		<ListPickerOverlay v-if="payload" v-model:open="pickerOpen" :movie-payload="payload" />
	</div>
</template>
