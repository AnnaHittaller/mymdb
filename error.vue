<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
    error: NuxtError
}>()

const loading = ref(false)

const heading = computed(() =>
    props.error.statusCode === 404 ? 'Page not found' : 'Something went wrong'
)

const detail = computed(() => {
    const message = props.error.message?.trim()
    if (!message) return ''

    const path = message.replace(/^Page not found:\s*/i, '')
    if (!path || path === heading.value) return ''
    return path
})

const handleError = () => {
    loading.value = true
    clearError({ redirect: '/' })
        .finally(() => loading.value = false)
}
</script>

<template>
    <div
        v-if="error"
        class="flex min-h-[100dvh] flex-col items-center justify-center bg-surface-page px-6 text-center text-fg-default"
    >
        <p class="text-7xl font-semibold tracking-tight tabular-nums">{{ error.statusCode }}</p>
        <h1 class="mt-4 text-3xl font-semibold">{{ heading }}</h1>
        <p v-if="detail" class="mt-3 max-w-lg text-base break-all text-fg-muted">{{ detail }}</p>
        <p class="mt-8 text-xl text-fg-muted">It looks like something broke.</p>
        <p class="mb-6 text-xl text-fg-muted">Sorry about that.</p>
        <UButton @click="handleError" label="Back to homepage" size="xl" :loading="loading" />
    </div>
</template>
