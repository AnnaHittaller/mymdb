<script setup lang="ts">
import { browsingDrawerUi, browsingSlideoverUi } from "~/constants/browsingOverlayUi";
import type { DetailCastMember } from "~/types/detailCast";

const INITIAL_VISIBLE = 6;

const props = defineProps<{
	cast: DetailCastMember[];
}>();

const { t } = useI18n();

const fullCastOpen = ref(false);
const isDesktop = useIsDesktop();

const previewCast = computed(() => props.cast.slice(0, INITIAL_VISIBLE));
const hasMore = computed(() => props.cast.length > INITIAL_VISIBLE);

const overlayTitle = computed(() => t("detail.fullCast"));
const overlayDescription = computed(() =>
	props.cast.length === 1
		? t("detail.castMemberOne")
		: t("detail.castMemberCount", { count: props.cast.length }),
);
</script>

<template>
	<section v-if="cast.length > 0" class="flex min-w-0 flex-col gap-3">
		<div class="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 mb-4">
			<Heading flush tier="section" class="min-w-0 flex-1">
				{{ $t("detail.cast") }}
			</Heading>
			<UButton
				v-if="hasMore"
				variant="outline"
				color="primary"
				size="sm"
				class="shrink-0 text-base"
				:label="$t('detail.seeFullCast')"
				@click="fullCastOpen = true" />
		</div>
		<div
			class="grid gap-4 justify-items-center [grid-template-columns:repeat(auto-fill,minmax(6rem,1fr))]">
			<DetailCastCard
				v-for="member in previewCast"
				:key="member.creditId"
				:member="member" />
		</div>

		<USlideover
			v-if="isDesktop"
			v-model:open="fullCastOpen"
			:title="overlayTitle"
			:description="overlayDescription"
			:ui="browsingSlideoverUi">
			<template #body>
				<div
					class="grid gap-4 justify-items-center [grid-template-columns:repeat(auto-fill,minmax(6rem,1fr))]">
					<DetailCastCard
						v-for="member in cast"
						:key="member.creditId"
						:member="member" />
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
				<div
					class="grid gap-4 py-4 justify-items-center [grid-template-columns:repeat(auto-fill,minmax(6rem,1fr))]">
					<DetailCastCard
						v-for="member in cast"
						:key="member.creditId"
						:member="member" />
				</div>
			</template>
		</UDrawer>
	</section>
</template>
