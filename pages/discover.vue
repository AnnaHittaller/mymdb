<script setup lang="ts">
definePageMeta({
	middleware: "auth",
});

const route = useRoute();

await navigateTo(
	{ path: "/browse", query: route.query },
	{ redirectCode: 301, replace: true },
);
</script>

<template>
	<div />
</template>
