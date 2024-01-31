<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
const { getUser, updateUserName } = useFirestore()
const { currentUserPromise } = useFirebaseAuth()
const router = useRouter()

definePageMeta({
    middleware: "auth"
})

const userData: any = await currentUserPromise()
const user = await getUser(userData.uid)
console.log("User:", userData)

const schema = z.object({
    username: z.string().min(3, 'Must be at least 3 characters').max(30, "Too long - must be under 30 characters")
})

type Schema = z.output<typeof schema>

const state = reactive({
    username: user?.username,
    error: undefined,
    loading: false,
    success: false,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
    console.log("UPDATE EVENT REGISTER", event.data)
    state.loading = true
    try {
        await updateUserName(userData.uid, event.data.username)

        state.loading = false
        state.success = true

        setTimeout(() => {
            router.replace({ path: '/profile' })
        }, 4000)

    } catch (error: any) {
        console.error('Error submitting form:', error)
        state.error = error.message;
        state.loading = false
        state.success = false
    }
}

</script>

<template>
    <div class="max-w-[700px] w-full ">
        <Heading>Update user data</Heading>
        <UForm :schema="schema" :state="state" class="space-y-4 w-full pt-8 " @submit="onSubmit">

            <UFormGroup label="Username " name="username" required size="xl" class="pb-4">
                <UInput v-model.trim="state.username" placeholder="Username" size="xl"
                    :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }" class="mt-2" type="text" />
            </UFormGroup>

            <UNotification id="error-notification-register" title="Error:" :description="state.error" v-if="state.error"
                :timeout="0" @close="state.error = undefined" icon="i-heroicons-exclamation-circle" color="red" />

            <UNotification id="success-notification-login" title="Your profile data were successfully updated"
                v-if="state.success" :timeout="0" @close="state.success = true" icon="i-heroicons-check-circle"
                color="green" />

            <UButton type="submit" class="text-xl" :loading="state.loading">
                Update
            </UButton>
        </UForm>
    </div>
</template>

//update has to be done in firestore too