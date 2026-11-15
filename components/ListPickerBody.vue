<script setup lang="ts">
import type { UserList } from "~/types/list";
import { systemListDisplayName } from "~/utils/systemListDisplayName";

const { t } = useI18n();

defineProps<{
	lists: UserList[];
	isMember: (listId: string) => boolean;
}>();

const emit = defineEmits<{
	toggle: [listId: string];
	create: [];
}>();
</script>

<template>
	<div class="flex flex-col gap-2">
		<button
			v-for="list in lists"
			:key="list.id"
			type="button"
			class="cursor-pointer rounded-lg border px-3 py-3 text-left text-lg font-medium transition-colors"
			:class="
				isMember(list.id)
					? 'border-primary bg-primary/5 text-fg-default hover:bg-primary/10'
					: 'border-border-default text-fg-default hover:border-primary/60 hover:bg-surface-overlay'
			"
			@click="emit('toggle', list.id)">
			{{ systemListDisplayName(list, t) }}
		</button>
		<UButton
			variant="outline"
			block
			size="xl"
			class="mt-2"
			:label="$t('lists.createNewList')"
			icon="i-heroicons-plus"
			:ui="{ leadingIcon: 'size-5' }"
			@click="emit('create')" />
	</div>
</template>
