<script setup lang="ts">
import { z } from 'zod'
import type { FormError, FormSubmitEvent } from '#ui/types'

definePageMeta({
    layout: "not-logged-in",
    middleware: "already-logged-in"
})

const { login } = useFirebaseAuth()
const colorStore = useUiColorStore()
colorStore.initialize()

const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Must be at least 6 characters')
})

type Schema = z.output<typeof schema>

const state = reactive({
    email: undefined,
    password: undefined,
    error: undefined,
    loading: false,
    success: false
})


async function onSubmit(event: FormSubmitEvent<Schema>) {
    //console.log("SUBMIT EVENT LOGIN", event.data)
    state.loading = true
    state.success = false

    try {
        await login(event.data.email, event.data.password)
        state.loading = false
        state.email = undefined
        state.password = undefined
        if (!state.error) {
            state.success = true
            return await navigateTo("/", { replace: true });
        }
    } catch (error: any) {
        console.error("Frontend error:", error.message);
        state.error = error.message;
        state.loading = false
        state.success = false
    }

}
</script>

<template>
    <div class="max-w-[700px] w-full mx-auto">
        <Heading>Sign in</Heading>
        <UForm :schema="schema" :state="state" class="space-y-4 w-full pt-8 " @submit="onSubmit">
            <UFormGroup label="Email" name="email" required size="xl" class="mb-8">
                <UInput v-model.trim="state.email" placeholder="Email" size="xl"
                    :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }" class="mt-2" />
            </UFormGroup>

            <UFormGroup label="Password " name="password" required size="xl">
                <UInput v-model.trim="state.password" placeholder="Password" size="xl"
                    :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }" class="mt-2" type="password" />
            </UFormGroup>
            <div class="w-max">
                <NuxtLink to="./forgot-password" class="cursor-pointer text-primary">
                    <p>Forgot your password?</p>
                </NuxtLink>
            </div>

            <UNotification id="error-notification-login" title="Error:" :description="state.error" v-if="state.error"
                :timeout="0" @close="state.error = undefined" icon="i-heroicons-exclamation-circle" color="red" />

            <UNotification id="success-notification-login" title="Signed in, redirecting..." v-if="state.success"
                :timeout="0" @close="state.success = false" icon="i-heroicons-check-circle" color="green" />

            <div class="flex items-center justify-between pt-8 max-[470px]:flex-col max-[470px]:gap-8">
                <UButton type="submit" class="text-xl" :loading="state.loading">
                    Sign in
                </UButton>
                <div class="flex items-center gap-3 max-[250px]:flex-col max-[250px]:gap-4">
                    <p class="text-lg">Don't have an account yet?</p>
                    <NuxtLink to="/register" class="text-lg text-primary font-semibold flex items-center gap-1">
                        <UIcon name="i-heroicons-chevron-double-right-20-solid" class="text-xl" />
                        Register
                    </NuxtLink>
                </div>
            </div>
        </UForm>
    </div>
</template>