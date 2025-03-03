<template>
    <div class="max-w-[450px] w-full mx-auto">
        <Heading>Sign in</Heading>
        <UForm :schema="loginSchema" :state="state" class="space-y-6 w-full pt-8" @submit="onSubmit">
            <UFormGroup label="Email " name="email" required size="lg" class=" text-lg"
                :ui="{ size: { lg: 'text-lg' } }">
                <UInput v-model.trim="state.email" placeholder="Email" size="lg"
                    :ui="{ size: { lg: 'text-lg' }, placeholder: 'placeholder:italic' }" />
            </UFormGroup>

            <UFormGroup label="Password " name="password" required size="lg" :ui="{ size: { lg: 'text-lg' } }">
                <UInput v-model.trim="state.password" placeholder="Password" size="lg"
                    :ui="{ size: { lg: 'text-lg' }, placeholder: 'placeholder:italic' }" :type="inputType">
                    <UIcon :name="inputType === 'password' ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'"
                        @click="togglePasswordVisibility"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400" />
                </UInput>
            </UFormGroup>
            <div class="w-max text-lg">
                <NuxtLink to="./forgot-password"
                    class="cursor-pointer text-primary hover:underline underline-offset-[5px]">
                    <p>Forgot your password?</p>
                </NuxtLink>
            </div>

            <UNotification id="error-notification-login" title="Error:" :description="state.error" v-if="state.error"
                :timeout="0" @close="state.error = undefined" icon="i-heroicons-exclamation-circle" color="red" />

            <UNotification id="success-notification-login" title="Signed in, redirecting..." v-if="state.success"
                :timeout="0" @close="state.success = false" icon="i-heroicons-check-circle" color="green" />

            <div class="flex items-center flex-col justify-between pt-8">
                <UButton type="submit" class="text-lg" :loading="state.loading" block>
                    Sign in
                </UButton>
                <UDivider label="OR" class="py-4" orientation="horizontal"
                    :ui="{ border: { base: 'dark:border-gray-400' } }" />
                <UButton type="button" class="text-lg" @click="signInWithGoogle" block>
                    Sign in with Google
                </UButton>
                <div class="flex items-center gap-2 max-[300px]:flex-col pt-4">
                    <p class="text-lg">Don't have an account yet?</p>
                    <NuxtLink to="/register"
                        class="text-lg text-primary font-semibold flex items-center gap-0.5 hover:underline underline-offset-[5px]">
                        <UIcon name="i-heroicons-chevron-double-right-20-solid" class="text-lg" />
                        Register
                    </NuxtLink>
                </div>
            </div>
        </UForm>
    </div>
</template>

<!-- this has to be created in a separate script tag -->
<script lang="ts">
import { GoogleAuthProvider } from 'firebase/auth'
export const googleAuthProvider = new GoogleAuthProvider()
</script>

<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { useFirebaseAuth } from 'vuefire';
import { loginSchema, type LoginSchema } from '../schemas/schemas';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

definePageMeta({
    layout: "not-logged-in",
    middleware: "already-logged-in"
})

// const { login } = useFirebaseAuth()
// const colorStore = useUiColorStore()
// colorStore.initialize()

const auth = useFirebaseAuth()


const state = reactive({
    email: undefined,
    password: undefined,
    error: undefined,
    loading: false,
    success: false
})

const inputType = ref<"password" | "text">("password")

// TODO: create constants and utils folders
const togglePasswordVisibility = () => {
    inputType.value = inputType.value === "password" ? "text" : "password"
}

async function onSubmit(event: FormSubmitEvent<LoginSchema>) {
    console.log("SUBMIT EVENT LOGIN", event.data)
    state.loading = true
    state.success = false

    try {
        // await login(event.data.email, event.data.password)
        await signInWithEmailAndPassword(auth!, event.data.email, event.data.password)
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

const signInWithGoogle = async () => {
    try {
        await signInWithPopup(auth!, googleAuthProvider)
        return await navigateTo("/", { replace: true });
    } catch (error: any) {
        console.error(error)
    }
}

//TODO: add UNotifications and toast for sign in, create a util function from signupwithGoogle
</script>
