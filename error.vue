<script setup>
const error = useError();

const handleError = () => {
    clearError({
        redirect: '/',
    });
};
</script>

<template>
    <NuxtLayout>
        <div class="flex flex-col items-center justify-center">
            <template v-if="error.statusCode === 404">
                <h1>404!</h1>
                <p>Sorry, that page doesn't exist.</p>
            </template>
            <template v-else>
                <h1>Ooops</h1>
                <p><strong>{{ error.message }}</strong></p>
                <p>It looks like something broke.</p>
                <p>Sorry about that.</p>
            </template>
            <p>
                Go back to the homepage.
                <UButton @click="handleError" label="Back to homepage" />
            </p>
        </div>
    </NuxtLayout>
</template>