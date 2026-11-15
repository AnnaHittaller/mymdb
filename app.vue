<script setup>

const userDocument = provideUserDocument()
useLocaleProfileSync(userDocument)
useLegacyMediaTypeMigration(userDocument)
useScrollbarGutter()

const uiLocale = useNuxtUiLocale()
const { t, locale } = useI18n()
useLocaleHead({ addDirAttribute: true, addSeoAttributes: true })

useHead({
    title: () => t('meta.title'),
    meta: [
        { name: 'description', content: () => t('meta.description') },
    ],
})

// Start trending with the session. server: false so other pages are not held for this request.
useTrendingHero({ lazy: true, server: false })

usePwaUpdate()
useOfflineReady()

useHead({
    bodyAttrs: {
        class: 'bg-surface-page text-fg-default',
        lang: () => locale.value,
    },
})

</script>

<template>
    <UApp
        :locale="uiLocale"
        :scroll-body="false"
        :toaster="{ duration: 5000, progress: true, expand: false }">
        <NuxtPwaManifest />
        <AppComputedStyle />
       <!-- <NuxtLoadingIndicator color="var(--color-accent)" /> -->
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>
