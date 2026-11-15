<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		/** When true, omit bottom padding (use in toolbar rows with actions). */
		flush?: boolean;
		/** Page title vs in-page section (detail cast, gallery, etc.). */
		tier?: "title" | "section";
	}>(),
	{ flush: false, tier: "title" },
);

const tierClass = computed(() =>
	props.tier === "section"
		? "text-xl leading-none md:text-2xl"
		: "text-3xl leading-none md:text-4xl",
);
</script>

<template>
	<div :class="flush ? 'pb-0' : 'pb-4'">
		<h2
			class="relative mb-0 pl-4 before:absolute before:left-0 before:top-0 before:inline-block before:h-full before:w-1 before:bg-primary before:content-['']"
			:class="tierClass">
			<slot />
		</h2>
	</div>
</template>
