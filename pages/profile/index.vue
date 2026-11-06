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
                    <UIcon
                        name="i-heroicons-pencil-solid"
                        class="text-primary sm:text-3xl text-2xl hover:scale-125 transition"
                    />
                </NuxtLink>
            </div>
            <p class="-mt-2 text-2xl text-fg-muted">{{ user?.email }}</p>
            <div class="flex max-[440px]:flex-col gap-4 mt-4">
                <UButton
                    icon="i-heroicons-arrow-left-on-rectangle"
                    label="Sign out"
                    size="xl"
                    class="text-2xl"
                    @click="logout"
                />
                <UButton
                    icon="i-heroicons-x-circle"
                    variant="outline"
                    color="error"
                    label="Delete profile"
                    size="xl"
                    class="text-2xl"
                    @click="openDelete"
                />
            </div>
            <UModal
                v-model:open="isOpen"
                title="Delete profile"
                scrollable
                :dismissible="!deleting"
                :close="!deleting"
                description="This permanently deletes your account and every movie you saved. You cannot undo it."
                :ui="{ title: 'text-error', footer: 'justify-end flex-wrap' }"
            >
                <template v-if="needsPassword || errorMessage" #body>
                    <div class="space-y-4">
                        <UFormField v-if="needsPassword" label="Password" name="deletePassword" required>
                            <UInput
                                v-model="password"
                                type="password"
                                placeholder="Your account password"
                                size="lg"
                                :disabled="deleting"
                                @keyup.enter="deleteCurrentUser"
                            />
                        </UFormField>
                        <p v-if="errorMessage" class="text-sm text-error">{{ errorMessage }}</p>
                    </div>
                </template>
                <template #footer="{ close }">
                    <UButton label="Cancel" color="neutral" variant="outline" :disabled="deleting" @click="close" />
                    <UButton label="Yes, delete my profile" color="error" :loading="deleting" @click="deleteCurrentUser" />
                </template>
            </UModal>
        </div>
    </div>
</template>

<script setup lang="ts">
import { signOut } from 'firebase/auth'
import { googleAuthProvider } from '~/composables/googleAuthProvider'
import { accountNeedsPassword, deleteAccount, deleteFailureMessage } from '~/composables/deleteAccount'

definePageMeta({
    middleware: "auth"
})

const auth = useFirebaseAuth()
const db = useFirestore()
const user = useCurrentUser()

const isOpen = ref(false)
const deleting = ref(false)
const password = ref('')
const errorMessage = ref<string | undefined>()

const needsPassword = computed(() => (user.value ? accountNeedsPassword(user.value) : false))

function openDelete() {
    password.value = ''
    errorMessage.value = undefined
    isOpen.value = true
}

watch(isOpen, (open) => {
    if (!open) {
        password.value = ''
        errorMessage.value = undefined
    }
})

const logout = async () => {
    if (!auth) return
    await signOut(auth)
    navigateTo('/login', { replace: true })
}

const deleteCurrentUser = async () => {
    const current = user.value
    if (!current || !auth || deleting.value) return
    deleting.value = true
    errorMessage.value = undefined
    try {
        await deleteAccount(db, current, {
            password: password.value,
            googleProvider: googleAuthProvider,
        })
        isOpen.value = false
        await navigateTo('/login', { replace: true })
    } catch (error: unknown) {
        console.error(error)
        errorMessage.value = deleteFailureMessage(error)
    } finally {
        deleting.value = false
    }
}
</script>
