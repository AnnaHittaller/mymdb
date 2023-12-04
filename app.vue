<script setup>

useHead({
    bodyAttrs: {
        class: 'bg-zinc-50 dark:bg-zinc-800'
    }
})

</script>

<template>
    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<style>
body {
    padding: 1rem;
}
</style>