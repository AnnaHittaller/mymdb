<script setup lang="ts">
import type { ToggleMoviePayload } from "~/domain/user-document/createUserDocument";

const props = defineProps<{
	payload: ToggleMoviePayload | null;
}>();

const { t } = useI18n();

const route = useRoute();
const user = useCurrentUser();
const { isInFavorites, setFavorites } = useUserDocument();
const { notifyListError } = useListCapToast();
const { shareCatalogTitle } = useCatalogShare();

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
	inFavorites.value ? t("detail.removeFavorites") : t("detail.addFavorites"),
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

async function onShare() {
	const payload = props.payload;
	if (!payload) return;
	await shareCatalogTitle({
		id: payload.id,
		mediaType: payload.mediaType ?? "movie",
		title: payload.title,
	});
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
				:aria-label="$t('detail.signInSaveList')"
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
				:aria-label="$t('detail.saveToList')"
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
				:aria-label="$t('detail.signInFavorites')"
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
				:aria-label="$t('common.share')"
				@click="onShare" />
		</div>
		<ListPickerOverlay v-if="payload" v-model:open="pickerOpen" :movie-payload="payload" />
	</div>
</template>
