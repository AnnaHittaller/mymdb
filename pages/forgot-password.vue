<script setup lang="ts">
import { z } from 'zod'
import type { FormError, FormSubmitEvent } from '#ui/types'

definePageMeta({
    layout: "not-logged-in",
    middleware: "already-logged-in"
})

const { login } = useFirebaseAuth()
//const colorStore = useUiColorStore()
//colorStore.initialize()

const schema = z.object({
    email: z.string().email('Invalid email'),
})

type Schema = z.output<typeof schema>

const state = reactive({
    email: undefined,
    error: undefined,
    loading: false,
    success: false
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
    console.log("SUBMIT EVENT LOGIN", event.data)
    state.loading = true
    state.success = false

    try {
        //await login(event.data.email)
        console.log("recover code comes here")
        state.loading = false
        state.email = undefined
        state.success = true
        // if (!state.error) {
        //     state.success = true
        //     return await navigateTo("/", { replace: true });
        //      //with TIMEOUT
        // }
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
        <Heading>Recover your password</Heading>
        <UForm :schema="schema" :state="state" class="space-y-4 w-full pt-8 " @submit="onSubmit">
            <UFormGroup label="Email" name="email" required size="xl" class="mb-8">
                <UInput v-model.trim="state.email" placeholder="Email" size="xl"
                    :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }" class="mt-2" />
            </UFormGroup>

            <UNotification id="error-notification-login" title="Error:" :description="state.error" v-if="state.error"
                :timeout="0" @close="state.error = undefined" icon="i-heroicons-exclamation-circle" color="red" />

            <UNotification id="success-notification-login" title="We have sent you an email" v-if="state.success"
                :timeout="3000" @close="state.success = false" icon="i-heroicons-check-circle" color="green" />

            <div class="flex items-center justify-between pt-8 max-[470px]:flex-col max-[470px]:gap-8">
                <UButton type="submit" class="text-xl" :loading="state.loading">
                    Reset password
                </UButton>
                <div class="flex items-center gap-3 max-[250px]:flex-col max-[250px]:gap-4">
                    <!-- <p class="text-lg">Don't have an account yet?</p> -->
                    <NuxtLink to="/login" class="text-lg text-primary font-semibold flex items-center gap-1">
                        <UIcon name="i-heroicons-chevron-double-right-20-solid" class="text-xl" />
                        Back to sign in
                    </NuxtLink>
                </div>
            </div>
        </UForm>
    </div>
</template>