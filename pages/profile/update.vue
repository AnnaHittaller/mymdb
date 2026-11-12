<script setup lang="ts">
definePageMeta({
	middleware: "auth",
});

await navigateTo({ path: "/profile", query: { edit: "username" } }, { replace: true });
</script>

<template>
	<div />
</template>
