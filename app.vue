<script setup>

const userDocument = provideUserDocument()
useLegacyMediaTypeMigration(userDocument)
useScrollbarGutter()

// Start trending with the session. server: false so other pages are not held for this request.
useTrendingHero({ lazy: true, server: false })

useHead({
    bodyAttrs: {
        class: 'bg-surface-page text-fg-default'
    },
    title: 'MyMDb',
    meta: [
        { name: 'description', content: 'Keep your movie and show must-watch list always up-to-date.' }
    ],
})

</script>

<template>
    <UApp
        :scroll-body="false"
        :toaster="{ duration: 5000, progress: true, expand: false }">
        <AppComputedStyle />
       <!-- <NuxtLoadingIndicator color="var(--color-accent)" /> -->
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>
