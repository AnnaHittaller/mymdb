<script setup lang="ts">
import type { MediaType } from "~/types/catalog";

const model = defineModel<MediaType>({ required: true });

function segmentClass(active: boolean) {
	return [
		"flex-1 cursor-pointer rounded-[6px] px-3 py-2 text-center text-base font-medium transition-colors",
		active
			? "bg-primary text-inverted"
			: "text-fg-muted hover:bg-surface-hover hover:text-fg-default",
	].join(" ");
}
</script>

<template>
	<div
		class="flex w-full gap-0.5 rounded-[8px] border border-border-default bg-surface-inset p-0.5 sm:w-48"
		role="group"
		aria-label="Discover movies or shows">
		<button
			type="button"
			:class="segmentClass(model === 'movie')"
			:aria-pressed="model === 'movie'"
			@click="model = 'movie'">
			Movies
		</button>
		<button
			type="button"
			:class="segmentClass(model === 'tv')"
			:aria-pressed="model === 'tv'"
			@click="model = 'tv'">
			Shows
		</button>
	</div>
</template>
