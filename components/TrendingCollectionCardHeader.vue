<script setup lang="ts">
const props = defineProps<{
	title: string;
	headerIcon: string;
	showSubtitle: boolean;
	subtitle?: string;
	showLeadingGenre: boolean;
	leadingGenre?: string;
	leadingGenreCaption: string;
	layout: "banner" | "compact";
}>();

const rootClass = computed(() =>
	props.layout === "banner"
		? "flex min-w-[12rem] max-w-sm shrink-0 flex-col gap-2"
		: "flex w-full items-start gap-2.5",
);

const iconClass = computed(() =>
	props.layout === "banner"
		? "size-8 shrink-0 text-primary"
		: "mt-1 size-8 shrink-0 text-primary",
);

const chevronClass = computed(() =>
	props.layout === "banner"
		? "pointer-events-none mt-1 shrink-0 group-hover:border-primary group-hover:text-primary"
		: "pointer-events-none shrink-0 group-hover:border-primary group-hover:text-primary",
);
</script>

<template>
	<div :class="rootClass">
		<UIcon
			:name="headerIcon"
			:class="iconClass"
			aria-hidden="true" />
		<div v-if="layout === 'compact'" class="min-w-0 flex-1">
			<p class="text-2xl font-semibold leading-tight text-fg-default @min-[400px]:text-3xl">
				{{ title }}
			</p>
			<p
				v-if="showSubtitle && subtitle"
				class="mt-2 text-base font-medium leading-snug text-fg-muted">
				{{ subtitle }}
			</p>
			<div
				v-else-if="showLeadingGenre && leadingGenre"
				class="mt-2 flex flex-wrap items-center gap-2">
				<span class="text-base font-medium text-fg-muted">{{ leadingGenreCaption }}</span>
				<UBadge
					variant="outline"
					color="neutral"
					size="md"
					class="border-primary/40 px-3 py-1 text-base font-medium text-fg-default"
					aria-hidden="true">
					{{ leadingGenre }}
				</UBadge>
			</div>
		</div>
		<template v-else>
			<p class="text-2xl font-semibold leading-tight text-fg-default @min-[400px]:text-3xl">
				{{ title }}
			</p>
			<p
				v-if="showSubtitle && subtitle"
				class="text-base font-medium leading-snug text-fg-muted">
				{{ subtitle }}
			</p>
			<div
				v-else-if="showLeadingGenre && leadingGenre"
				class="flex flex-wrap items-center gap-2">
				<span class="text-base font-medium text-fg-muted">{{ leadingGenreCaption }}</span>
				<UBadge
					variant="outline"
					color="neutral"
					size="md"
					class="border-primary/40 px-3 py-1 text-base font-medium text-fg-default"
					aria-hidden="true">
					{{ leadingGenre }}
				</UBadge>
			</div>
		</template>
		<UButton
			variant="iconbutton"
			color="custom"
			size="icon"
			:square="layout === 'compact'"
			icon="i-heroicons-arrow-right-20-solid"
			tabindex="-1"
			aria-hidden="true"
			:class="chevronClass"
			:ui="{ leadingIcon: 'size-6' }" />
	</div>
</template>