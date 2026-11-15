<script setup lang="ts">
import type { LibraryMediaFilter } from "~/utils/filterLibraryMovies";

const model = defineModel<LibraryMediaFilter>({ required: true });

function segmentClass(active: boolean) {
	return [
		"flex-1 cursor-pointer rounded-[6px] px-2 py-2 text-center text-base font-medium transition-colors",
		active
			? "bg-primary text-inverted"
			: "text-fg-muted hover:bg-surface-hover hover:text-fg-default",
	].join(" ");
}
</script>

<template>
	<div
		class="flex w-full min-w-0 gap-0.5 rounded-[8px] border border-border-default bg-surface-inset p-0.5"
		role="group"
		:aria-label="$t('lists.filterMediaAria')">
		<button
			type="button"
			:class="segmentClass(model === 'all')"
			:aria-pressed="model === 'all'"
			@click="model = 'all'">
			{{ $t('common.all') }}
		</button>
		<button
			type="button"
			:class="segmentClass(model === 'movie')"
			:aria-pressed="model === 'movie'"
			@click="model = 'movie'">
			{{ $t('common.movies') }}
		</button>
		<button
			type="button"
			:class="segmentClass(model === 'tv')"
			:aria-pressed="model === 'tv'"
			@click="model = 'tv'">
			{{ $t('common.shows') }}
		</button>
	</div>
</template>