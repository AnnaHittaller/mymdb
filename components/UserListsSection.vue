<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { listPath } from "~/domain/user-document/listHelpers";
import { systemListDisplayName } from "~/utils/systemListDisplayName";

const { t } = useI18n();

const props = withDefaults(
	defineProps<{
		/** 0 = show all */
		limit?: number;
		showHeading?: boolean;
		showSeeAll?: boolean;
	}>(),
	{ limit: 6, showHeading: true, showSeeAll: false },
);

const { lists, moviesInList } = useUserDocument();

const visibleLists = computed(() =>
	props.limit > 0 ? lists.value.slice(0, props.limit) : lists.value,
);

const createOpen = ref(false);
const isDesktop = useMediaQuery("(min-width: 768px)");
const { isOffline } = useOfflineReady();
</script>

<template>
	<div class="min-w-0 max-w-full pb-8">
		<div
			v-if="showHeading"
			class="mb-3 flex flex-wrap items-center justify-between gap-3 pt-4">
			<Heading flush>{{ $t('lists.yourLists') }}</Heading>
			<div class="flex shrink-0 flex-wrap items-center gap-2">
				<UButton
					v-if="showSeeAll && lists.length > limit"
					variant="outline"
					size="lg"
					:label="$t('lists.seeAll')"
					to="/lists" />
				<UButton
					variant="outline"
					size="lg"
					:label="$t('lists.addNew')"
					icon="i-heroicons-plus"
					:disabled="isOffline"
					:ui="{ leadingIcon: 'size-5' }"
					@click="createOpen = true" />
			</div>
		</div>
		<div class="flex flex-col gap-3 md:grid md:grid-cols-3 md:items-stretch md:gap-4">
			<MovieCollectionCard
				v-for="list in visibleLists"
				:key="list.id"
				:title="systemListDisplayName(list, t)"
				:to="listPath(list, lists)"
				:list-id="list.id"
				:movies="moviesInList(list.id)" />
		</div>
		<CreateListModal v-model:open="createOpen" :use-drawer="!isDesktop" />
	</div>
</template>
