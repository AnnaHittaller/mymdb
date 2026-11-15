<script setup lang="ts">
import memeIcons from "@iconify-json/streamline-memes/icons.json";
import { getIconData, iconToHTML, iconToSVG } from "@iconify/utils";

const props = defineProps<{
	names: readonly string[];
}>();

function markup(name: string) {
	const data = getIconData(memeIcons, name);
	if (!data) {
		return "";
	}
	const built = iconToSVG(data);
	return iconToHTML(built.body, built.attributes);
}
</script>

<template>
	<div
		class="flex min-h-28 max-w-md items-end justify-center sm:min-h-32"
		:class="props.names.length > 1 ? 'gap-10 sm:gap-12' : 'gap-1 sm:gap-2'"
		aria-hidden="true"
	>
		<span
			v-for="name in props.names"
			:key="name"
			class="error-meme-icon inline-flex size-28 shrink-0 text-fg-default sm:size-32"
			v-html="markup(name)"
		/>
	</div>
</template>

<style scoped>
.error-meme-icon :deep(svg) {
	display: block;
	height: 100%;
	width: 100%;
}
</style>
