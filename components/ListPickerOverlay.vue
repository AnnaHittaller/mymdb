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

const baselineMembership = ref<Set<string>>(new Set());
const pendingMembership = ref<Set<string>>(new Set());

const resolvedMediaType = computed(() =>
	defaultMediaType(props.moviePayload.mediaType ?? props.mediaType),
);

function membershipSnapshot(): Set<string> {
	const id = props.moviePayload.id;
	const mediaType = resolvedMediaType.value;
	const next = new Set<string>();
	for (const list of lists.value) {
		if (isInList(list.id, id, mediaType)) {
			next.add(list.id);
		}
	}
	return next;
}

function resetPendingMembership() {
	const snap = membershipSnapshot();
	baselineMembership.value = snap;
	pendingMembership.value = new Set(snap);
}

function togglePending(listId: string) {
	const next = new Set(pendingMembership.value);
	if (next.has(listId)) {
		next.delete(listId);
	} else {
		next.add(listId);
	}
	pendingMembership.value = next;
}

function isMemberPending(listId: string) {
	return pendingMembership.value.has(listId);
}

const flushing = ref(false);

async function flushPendingMembership() {
	if (flushing.value) return;
	flushing.value = true;
	try {
		const base = baselineMembership.value;
		const pending = pendingMembership.value;
		const touched = new Set([...base, ...pending]);
		for (const listId of touched) {
			if (base.has(listId) === pending.has(listId)) continue;
			try {
				await toggleListMembership(listId, props.moviePayload);
			} catch (error) {
				notifyListError(error);
			}
		}
	} finally {
		flushing.value = false;
	}
}

watch(open, async (isOpen, wasOpen) => {
	if (isOpen) {
		resetPendingMembership();
		return;
	}
	if (wasOpen) {
		await flushPendingMembership();
	}
});

function onCreateList(listId: string) {
	const next = new Set(pendingMembership.value);
	next.add(listId);
	pendingMembership.value = next;
}
</script>

<template>
	<USlideover
		v-if="isDesktop"
		v-model:open="open"
		:title="$t('lists.saveToList')"
		:description="$t('lists.saveToListDescription')"
		:ui="browsingSlideoverUi">
		<template #body>
			<ListPickerBody
				:lists="flyoutLists"
				:is-member="isMemberPending"
				@toggle="togglePending"
				@create="createOpen = true" />
		</template>
	</USlideover>
	<UDrawer
		v-else
		v-model:open="open"
		:title="$t('lists.saveToList')"
		:dismissible="true"
		:ui="browsingDrawerUi">
		<template #body>
			<ListPickerBody
				class="py-4"
				:lists="flyoutLists"
				:is-member="isMemberPending"
				@toggle="togglePending"
				@create="createOpen = true" />
		</template>
	</UDrawer>
	<CreateListModal
		v-model:open="createOpen"
		:use-drawer="!isDesktop"
		@created="onCreateList" />
</template>
