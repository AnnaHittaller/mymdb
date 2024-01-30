<script setup>

useHead({
    bodyAttrs: {
        class: 'bg-zinc-50 dark:bg-zinc-800'
    },
    title: 'MyMDb',
    meta: [
        { name: 'description', content: 'Keep your movie must-watch list always up-to-date.' }
    ],
})

</script>

<template>
        <NuxtLoadingIndicator />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
</template>

<style></style>