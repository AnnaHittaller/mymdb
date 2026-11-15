<script setup lang="ts">
import type { UserList } from "~/types/list";
import { IMPORT_AS_NEW_LIST } from "~/domain/share/importSharedListSnapshot";

const selected = defineModel<string>("selected", { required: true });

defineProps<{
	snapshotName: string;
	customLists: UserList[];
}>();

function rowClass(active: boolean) {
	return active
		? "border-primary bg-primary/5 text-fg-default hover:bg-primary/10"
		: "border-border-default text-fg-default hover:border-primary/60 hover:bg-surface-overlay";
}
</script>

<template>
	<div class="flex flex-col gap-2">
		<button
			type="button"
			class="cursor-pointer rounded-lg border px-3 py-3 text-left transition-colors"
			:class="rowClass(selected === IMPORT_AS_NEW_LIST)"
			@click="selected = IMPORT_AS_NEW_LIST">
			<span class="block text-lg font-medium">{{ snapshotName }}</span>
			<span class="block text-base text-fg-muted">{{ $t('lists.importAsNewList') }}</span>
		</button>
		<button
			v-for="list in customLists"
			:key="list.id"
			type="button"
			class="cursor-pointer rounded-lg border px-3 py-3 text-left text-lg font-medium transition-colors"
			:class="rowClass(selected === list.id)"
			@click="selected = list.id">
			{{ list.name }}
		</button>
	</div>
</template>