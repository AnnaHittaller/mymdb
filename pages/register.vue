<template>
    <div class="max-w-[450px] w-full mx-auto">
        <Heading>{{ $t('auth.register') }}</Heading>
        <UForm :schema="registerSchema" :state="state" class="space-y-6 w-full pt-8 text-lg" @submit="onSubmit">
            <UFormField :label="$t('auth.email')" name="email" required size="lg" :ui="{ label: 'text-lg' }">
                <UInput
                    v-model.trim="state.email" :placeholder="$t('auth.email')" size="lg"
                    :ui="{ base: 'text-lg placeholder:italic' }" />
            </UFormField>

            <UFormField :label="$t('auth.username')" name="username" required size="lg" :ui="{ label: 'text-lg' }">
                <UInput
                    v-model.trim="state.username" :placeholder="$t('auth.username')" size="lg"
                    :ui="{ base: 'text-lg placeholder:italic' }" type="text" />
            </UFormField>

            <UFormField :label="$t('auth.password')" name="password" required size="lg" :ui="{ label: 'text-lg' }">
                <UInput
                    v-model="state.password" :placeholder="$t('auth.password')" size="lg"
                    :ui="{ base: 'text-lg placeholder:italic' }" :type="inputType">
                    <template #trailing>
                        <UIcon :name="inputType === 'password' ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'"
                            @click="togglePasswordVisibility" class="cursor-pointer text-xl text-fg-muted" />
                    </template>
                </UInput>
            </UFormField>

            <div class="flex items-center justify-between pt-8 flex-col">
                <UButton type="submit" class="text-lg" :loading="state.loading" block>
                    {{ $t('auth.createAccount') }}
                </UButton>
                <USeparator :label="$t('common.or')" class="py-4" orientation="horizontal" />
                <UButton type="button" class="text-lg" :loading="state.loading" @click="signUpWithGoogle" block>
                    {{ $t('auth.signUpWithGoogle') }}
                </UButton>
                <div class="flex items-center gap-2 max-[300px]:flex-col pt-4">
                    <p class="text-lg">{{ $t('auth.hasAccount') }}</p>
                    <NuxtLink
                        to="/login"
                        class="text-lg text-primary font-semibold flex items-center gap-0.5 hover:underline underline-offset-[5px]">
                        <UIcon name="i-heroicons-chevron-double-right-20-solid" class="text-lg" />
                        {{ $t('auth.signIn') }}
                    </NuxtLink>
                </div>
            </div>
        </UForm>
        <LinkGooglePasswordModal
            v-model:open="linkModalOpen"
            :email="linkModalEmail"
            :loading="linkModalLoading"
            @confirm="onLinkPasswordConfirm"
            @cancel="cancelLinkPassword" />
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
import { registerSchema, type RegisterSchema } from '../schemas/schemas';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { googleAuthProvider } from '~/composables/googleAuthProvider';
import { signInWithGoogleAndLink } from '~/composables/googleSignIn';
import { useGoogleLinkPasswordPrompt } from '~/composables/useGoogleLinkPasswordPrompt';
import { useSignInLocalePrompt } from '~/composables/useSignInLocalePrompt';

definePageMeta({
    layout: "not-logged-in",
    middleware: "already-logged-in"
})

const auth = useFirebaseAuth()
const route = useRoute()
const { t } = useI18n()
const destination = computed(() => pathFromRedirect(route.query.redirect))
const {
    open: localePromptOpen,
    loading: localePromptLoading,
    suggestedLocale,
    finishAuthAndOfferLocale,
    confirmLocale,
    keepEnglishAndContinue,
} = useSignInLocalePrompt()

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

const { clearFormToasts } = useFormToasts(state, { successTitle: t('auth.registerSuccessRedirect') })

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
        await updateProfile(user, { displayName: event.data.username })
        clearFormToasts()
        await finishAuthAndOfferLocale(user, event.data.email, destination.value, event.data.username)
        state.email = undefined
        state.username = undefined
        state.password = undefined
    } catch (error: any) {
        console.error(error)
        state.error = error.message;
        state.success = false
    } finally {
        state.loading = false
    }
}

const signUpWithGoogle = async () => {
    state.loading = true
    try {
        const { user } = await signInWithGoogleAndLink(auth!, googleAuthProvider, {
            promptForPassword,
        })
        const signedInEmail = user.email ?? ""
        clearFormToasts()
        await finishAuthAndOfferLocale(user, signedInEmail, destination.value)
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
</script>
