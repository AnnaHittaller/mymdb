<template>
    <div class="max-w-[450px] w-full mx-auto">
        <Heading>Sign in</Heading>
        <UForm :schema="loginSchema" :state="state" class="space-y-6 w-full pt-8" @submit="onSubmit">
            <UFormField label="Email " name="email" required size="lg" :ui="{ label: 'text-lg' }">
                <UInput
                    v-model.trim="state.email" placeholder="Email" size="lg"
                    :ui="{ base: 'text-lg placeholder:italic' }" />
            </UFormField>

            <UFormField label="Password " name="password" required size="lg" :ui="{ label: 'text-lg' }">
                <UInput
                    v-model="state.password" placeholder="Password" size="lg"
                    :ui="{ base: 'text-lg placeholder:italic' }" :type="inputType">
                    <template #trailing>
                        <UIcon
                            :name="inputType === 'password' ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'"
                            class="cursor-pointer text-xl text-fg-muted" @click="togglePasswordVisibility" />
                    </template>
                </UInput>
            </UFormField>
            <div class="w-max text-lg">
                <NuxtLink
                    to="./forgot-password"
                    class="cursor-pointer text-primary hover:underline underline-offset-[5px]">
                    <p>Forgot your password?</p>
                </NuxtLink>
            </div>

            <div class="flex items-center flex-col justify-between pt-8">
                <UButton type="submit" class="text-lg" :loading="state.loading" block>
                    Sign in
                </UButton>
                <USeparator label="OR" class="py-4" orientation="horizontal" />
                <UButton type="button" class="text-lg" :loading="state.loading" block @click="onGoogleButtonClick">
                    Sign in with Google
                </UButton>
                <p class="pt-2 text-center text-sm text-fg-subtle">{{ googleLinkHint }}</p>
                <div class="flex items-center gap-2 max-[300px]:flex-col pt-4">
                    <p class="text-lg">Don't have an account yet?</p>
                    <NuxtLink
                        :to="route.query.redirect ? { path: '/register', query: { redirect: route.query.redirect } } : '/register'"
                        class="text-lg text-primary font-semibold flex items-center gap-0.5 hover:underline underline-offset-[5px]">
                        <UIcon name="i-heroicons-chevron-double-right-20-solid" class="text-lg" />
                        Register
                    </NuxtLink>
                </div>
            </div>
        </UForm>
        <GoogleSignInGuideModal
            v-model:open="googleGuideOpen" :variant="googleGuideVariant" :loading="state.loading"
            @use-form-first="onGoogleGuideUseForm" @continue-google-only="runGoogleSignIn" />
        <LinkGooglePasswordModal
            v-model:open="linkModalOpen" :email="linkModalEmail" :loading="linkModalLoading"
            @confirm="onLinkPasswordConfirm" @cancel="cancelLinkPassword" />
    </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { useFirebaseAuth } from 'vuefire';
import { loginSchema, type LoginSchema } from '../schemas/schemas';
import { signInWithEmailAndPassword } from "firebase/auth";
import { googleAuthProvider } from '~/composables/googleAuthProvider';
import { signInWithGoogleAndLink, googleLinkHint } from '~/composables/googleSignIn';
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

const googleGuideOpen = ref(false)
const googleGuideVariant = ref<"missing-both" | "missing-password">("missing-both")

const state = reactive({
    email: undefined as string | undefined,
    password: undefined as string | undefined,
    error: undefined as string | undefined,
    loading: false,
    success: false
})

const { clearFormToasts } = useFormToasts(state, { successTitle: 'Signed in, redirecting...' })

const inputType = ref<"password" | "text">("password")

const togglePasswordVisibility = () => {
    inputType.value = inputType.value === "password" ? "text" : "password"
}

async function onSubmit(event: FormSubmitEvent<LoginSchema>) {
    state.loading = true
    state.success = false
    state.error = undefined

    try {
        const { user } = await signInWithEmailAndPassword(auth!, event.data.email, event.data.password)
        await ensureUserProfile(db, user, {
            username: defaultUsername(user, event.data.email),
            email: event.data.email,
        })
        clearFormToasts()
        await navigateTo(destination.value, { replace: true })
    } catch (error: any) {
        console.error("Frontend error:", error.code, error.message);
        state.success = false
        if (error.code === "auth/invalid-credential") {
            state.error =
                "Incorrect email or password. If you signed in with Google recently, use Forgot password to set a new email password — or sign in with Google.";
        } else {
            state.error = error.message;
        }
    } finally {
        state.loading = false
    }
}

function onGoogleButtonClick() {
    const formEmail = state.email?.trim()
    if (formEmail && state.password) {
        return runGoogleSignIn()
    }
    googleGuideVariant.value = formEmail ? "missing-password" : "missing-both"
    googleGuideOpen.value = true
}

function onGoogleGuideUseForm() {
    googleGuideOpen.value = false
}

async function runGoogleSignIn() {
    googleGuideOpen.value = false

    const formEmail = state.email?.trim()
    state.loading = true
    state.error = undefined
    try {
        const { user } = await signInWithGoogleAndLink(auth!, googleAuthProvider, {
            email: formEmail && state.password ? formEmail : undefined,
            password: state.password,
            promptForPassword,
        })
        const signedInEmail = user.email ?? formEmail ?? ""
        await ensureUserProfile(db, user, {
            username: defaultUsername(user, signedInEmail),
            email: signedInEmail,
        })
        clearFormToasts()
        await navigateTo(destination.value, { replace: true })
    } catch (error: any) {
        state.success = false
        if (error.message !== "Google link cancelled.") {
            state.error = error.message ?? "Google sign-in failed."
        }
        console.error(error)
    } finally {
        finishLinkPasswordFlow()
        state.loading = false
    }
}
</script>
