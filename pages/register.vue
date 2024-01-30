<script setup lang="ts">
import { z } from 'zod'
import type { FormError, FormSubmitEvent } from '#ui/types'

definePageMeta({
    layout: "not-logged-in",
    middleware: "already-logged-in"
})

const { register } = useFirebaseAuth()
const { setUser } = useFirestore()

const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Must be at least 6 characters'),
    username: z.string().min(3, 'Must be at least 3 characters').max(30, "Too long - must be under 30 characters")
})

type Schema = z.output<typeof schema>

const state = reactive({
    email: undefined,
    password: undefined,
    username: undefined,
    error: undefined,
    loading: false,
    success: false
})

// const validate = (state: any): FormError[] => {
//     const errors = []
//     if (!state.email) errors.push({ path: 'email', message: 'Required' })
//     if (!state.password) errors.push({ path: 'password', message: 'Required' })
//     return errors
// }

async function onSubmit(event: FormSubmitEvent<Schema>) {
    console.log("SUBMIT EVENT REGISTER", event.data)
    state.loading = true
    state.success = false
    try {
        const user = await register(event.data.email, event.data.password)
        console.log(user)

        const firestoreUser = await setUser(user.uid, event.data.username, event.data.email, "emerald", []);
        console.log(firestoreUser);


        state.loading = false
        state.email = undefined
        state.username = undefined
        state.password = undefined
        if (!state.error) {
            state.success = true
            return await navigateTo("/", { replace: true });
        }
    } catch (error: any) {
        console.error(error)
        state.error = error.message;
        state.loading = false
        state.success = false
    }
}

</script>

<template>
    <div class="max-w-[700px] w-full mx-auto">
        <Heading>Register</Heading>
        <UForm :schema="schema" :state="state" class="space-y-4 w-full pt-8 " @submit="onSubmit">
            <UFormGroup label="Email" name="email" required size="xl" class="mb-8">
                <UInput v-model.trim="state.email" placeholder="Email" size="xl"
                    :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }" class="mt-2" />
            </UFormGroup>

            <UFormGroup label="Username " name="username" required size="xl" class="pb-4">
                <UInput v-model.trim="state.username" placeholder="Username" size="xl"
                    :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }" class="mt-2" type="text" />
            </UFormGroup>

            <UFormGroup label="Password " name="password" required size="xl">
                <UInput v-model.trim="state.password" placeholder="Password" size="xl"
                    :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }" class="mt-2" type="password" />
            </UFormGroup>

            <UNotification id="error-notification-register" title="Error:" :description="state.error" v-if="state.error"
                :timeout="0" @close="state.error = undefined" icon="i-heroicons-exclamation-circle" color="red" />

            <UNotification id="success-notification-register" title="Registration successful, redirecting..."
                v-if="state.success" :timeout="0" @close="state.success = false" icon="i-heroicons-check-circle"
                color="green" />

            <div class="flex items-center justify-between pt-8 max-[470px]:flex-col max-[470px]:gap-8">
                <UButton type="submit" class="text-xl" :loading="state.loading">
                    Register
                </UButton>
                <div class="flex items-center gap-3 max-[250px]:flex-col max-[250px]:gap-4">
                    <p class="text-lg">Already have an account?</p>
                    <NuxtLink to="/login" class="text-lg text-primary font-semibold flex items-center gap-1">
                        <UIcon name="i-heroicons-chevron-double-right-20-solid" class="text-xl" />
                        Sign in
                    </NuxtLink>
                </div>
            </div>
        </UForm>
    </div>
</template>