<script setup>

</script>

<template>
    <footer>
        <nav class="flex justify-evenly items-center">
            <NuxtLink to="/" class="">
                <UIcon name="i-heroicons-home" class="text-primary" />
            </NuxtLink>
            <NuxtLink to="/">
                <UIcon name="i-heroicons-list-bullet-20-solid" class="text-primary" />
            </NuxtLink>
            <NuxtLink to="/">
                <UIcon name="i-heroicons-star-solid" class="text-primary" />
            </NuxtLink>
            <NuxtLink to="/">
                <UIcon name="i-heroicons-ellipsis-vertical-20-solid" class="text-primary" />
            </NuxtLink>
        </nav>
    </footer>
</template>

<style>
footer a span {
    font-size: 1.5rem;
}

footer a:hover {
    filter: drop-shadow(0 0 2px rgba(255, 30, 30, 1));
}
</style>