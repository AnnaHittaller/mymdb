<template>
    <div>
        <Heading>My Profile</Heading>
        <div class="flex items-center flex-col py-8 gap-4">
            <UAvatar src="" :ui="{ background: 'dark:bg-gray-900', placeholder: 'dark:text-primary' }" alt="User Name"
                size="3xl" class="avatar border mb-4" />
            <p class="text-4xl">John Smith</p>
            <p class="text-2xl text-zinc-400">Johnny65487</p>
            <p class="text-2xl -mt-4 text-zinc-400">user@example.com</p>
            <UButton icon="" label="Edit my data" size="xl" class="text-2xl mt-4" />
            <UButton icon="" variant="outline" label="Delete profile" size="xl"
                class="text-2xl mt-16" />
        </div>
    </div>
</template>

<script setup>

</script>

<style scoped>

</style>