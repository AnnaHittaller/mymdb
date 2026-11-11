<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { browsingDrawerUi, browsingSlideoverUi } from "~/constants/browsingOverlayUi";
import type { DetailCastMember } from "~/types/detailCast";

const INITIAL_VISIBLE = 6;

const props = defineProps<{
	cast: DetailCastMember[];
}>();

const fullCastOpen = ref(false);
const isDesktop = useMediaQuery("(min-width: 768px)");

const previewCast = computed(() => props.cast.slice(0, INITIAL_VISIBLE));
const hasMore = computed(() => props.cast.length > INITIAL_VISIBLE);

const overlayTitle = "Full cast";
const overlayDescription = computed(() =>
	props.cast.length === 1
		? "1 cast member"
		: `${props.cast.length} cast members`,
);
</script>

<template>
	<div v-if="cast.length > 0" class="pt-4">
		<div class="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 pb-4">
			<Heading flush class="min-w-0 flex-1">
				Starring
			</Heading>
			<UButton
				v-if="hasMore"
				variant="outline"
				color="primary"
				size="sm"
				class="shrink-0 text-base"
				label="See full cast"
				@click="fullCastOpen = true" />
		</div>
		<div class="flex flex-wrap gap-3">
			<div
				v-for="member in previewCast"
				:key="member.creditId"
				class="w-full max-w-[15.5rem] shrink-0 sm:w-[15.5rem]">
				<DetailCastCard :member="member" layout="horizontal" />
			</div>
		</div>

		<USlideover
			v-if="isDesktop"
			v-model:open="fullCastOpen"
			:title="overlayTitle"
			:description="overlayDescription"
			:ui="browsingSlideoverUi">
			<template #body>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 [&>*]:min-w-0">
					<DetailCastCard
						v-for="member in cast"
						:key="member.creditId"
						:member="member"
						layout="stacked"
						tone="raised" />
				</div>
			</template>
		</USlideover>
		<UDrawer
			v-else
			v-model:open="fullCastOpen"
			:title="overlayTitle"
			:description="overlayDescription"
			:dismissible="true"
			:ui="browsingDrawerUi">
			<template #body>
				<div class="grid grid-cols-2 gap-3 py-4 min-[400px]:grid-cols-3 min-[550px]:grid-cols-4 [&>*]:min-w-0">
					<DetailCastCard
						v-for="member in cast"
						:key="member.creditId"
						:member="member"
						layout="stacked"
						tone="raised" />
				</div>
			</template>
		</UDrawer>
	</div>
</template>
