<script setup>

provideUserDocument()

useHead({
    bodyAttrs: {
        class: 'bg-surface-page text-fg-default'
    },
    title: 'MyMDb',
    meta: [
        { name: 'description', content: 'Keep your movie must-watch list always up-to-date.' }
    ],
})

</script>

<template>
    <UApp :toaster="{ duration: 5000, progress: true, expand: false }">
        <AppComputedStyle />
       <!-- <NuxtLoadingIndicator color="var(--color-accent)" /> -->
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>
