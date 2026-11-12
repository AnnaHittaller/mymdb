<script setup lang="ts">
definePageMeta({
	middleware: "auth",
});

await navigateTo({ path: "/profile" }, { replace: true });
</script>

<template>
	<div />
</template>
