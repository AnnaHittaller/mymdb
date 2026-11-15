<script setup lang="ts">
import { browsingDrawerUi, browsingSlideoverUi } from "~/constants/browsingOverlayUi";
import {
	formatImportSnapshotToast,
	IMPORT_AS_NEW_LIST,
	importSharedListSnapshot,
	resolveImportTargetListId,
} from "~/domain/share/importSharedListSnapshot";
import type { PublicPublishedListSnapshot } from "~/types/share";

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
	snapshot: PublicPublishedListSnapshot;
}>();

const { lists, isOnAnyList, moviesInList, toggleListMembership, createList } = useUserDocument();
const { notifyListError } = useListCapToast();
const toast = useToast();
const { t } = useI18n();
const isDesktop = useIsDesktop();

const selected = ref<string>(IMPORT_AS_NEW_LIST);
const importing = ref(false);

const customLists = computed(() => lists.value.filter((list) => list.kind === "custom"));

watch(open, (isOpen) => {
	if (isOpen) {
		selected.value = IMPORT_AS_NEW_LIST;
	}
});

async function onImport() {
	if (importing.value) return;
	importing.value = true;
	try {
		const targetListId = await resolveImportTargetListId(
			selected.value,
			props.snapshot.sourceListName,
			{
				createList,
				lists: () => lists.value,
			},
		);
		const result = await importSharedListSnapshot(targetListId, {
			items: props.snapshot.items,
			isOnAnyList,
			moviesInList,
			toggleListMembership,
			createList,
			lists: () => lists.value,
		});
		const message = formatImportSnapshotToast(result, t);
		toast.add({
			title: message.title,
			description: message.description,
			icon: "i-heroicons-check-circle",
			color: "success",
			duration: 8000,
		});
		open.value = false;
	} catch (error) {
		if (!notifyListError(error)) {
			toast.add({
				title: t("lists.importError"),
				description: error instanceof Error ? error.message : t("common.tryAgain"),
				color: "error",
			});
		}
	} finally {
		importing.value = false;
	}
}
</script>

<template>
	<USlideover
		v-if="isDesktop"
		v-model:open="open"
		:title="$t('lists.saveToMyLists')"
		:description="$t('lists.importChooseTarget')"
		:ui="browsingSlideoverUi">
		<template #body>
			<SharedListImportPickerBody
				v-model:selected="selected"
				:snapshot-name="snapshot.sourceListName"
				:custom-lists="customLists" />
		</template>
		<template #footer>
			<div class="flex w-full justify-end gap-2">
				<UButton variant="outline" size="lg" :label="$t('common.cancel')" @click="open = false" />
				<UButton size="lg" :label="$t('lists.import')" :loading="importing" @click="onImport" />
			</div>
		</template>
	</USlideover>
	<UDrawer
		v-else
		v-model:open="open"
		:title="$t('lists.saveToMyLists')"
		:dismissible="!importing"
		:ui="browsingDrawerUi">
		<template #body>
			<div class="flex flex-col gap-4 px-4 pb-4">
				<SharedListImportPickerBody
					v-model:selected="selected"
					:snapshot-name="snapshot.sourceListName"
					:custom-lists="customLists" />
				<UButton block size="xl" :label="$t('lists.import')" :loading="importing" @click="onImport" />
			</div>
		</template>
	</UDrawer>
</template>