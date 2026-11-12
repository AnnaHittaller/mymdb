<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";

definePageMeta({
	middleware: "auth",
});

const createOpen = ref(false);
const isDesktop = useMediaQuery("(min-width: 768px)");
</script>

<template>
	<div class="min-w-0 max-w-full">
		<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
			<Heading flush>Your lists</Heading>
			<UButton
				variant="outline"
				size="lg"
				label="Add new list"
				icon="i-heroicons-plus"
				:ui="{ leadingIcon: 'size-5' }"
				@click="createOpen = true" />
		</div>
		<UserListsSection :limit="0" :show-heading="false" />
		<CreateListModal v-model:open="createOpen" :use-drawer="!isDesktop" />
	</div>
</template>
