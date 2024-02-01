<script setup>
definePageMeta({
    middleware: "auth"
})
</script>

<template>
    <div>
        <Heading>Change theme color</Heading>
        <ColorSelector/>
    </div>
</template>