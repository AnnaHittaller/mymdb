<template>
    <div class="pb-16">
        <Heading>Change theme color</Heading>
        <ColorSelector />
    </div>
    <div>
        <Heading>My profile</Heading>
        <div class="flex items-center flex-col py-8 gap-4 pb-8">
            <UAvatar src="" :alt="`${user?.displayName}`" size="3xl" class="avatar mb-4 border" />
            <div class="flex items-center gap-4">
                <p class="text-4xl">{{ user?.displayName }}</p>
                <NuxtLink to="./profile/update">
                    <UIcon name="i-heroicons-pencil-solid"
                        class="text-primary sm:text-3xl text-2xl hover:scale-125 transition" />
                </NuxtLink>
            </div>
            <p class="-mt-2 text-2xl text-fg-muted">{{ user?.email }}</p>
            <div class="flex max-[440px]:flex-col gap-4 mt-4">
                <UButton icon="i-heroicons-arrow-left-on-rectangle" label="Sign out" size="xl" class="text-2xl"
                    @click="logout" />

                <!-- TODO: add back delete profile button after fixing modal -->
                <!-- <UButton icon="i-heroicons-x-circle" variant="outline" label="Delete profile" size="xl" class="text-2xl"
                    @click="isOpen = true" /> -->
            </div>
            <!-- TODO: fix modal for mobile -->
            <UModal v-model:open="isOpen" :ui="{ content: 'relative top-[100px] border-2 border-red-500' }">
                <template #body>
                    <div class="p-4">
                        <h4 class="text-red-500 text-center text-lg mb-8">Are you sure you want to delete your profile?
                            This
                            action is irreversible and all
                            of your data will be lost. </h4>
                        <div
                            class="flex items-center justify-center gap-8 max-[300px]:flex-col max-[300px]:gap-4 max-[300px]:mb-4">
                            <UButton label="Cancel" size="md" class="text-md duration-150" color="success"
                                @click="isOpen = false" />
                            <UButton label="Yes, delete my profile" size="md" class="text-md duration-150" color="error"
                                @click="deleteCurrentUser" />
                        </div>
                    </div>
                </template>
            </UModal>
        </div>
    </div>
</template>

<script setup>
import { signOut } from 'firebase/auth';

definePageMeta({
    middleware: "auth"
})

const auth = useFirebaseAuth()
const user = useCurrentUser()

const isOpen = ref(false)

const logout = async () => {
    await signOut(auth)
    navigateTo('/login', { replace: true })
}

const deleteCurrentUser = async () => {
    // TODO: wire delete profile when modal UX is fixed
}

</script>
