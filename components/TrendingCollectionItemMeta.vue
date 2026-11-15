<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		rating: string;
		year: string;
		genre: string;
		releaseBadge: string;
		showReleaseDate: boolean;
		align?: "start" | "center";
	}>(),
	{ align: "start" },
);

const hasRating = computed(() => props.rating !== "N/A");

const metaLineClass = computed(() =>
	props.align === "center"
		? "flex flex-wrap items-center gap-x-1 gap-y-0.5 text-base leading-snug text-fg-muted justify-center text-center"
		: "flex flex-wrap items-center gap-x-1 gap-y-0.5 text-base leading-snug text-fg-muted",
);

const dotClass = computed(() => (props.align === "center" ? "" : "text-fg-muted"));

const genreClass = computed(() =>
	props.align === "center" ? "line-clamp-1" : "",
);
</script>

<template>
	<div
		v-if="showReleaseDate"
		:class="align === 'center'
			? 'flex min-w-0 w-full flex-1 flex-col items-center gap-1.5'
			: 'flex min-w-0 flex-1 flex-col gap-1.5'">
		<p :class="metaLineClass">
			<span class="inline-flex items-center gap-1">
				<UIcon
					name="i-heroicons-star-20-solid"
					class="block size-5 shrink-0 -translate-y-[2px] text-rating"
					aria-hidden="true" />
				<span class="text-base leading-none tabular-nums">{{ rating }}</span>
			</span>
			<template v-if="genre">
				<span :class="dotClass" aria-hidden="true">·</span>
				<span :class="genreClass">{{ genre }}</span>
			</template>
		</p>
		<span
			v-if="releaseBadge"
			class="mt-auto inline-flex w-fit rounded-md bg-primary px-2 py-1 text-base font-medium leading-snug text-inverted">
			{{ releaseBadge }}
		</span>
	</div>
	<p v-else :class="metaLineClass">
		<template v-if="hasRating">
			<span class="inline-flex items-center gap-1">
				<UIcon
					name="i-heroicons-star-20-solid"
					class="block size-5 shrink-0 -translate-y-[2px] text-rating"
					aria-hidden="true" />
				<span class="text-base leading-none tabular-nums">{{ rating }}</span>
			</span>
		</template>
		<template v-if="year">
			<span v-if="hasRating" :class="dotClass" aria-hidden="true">·</span>
			<span>{{ year }}</span>
		</template>
		<template v-if="genre">
			<span v-if="hasRating || year" :class="dotClass" aria-hidden="true">·</span>
			<span :class="genreClass">{{ genre }}</span>
		</template>
	</p>
</template>