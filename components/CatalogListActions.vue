<script setup lang="ts">
import type { ToggleMoviePayload } from "~/domain/user-document/createUserDocument";

const props = defineProps<{
	payload: ToggleMoviePayload;
	block?: boolean;
	size?: "sm" | "md" | "lg";
}>();

const { isOnAnyList, isInFavorites, setFavorites } = useUserDocument();
const { notifyListError } = useListCapToast();

const pickerOpen = ref(false);

const mediaType = computed(() => props.payload.mediaType);

const onAnyList = computed(() =>
	isOnAnyList(props.payload.id, mediaType.value),
);
const inFavorites = computed(() =>
	isInFavorites(props.payload.id, mediaType.value),
);

async function toggleFavorites() {
	try {
		await setFavorites(props.payload, !inFavorites.value);
	} catch (error) {
		notifyListError(error);
	}
}
</script>

<template>
	<div class="flex w-full gap-3" :class="block ? 'flex-col' : 'flex-row items-center'">
		<UButton
			variant="outline"
			color="primary"
			label="Save to list"
			:block="block"
			:size="size"
			@click="pickerOpen = true">
			<template #leading>
				<IconAddToList class="size-5 shrink-0" />
			</template>
		</UButton>
		<UButton
			variant="outline"
			color="primary"
			:icon="inFavorites ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
			:label="inFavorites ? 'In favorites' : 'Add to favorites'"
			:block="block"
			:size="size"
			:class="onAnyList ? '' : ''"
			@click="toggleFavorites" />
		<ListPickerOverlay v-model:open="pickerOpen" :movie-payload="payload" />
	</div>
</template>
