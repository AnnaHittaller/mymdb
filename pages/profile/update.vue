<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { updateProfile } from 'firebase/auth'
const router = useRouter()

definePageMeta({
    middleware: "auth"
})

const user = useCurrentUser()
const { setUsername } = useUserDocument()

const schema = z.object({
    username: z.string({ error: 'Must be at least 3 characters' }).min(3, 'Must be at least 3 characters').max(30, 'Too long - must be under 30 characters')
})

type Schema = z.output<typeof schema>

const state = reactive({
    username: user.value?.displayName ?? undefined,
    error: undefined as string | undefined,
    loading: false,
    success: false,
})

useFormToasts(state, { successTitle: 'Your profile data were successfully updated' })

async function onSubmit(event: FormSubmitEvent<Schema>) {
    console.log("UPDATE EVENT REGISTER", event.data)
    state.loading = true
    try {
        const current = user.value
        if (!current) {
            throw new Error('You need to be signed in to update your username')
        }
        const displayName = event.data.username
        await updateProfile(current, { displayName })
        await setUsername(displayName)
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

            <UFormField label="Username " name="username" required size="xl" class="pb-4">
                <UInput v-model.trim="state.username" placeholder="Username" size="xl"
                    :ui="{ base: 'text-xl placeholder:italic' }" class="mt-2" type="text" />
            </UFormField>

            <UButton type="submit" class="text-xl" :loading="state.loading">
                Update
            </UButton>
        </UForm>
    </div>
</template>
