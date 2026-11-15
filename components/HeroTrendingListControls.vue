<script setup lang="ts">
import type { TrendingItem } from "~/types/catalog";
import { defaultMediaType } from "~/utils/catalogKey";
import { togglePayloadFromCatalog } from "~/utils/catalogMoviePayload";

const props = defineProps<{
	item: TrendingItem;
}>();

const { isOnAnyList, isInFavorites, setFavorites } = useUserDocument();
const { notifyListError } = useListCapToast();
const { shareCatalogTitle } = useCatalogShare();

const pickerOpen = ref(false);

const mediaType = computed(() => defaultMediaType(props.item.mediaType));

const moviePayload = computed(() =>
	togglePayloadFromCatalog(
		{
			id: props.item.id,
			mediaType: mediaType.value,
			title: props.item.title,
			rating: props.item.rating,
			poster: props.item.poster,
			genres: props.item.genres,
		},
		mediaType.value,
		props.item.genres,
	),
);

const onAnyList = computed(() => isOnAnyList(String(props.item.id), mediaType.value));
const inFavorites = computed(() => isInFavorites(String(props.item.id), mediaType.value));

const bookmarkClass = computed(() =>
	onAnyList.value ? "text-primary hover:text-primary/75" : "text-fg-subtle hover:text-primary",
);

async function toggleFavorites() {
	try {
		await setFavorites(moviePayload.value, !inFavorites.value);
	} catch (error) {
		notifyListError(error);
	}
}

async function onShare() {
	await shareCatalogTitle({
		id: props.item.id,
		mediaType: mediaType.value,
		title: props.item.title,
	});
}
</script>

<template>
	<div class="flex h-8 max-h-8 min-h-8 shrink-0 flex-nowrap items-center gap-4 pt-1">
		<button
			type="button"
			class="flex h-8 cursor-pointer items-center leading-none transition-colors duration-200"
			:class="bookmarkClass"
			:aria-label="$t('detail.saveToList')"
			@click="pickerOpen = true">
			<IconAddToList class="size-7" />
		</button>
		<button
			type="button"
			class="flex h-8 cursor-pointer items-center leading-none transition-colors duration-200 hover:text-primary"
			:aria-label="inFavorites ? $t('detail.removeFavorites') : $t('detail.addFavorites')"
			@click="toggleFavorites">
			<UIcon
				:name="inFavorites ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
				:class="inFavorites ? 'size-7 text-primary' : 'size-7 text-fg-subtle hover:text-primary'" />
		</button>
		<button
			type="button"
			class="flex h-8 cursor-pointer items-center leading-none text-fg-subtle transition-colors duration-200 hover:text-primary"
			:aria-label="$t('common.share')"
			@click="onShare">
			<UIcon name="i-heroicons-share" class="size-7" />
		</button>
		<ListPickerOverlay v-model:open="pickerOpen" :movie-payload="moviePayload" />
	</div>
</template>
