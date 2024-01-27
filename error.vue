<script setup lang="ts">
const props = defineProps({
    error: Object
})

const loading = ref(false)

const handleError = () => {
    loading.value = true
    clearError({ redirect: '/' })
        .finally(() => loading.value = false)
}
</script>

<template>
        <div class="flex flex-col items-center justify-center h-[100dvh]" v-if="error">

                <h1 class="text-7xl mb-8" v-if="error.statusCode !== 404">Ooops</h1>
                <p class="text-7xl mb-8" v-if="error.statusCode !== 404">{{ error.message }}</p>
                <p class="text-7xl mb-8" v-if="error.statusCode === 404">{{ error.statusCode }} </p>
                <p class="text-4xl">It looks like something broke.</p>
                <p class="text-4xl mb-4">Sorry about that.</p>
           
            <UButton @click="handleError" label="Back to homepage" size="xl" class="text-2xl" :loading="loading" />
        </div>

</template>