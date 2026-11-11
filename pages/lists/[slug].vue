<script setup lang="ts">
definePageMeta({
	middleware: "auth",
});

const route = useRoute();
const { listById, lists } = useUserDocument();

const slug = computed(() => String(route.params.slug));

const list = computed(() => lists.value.find((row) => row.id === slug.value));

watchEffect(() => {
	if (lists.value.length > 0 && !list.value) {
		throw createError({ statusCode: 404, statusMessage: "List not found" });
	}
});
</script>

<template>
	<ListDetailPage v-if="list" :list="list" />
</template>
