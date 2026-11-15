<script setup lang="ts">
import type { DetailFact, DetailJob } from "~/types/detailFact";

defineProps<{
	facts: DetailFact[];
	jobs: DetailJob[];
}>();
</script>

<template>
	<div
		v-if="facts.length > 0 || jobs.length > 0"
		class="flex flex-wrap items-center gap-x-3 gap-y-2 text-base leading-none py-4">
		<span
			v-for="fact in facts"
			:key="`${fact.icon}-${fact.text}`"
			class="inline-flex items-center gap-1.5 leading-none">
			<UIcon
				:name="fact.icon"
				class="block size-5 shrink-0 -translate-y-0.5 leading-none text-primary" />
			<span class="leading-none text-fg-default">{{ fact.text }}</span>
		</span>
		<span
			v-for="job in jobs"
			:key="`${job.icon}-${job.text}`"
			class="inline-flex items-center gap-1.5 leading-none">
			<span aria-hidden="true" class="leading-none text-fg-subtle">|</span>
			<UIcon
				:name="job.icon"
				class="block size-5 shrink-0 -translate-y-0.5 leading-none text-primary" />
			<span class="leading-none text-fg-default">{{ job.text }}</span>
		</span>
	</div>
</template>
