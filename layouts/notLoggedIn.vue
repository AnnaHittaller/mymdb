<template>
    <div class="flex min-h-screen flex-col px-8 pb-8 pt-16">
        <Header />
        <AppOfflineBanner />
        <slot />
        <p class="mt-auto pt-10 text-center text-sm">
            <NuxtLink to="/legal" class="text-fg-muted hover:text-primary">{{ $t('profile.legalLink') }}</NuxtLink>
        </p>
    </div>
</template>