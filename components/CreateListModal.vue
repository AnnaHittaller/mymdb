<script setup lang="ts">
import { browsingDrawerUi, browsingModalUi } from "~/constants/browsingOverlayUi";

const props = defineProps<{
	open: boolean;
	useDrawer?: boolean;
}>();

const emit = defineEmits<{
	"update:open": [value: boolean];
	created: [listId: string];
}>();

const { createList, lists } = useUserDocument();
const { notifyListError } = useListCapToast();
const toast = useToast();
const { t } = useI18n();

const name = ref("");
const saving = ref(false);

watch(
	() => props.open,
	(isOpen) => {
		if (isOpen) name.value = "";
	},
);

async function submit() {
	if (saving.value) return;
	saving.value = true;
	try {
		const beforeIds = new Set(lists.value.map((list) => list.id));
		await createList(name.value);
		const created = lists.value.find((list) => list.kind === "custom" && !beforeIds.has(list.id));
		emit("update:open", false);
		if (created) emit("created", created.id);
	} catch (error) {
		if (!notifyListError(error)) {
			toast.add({
				title: t("lists.createListError"),
				description: error instanceof Error ? error.message : t("lists.createListErrorHint"),
				color: "error",
			});
		}
	} finally {
		saving.value = false;
	}
}
</script>

<template>
	<UModal
		v-if="!useDrawer"
		:open="open"
		:title="$t('lists.createNewList')"
		:ui="browsingModalUi"
		@update:open="emit('update:open', $event)">
		<template #body>
			<UInput
				v-model="name"
				size="xl"
				:placeholder="$t('lists.listNamePlaceholder')"
				:maxlength="60"
				autofocus
				:ui="{ base: 'text-base' }"
				@keydown.enter.prevent="submit" />
		</template>
		<template #footer>
			<div class="flex w-full justify-end gap-2">
				<UButton variant="outline" size="xl" :label="$t('common.cancel')" @click="emit('update:open', false)" />
				<UButton size="xl" :label="$t('common.create')" :loading="saving" @click="submit" />
			</div>
		</template>
	</UModal>
	<UDrawer
		v-else
		:open="open"
		:title="$t('lists.createNewList')"
		:ui="browsingDrawerUi"
		@update:open="emit('update:open', $event)">
		<template #body>
			<div class="flex flex-col gap-4 p-4">
				<UInput
					v-model="name"
					size="xl"
					:placeholder="$t('lists.listNamePlaceholder')"
					:maxlength="60"
					:ui="{ base: 'text-base' }"
					@keydown.enter.prevent="submit" />
				<UButton block size="xl" :label="$t('common.create')" :loading="saving" @click="submit" />
			</div>
		</template>
	</UDrawer>
</template>
