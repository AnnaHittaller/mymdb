<script setup lang="ts">
import type { TrendingItem } from "~/types/catalog";
import { defaultMediaType } from "~/utils/catalogKey";
import { togglePayloadFromCatalog } from "~/utils/catalogMoviePayload";

const props = defineProps<{
	item: TrendingItem;
}>();

const { isOnAnyList, isInFavorites, setFavorites } = useUserDocument();
const { notifyListError } = useListCapToast();

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
</script>

<template>
	<div class="flex h-6 max-h-6 min-h-6 shrink-0 flex-nowrap items-center gap-3">
		<button
			type="button"
			class="flex h-6 cursor-pointer items-center leading-none transition-colors duration-200"
			:class="bookmarkClass"
			aria-label="Save to list"
			@click="pickerOpen = true">
			<IconAddToList class="size-6" />
		</button>
		<button
			type="button"
			class="flex h-6 cursor-pointer items-center leading-none transition-colors duration-200 hover:text-primary"
			:aria-label="inFavorites ? 'Remove from favorites' : 'Add to favorites'"
			@click="toggleFavorites">
			<UIcon
				:name="inFavorites ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
				:class="inFavorites ? 'size-6 text-primary' : 'size-6 text-fg-subtle hover:text-primary'" />
		</button>
		<ListPickerOverlay v-model:open="pickerOpen" :movie-payload="moviePayload" />
	</div>
</template>
