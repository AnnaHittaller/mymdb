<template>
    <div class="max-w-[450px] w-full mx-auto">
        <Heading>{{ $t('auth.signIn') }}</Heading>
        <UForm :schema="loginSchema" :state="state" class="space-y-6 w-full pt-8" @submit="onSubmit">
            <UFormField :label="$t('auth.email')" name="email" required size="lg" :ui="{ label: 'text-lg' }">
                <UInput
                    v-model.trim="state.email" :placeholder="$t('auth.email')" size="lg"
                    :ui="{ base: 'text-lg placeholder:italic' }" />
            </UFormField>

            <UFormField :label="$t('auth.password')" name="password" required size="lg" :ui="{ label: 'text-lg' }">
                <UInput
                    v-model="state.password" :placeholder="$t('auth.password')" size="lg"
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
                    <p>{{ $t('auth.forgotPassword') }}</p>
                </NuxtLink>
            </div>

            <div class="flex items-center flex-col justify-between pt-8">
                <UButton type="submit" class="text-lg" :loading="state.loading" block>
                    {{ $t('auth.signIn') }}
                </UButton>
                <USeparator :label="$t('common.or')" class="py-4" orientation="horizontal" />
                <UButton type="button" class="text-lg" :loading="state.loading" block @click="onGoogleButtonClick">
                    {{ $t('auth.signInWithGoogle') }}
                </UButton>
                <p class="pt-2 text-center text-sm text-fg-subtle">{{ googleLinkHint }}</p>
                <div class="flex items-center gap-2 max-[300px]:flex-col pt-4">
                    <p class="text-lg">{{ $t('auth.noAccount') }}</p>
                    <NuxtLink
                        :to="route.query.redirect ? { path: '/register', query: { redirect: route.query.redirect } } : '/register'"
                        class="text-lg text-primary font-semibold flex items-center gap-0.5 hover:underline underline-offset-[5px]">
                        <UIcon name="i-heroicons-chevron-double-right-20-solid" class="text-lg" />
                        {{ $t('auth.register') }}
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
        <SignInLocalePromptModal
            v-model:open="localePromptOpen"
            :suggested="suggestedLocale"
            :loading="localePromptLoading"
            @confirm="confirmLocale"
            @keep-english="keepEnglishAndContinue" />
    </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { useFirebaseAuth } from 'vuefire';
import { loginSchema, type LoginSchema } from '../schemas/schemas';
import { signInWithEmailAndPassword } from "firebase/auth";
import { googleAuthProvider } from '~/composables/googleAuthProvider';
import { signInWithGoogleAndLink, googleLinkHint } from '~/composables/googleSignIn';
import { useGoogleLinkPasswordPrompt } from '~/composables/useGoogleLinkPasswordPrompt';
import { useSignInLocalePrompt } from '~/composables/useSignInLocalePrompt';

definePageMeta({
    layout: "not-logged-in",
    middleware: "already-logged-in"
})

const auth = useFirebaseAuth()
const route = useRoute()
const destination = computed(() => pathFromRedirect(route.query.redirect))
const {
    open: localePromptOpen,
    loading: localePromptLoading,
    suggestedLocale,
    finishAuthAndOfferLocale,
    confirmLocale,
    keepEnglishAndContinue,
} = useSignInLocalePrompt()

async function finishSignIn(user: import('firebase/auth').User, email: string) {
    clearFormToasts()
    await finishAuthAndOfferLocale(user, email, destination.value)
}

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

const { t } = useI18n()
const { clearFormToasts } = useFormToasts(state, { successTitle: t('auth.signedInRedirect') })

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
        await finishSignIn(user, event.data.email)
    } catch (error: any) {
        console.error("Frontend error:", error.code, error.message);
        state.success = false
        if (error.code === "auth/invalid-credential") {
            state.error = t('auth.invalidCredential');
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
        await finishSignIn(user, signedInEmail)
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
