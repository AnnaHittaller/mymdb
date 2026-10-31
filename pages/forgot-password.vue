<template>
    <div class="max-w-[450px] w-full mx-auto">
        <Heading>Reset your password</Heading>
        <UForm :schema="forgotPasswordSchema" :state="state" class="space-y-6 w-full pt-8 " @submit="onSubmit">
            <UFormField label="Email " name="email" required size="lg" :ui="{ label: 'text-lg' }">
                <UInput v-model.trim="state.email" placeholder="Email" size="lg"
                    :ui="{ base: 'text-lg placeholder:italic' }" />
            </UFormField>

            <div class="flex items-center justify-between pt-8 flex-col">
                <UButton type="submit" class="text-lg" :loading="state.loading" block>
                    Reset password
                </UButton>
                <div class="flex items-center gap-2 flex-col pt-4">
                    <NuxtLink to="/login" class="text-lg text-primary font-semibold flex items-center gap-0.5">
                        <UIcon name="i-heroicons-chevron-double-right-20-solid" class="text-lg" />
                        Back to sign in
                    </NuxtLink>
                </div>
            </div>
        </UForm>
    </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { forgotPasswordSchema, type ForgotPasswordSchema } from '../schemas/schemas';
import { sendPasswordResetEmail } from 'firebase/auth';

definePageMeta({
    layout: "not-logged-in",
    middleware: "already-logged-in"
})

const router = useRouter()
const auth = useFirebaseAuth()

const state = reactive({
    email: undefined as string | undefined,
    error: undefined as string | undefined,
    loading: false,
    success: false
})

useFormToasts(state, { successTitle: 'We have sent you an email with the instructions' })

async function onSubmit(event: FormSubmitEvent<ForgotPasswordSchema>) {
    console.log("SUBMIT EVENT LOGIN", event.data)
    state.loading = true
    state.success = false

    try {
        // await resetPassword(event.data.email)
        await sendPasswordResetEmail(auth!, event.data.email,
            //Have to set the final url here to redurect users after resetting their passwords
            {
                // url: "https://mymdb-my-movie-watchlist.netlify.app"
                url: "https://localhost:3000/login"
            }
        )
        console.log("recover code comes here")
        state.loading = false
        state.email = undefined
        if (!state.error) {
            // TODO: add check for existing user email - if found in database, show success, if not, show error
            state.success = true
            setTimeout(() => {
                router.replace({ path: '/login' })
            }, 4000)

        }
    } catch (error: any) {
        console.error("Password reset error:", error.message);
        state.error = error.message;
        state.loading = false
        state.success = false
    }

}
//TODO: test password reset for users who registered with google
//TODO: put URL in env
//TODO: customise email templates and domain in Firebase
</script>
