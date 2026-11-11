<script setup lang="ts">
import { PROFILE_IMAGE_URL } from "~/constants/movie";
import type { DetailCastMember } from "~/types/detailCast";

const props = withDefaults(
	defineProps<{
		member: DetailCastMember;
		layout?: "stacked" | "horizontal";
		tone?: "default" | "raised";
	}>(),
	{ layout: "horizontal", tone: "default" },
);

const cardBgClass = computed(() =>
	props.tone === "raised" ? "bg-surface-popover" : "bg-surface-inset",
);

const photoWellClass = "bg-surface-elevated";

const nameTextClass =
	"w-full max-w-full text-base font-medium leading-snug text-fg-default [overflow-wrap:anywhere]";
const characterTextClass =
	"w-full max-w-full mt-0.5 text-sm leading-snug text-fg-muted [overflow-wrap:anywhere]";
</script>

<template>
	<div
		v-if="layout === 'horizontal'"
		class="flex min-w-0 w-full max-w-full items-stretch gap-2 overflow-hidden rounded-lg"
		:class="cardBgClass">
		<div
			class="flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-l-lg sm:h-24 sm:w-16"
			:class="photoWellClass">
			<img
				v-if="member.profilePath"
				:src="`${PROFILE_IMAGE_URL}${member.profilePath}`"
				:alt="member.name"
				width="185"
				height="278"
				loading="lazy"
				decoding="async"
				class="h-full w-full object-cover">
			<UIcon
				v-else
				name="i-heroicons-user"
				class="size-10 shrink-0 text-fg-muted"
				aria-hidden="true" />
		</div>
		<div class="flex min-w-0 flex-1 flex-col justify-center py-2 pr-2">
			<p :class="nameTextClass">
				{{ member.name }}
			</p>
			<p v-if="member.character" :class="characterTextClass">
				{{ member.character }}
			</p>
		</div>
	</div>
	<div
		v-else
		class="flex h-full w-full min-w-0 max-w-full flex-col rounded-lg pt-2 text-center"
		:class="cardBgClass">
		<div
			class="mx-auto flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md"
			:class="photoWellClass">
			<img
				v-if="member.profilePath"
				:src="`${PROFILE_IMAGE_URL}${member.profilePath}`"
				:alt="member.name"
				width="185"
				height="278"
				loading="lazy"
				decoding="async"
				class="h-full w-full object-cover">
			<UIcon
				v-else
				name="i-heroicons-user"
				class="size-12 shrink-0 text-fg-muted"
				aria-hidden="true" />
		</div>
		<div class="flex w-full min-w-0 max-w-full flex-col justify-start p-2">
			<p :class="nameTextClass">
				{{ member.name }}
			</p>
			<p v-if="member.character" :class="characterTextClass">
				{{ member.character }}
			</p>
		</div>
	</div>
</template>
