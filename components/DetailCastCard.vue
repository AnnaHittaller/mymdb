<script setup lang="ts">
import { PROFILE_IMAGE_URL } from "~/constants/movie";
import type { DetailCastMember } from "~/types/detailCast";

defineProps<{
	member: DetailCastMember;
}>();

const nameTextClass =
	"w-full max-w-full text-sm font-medium leading-tight text-fg-default [overflow-wrap:anywhere]";
const characterTextClass =
	"w-full max-w-full mt-0.5 text-xs leading-snug text-fg-muted [overflow-wrap:anywhere]";
</script>

<template>
	<figure class="flex w-24 shrink-0 flex-col items-center text-center">
		<div
			class="flex size-20 items-center justify-center overflow-hidden rounded-full bg-surface-elevated">
			<img
				v-if="member.profilePath"
				:src="`${PROFILE_IMAGE_URL}${member.profilePath}`"
				:alt="member.name"
				width="185"
				height="278"
				loading="lazy"
				decoding="async"
				class="size-full object-cover">
			<UIcon
				v-else
				name="i-heroicons-user"
				class="size-8 text-fg-muted"
				aria-hidden="true" />
		</div>
		<figcaption class="mt-2 w-full">
			<p :class="nameTextClass">
				{{ member.name }}
			</p>
			<p v-if="member.character" :class="characterTextClass">
				as {{ member.character }}
			</p>
		</figcaption>
	</figure>
</template>
