<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { browsingDrawerUi, browsingSlideoverUi } from "~/constants/browsingOverlayUi";
import type { ToggleMoviePayload } from "~/domain/user-document/createUserDocument";
import type { MediaType } from "~/types/catalog";
import { defaultMediaType } from "~/utils/catalogKey";

const props = defineProps<{
	moviePayload: ToggleMoviePayload;
	mediaType?: MediaType;
}>();

const open = defineModel<boolean>("open", { default: false });

const { lists, isInList, toggleListMembership } = useUserDocument();
const { notifyListError } = useListCapToast();

const isDesktop = useMediaQuery("(min-width: 768px)");
const createOpen = ref(false);

const flyoutLists = computed(() => lists.value);

async function toggle(listId: string) {
	try {
		await toggleListMembership(listId, props.moviePayload);
	} catch (error) {
		notifyListError(error);
	}
}

function onCreateList(listId: string) {
	void toggle(listId);
}
</script>

<template>
	<USlideover
		v-if="isDesktop"
		v-model:open="open"
		title="Save to list"
		description="Toggle lists for this title"
		:ui="browsingSlideoverUi">
		<template #body>
			<ListPickerBody
				:lists="flyoutLists"
				:is-member="(id) => isInList(id, moviePayload.id, defaultMediaType(moviePayload.mediaType))"
				@toggle="toggle"
				@create="createOpen = true" />
		</template>
	</USlideover>
	<UDrawer
		v-else
		v-model:open="open"
		title="Save to list"
		:dismissible="true"
		:ui="browsingDrawerUi">
		<template #body>
			<ListPickerBody
				class="py-4"
				:lists="flyoutLists"
				:is-member="(id) => isInList(id, moviePayload.id, defaultMediaType(moviePayload.mediaType))"
				@toggle="toggle"
				@create="createOpen = true" />
		</template>
	</UDrawer>
	<CreateListModal
		v-model:open="createOpen"
		:use-drawer="!isDesktop"
		@created="onCreateList" />
</template>
