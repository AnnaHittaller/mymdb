<template>
    <div class="flex min-h-screen flex-col px-8 pb-8 pt-16">
        <Header />
        <AppOfflineBanner />
        <slot />
        <p class="mt-auto pt-10 text-center text-sm">
            <NuxtLink to="/legal" class="text-fg-muted hover:text-primary">Legal &amp; privacy</NuxtLink>
        </p>
    </div>
</template>