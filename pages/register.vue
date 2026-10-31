<template>
    <div class="max-w-[450px] w-full mx-auto">
        <Heading>Register</Heading>
        <UForm :schema="registerSchema" :state="state" class="space-y-6 w-full pt-8 text-lg" @submit="onSubmit">
            <UFormField label="Email " name="email" required size="lg" :ui="{ label: 'text-lg' }">
                <UInput v-model.trim="state.email" placeholder="Email" size="lg"
                    :ui="{ base: 'text-lg placeholder:italic' }" />
            </UFormField>

            <UFormField label="Username " name="username" required size="lg" :ui="{ label: 'text-lg' }">
                <UInput v-model.trim="state.username" placeholder="Username" size="lg"
                    :ui="{ base: 'text-lg placeholder:italic' }" type="text" />
            </UFormField>

            <UFormField label="Password " name="password" required size="lg" :ui="{ label: 'text-lg' }">
                <UInput v-model="state.password" placeholder="Password" size="lg"
                    :ui="{ base: 'text-lg placeholder:italic' }" :type="inputType">
                    <template #trailing>
                        <UIcon :name="inputType === 'password' ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'"
                            @click="togglePasswordVisibility" class="cursor-pointer text-xl text-gray-400" />
                    </template>
                </UInput>
            </UFormField>

            <div class="flex items-center justify-between pt-8 flex-col">
                <UButton type="submit" class="text-lg" :loading="state.loading" block>
                    Create an account
                </UButton>
                <USeparator label="OR" class="py-4" orientation="horizontal"
                    :ui="{ border: 'dark:border-gray-400' }" />
                <UButton type="button" class="text-lg" :loading="state.loading" @click="signUpWithGoogle" block>
                    Sign up with Google
                </UButton>
                <div class="flex items-center gap-2 max-[300px]:flex-col pt-4">
                    <p class="text-lg">Already have an account?</p>
                    <NuxtLink to="/login"
                        class="text-lg text-primary font-semibold flex items-center gap-0.5 hover:underline underline-offset-[5px]">
                        <UIcon name="i-heroicons-chevron-double-right-20-solid" class="text-lg" />
                        Sign in
                    </NuxtLink>
                </div>
            </div>
        </UForm>
        <LinkGooglePasswordModal
            v-model:open="linkModalOpen"
            :email="linkModalEmail"
            :loading="linkModalLoading"
            @confirm="onLinkPasswordConfirm"
            @cancel="cancelLinkPassword"
        />
    </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { registerSchema, type RegisterSchema } from '../schemas/schemas';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { googleAuthProvider } from '~/composables/googleAuthProvider';
import { signInWithGoogleAndLink } from '~/composables/googleSignIn';
import { defaultUsername, ensureUserProfile } from '~/composables/userProfile';
import { useGoogleLinkPasswordPrompt } from '~/composables/useGoogleLinkPasswordPrompt';

definePageMeta({
    layout: "not-logged-in",
    middleware: "already-logged-in"
})

const auth = useFirebaseAuth()
const db = useFirestore()
const route = useRoute()
const destination = computed(() => pathFromRedirect(route.query.redirect))

const {
    linkModalOpen,
    linkModalEmail,
    linkModalLoading,
    promptForPassword,
    confirmLinkPassword,
    cancelLinkPassword,
    finishLinkPasswordFlow,
} = useGoogleLinkPasswordPrompt()

function onLinkPasswordConfirm(password: string) {
    confirmLinkPassword(password)
}


const state = reactive({
    email: undefined as string | undefined,
    password: undefined as string | undefined,
    username: undefined as string | undefined,
    error: undefined as string | undefined,
    loading: false,
    success: false
})

const { clearFormToasts } = useFormToasts(state, { successTitle: 'Registration successful, redirecting...' })

const inputType = ref<"password" | "text">("password")

const togglePasswordVisibility = () => {
    inputType.value = inputType.value === "password" ? "text" : "password"
}

async function onSubmit(event: FormSubmitEvent<RegisterSchema>) {
    console.log("SUBMIT EVENT REGISTER", event.data)
    state.loading = true
    state.success = false
    try {
        const { user } = await createUserWithEmailAndPassword(auth!, event.data.email, event.data.password)
        //add displayName to user object
        await updateProfile(user, { displayName: event.data.username })
        await ensureUserProfile(db, user, {
            username: event.data.username,
            email: event.data.email,
        })

        state.loading = false
        state.email = undefined
        state.username = undefined
        state.password = undefined
        if (!state.error) {
            clearFormToasts()
            await navigateTo(destination.value, { replace: true })
        }
    } catch (error: any) {
        console.error(error)
        state.error = error.message;
        state.loading = false
        state.success = false
    }
}

const signUpWithGoogle = async () => {
    state.loading = true
    try {
        const { user } = await signInWithGoogleAndLink(auth!, googleAuthProvider, {
            promptForPassword,
        })
        const signedInEmail = user.email ?? ""
        await ensureUserProfile(db, user, {
            username: defaultUsername(user, signedInEmail),
            email: signedInEmail,
        })
        clearFormToasts()
        await navigateTo(destination.value, { replace: true })
    } catch (error: any) {
        if (error.message !== 'Google link cancelled.') {
            state.error = error.message ?? 'Google sign-in failed.'
        }
        console.error(error)
    } finally {
        finishLinkPasswordFlow()
        state.loading = false
    }
}

//TODO: add UNotifications and toast for account created
//TODO: simplify state management
</script>
