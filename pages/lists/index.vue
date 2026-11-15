<script setup lang="ts">
definePageMeta({
	middleware: "auth",
});

const createOpen = ref(false);
const isDesktop = useIsDesktop();
const { isOffline } = useOfflineReady();
</script>

<template>
	<div class="min-w-0 max-w-full">
		<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
			<Heading flush>{{ $t('lists.yourLists') }}</Heading>
			<UButton
				variant="outline"
				size="lg"
				:label="$t('lists.addNew')"
				icon="i-heroicons-plus"
				:disabled="isOffline"
				:ui="{ leadingIcon: 'size-5' }"
				@click="createOpen = true" />
		</div>
		<UserListsSection :limit="0" :show-heading="false" />
		<CreateListModal v-model:open="createOpen" :use-drawer="!isDesktop" />
	</div>
</template>
