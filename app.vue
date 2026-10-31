<script setup>

provideUserDocument()

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
    <UApp :toaster="{ duration: 5000, progress: true, expand: false }">
        <NuxtLoadingIndicator />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>

<style></style>
