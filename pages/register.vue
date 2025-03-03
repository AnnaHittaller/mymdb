<template>
    <div class="max-w-[450px] w-full mx-auto">
        <Heading>Register</Heading>
        <UForm :schema="registerSchema" :state="state" class="space-y-6 w-full pt-8 text-lg" @submit="onSubmit">
            <UFormGroup label="Email " name="email" required size="lg" :ui="{ size: { lg: 'text-lg' } }">
                <UInput v-model.trim="state.email" placeholder="Email" size="lg"
                    :ui="{ size: { lg: 'text-lg' }, placeholder: 'placeholder:italic' }" />
            </UFormGroup>

            <UFormGroup label="Username " name="username" required size="lg" :ui="{ size: { lg: 'text-lg' } }">
                <UInput v-model.trim="state.username" placeholder="Username" size="lg"
                    :ui="{ size: { lg: 'text-lg' }, placeholder: 'placeholder:italic' }" type="text" />
            </UFormGroup>

            <UFormGroup label="Password " name="password" required size="lg" :ui="{ size: { lg: 'text-lg' } }">
                <UInput v-model.trim="state.password" placeholder="Password" size="lg"
                    :ui="{ size: { lg: 'text-lg' }, placeholder: 'placeholder:italic' }" type="password">
                    <UIcon :name="inputType === 'password' ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'"
                        @click="togglePasswordVisibility"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400" />
                </UInput>
            </UFormGroup>

            <UNotification id="error-notification-register" title="Error:" :description="state.error" v-if="state.error"
                :timeout="0" @close="state.error = undefined" icon="i-heroicons-exclamation-circle" color="red" />

            <UNotification id="success-notification-register" title="Registration successful, redirecting..."
                v-if="state.success" :timeout="0" @close="state.success = false" icon="i-heroicons-check-circle"
                color="green" />

            <div class="flex items-center justify-between pt-8 flex-col">
                <UButton type="submit" class="text-lg" :loading="state.loading" block>
                    Create an account
                </UButton>
                <UDivider label="OR" class="py-4" orientation="horizontal"
                    :ui="{ border: { base: 'dark:border-gray-400' } }" />
                <UButton type="button" class="text-lg" @click="signUpWithGoogle" block>
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
    </div>
</template>

<!-- this has to be created in a separate script tag -->
<script lang="ts">
import { GoogleAuthProvider } from 'firebase/auth'
export const googleAuthProvider = new GoogleAuthProvider()
</script>

<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { registerSchema, type RegisterSchema } from '../schemas/schemas';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
// import { setUserInFirestore } from '~/composables/useFirestore';

definePageMeta({
    layout: "not-logged-in",
    middleware: "already-logged-in"
})

// const { register } = useFirebaseAuth()
// const { setUser } = useFirestore()
const auth = useFirebaseAuth()


const state = reactive({
    email: undefined,
    password: undefined,
    username: undefined,
    error: undefined,
    loading: false,
    success: false
})

const inputType = ref<"password" | "text">("password")

const togglePasswordVisibility = () => {
    inputType.value = inputType.value === "password" ? "text" : "password"
}

async function onSubmit(event: FormSubmitEvent<RegisterSchema>) {
    console.log("SUBMIT EVENT REGISTER", event.data)
    state.loading = true
    state.success = false
    try {
        // const user = await register(event.data.email, event.data.password)
        // console.log(user)

        // const firestoreUser = await setUser(user.uid, event.data.username, event.data.email, "emerald", []);
        // console.log(firestoreUser);
        const db = useFirestore()

        const { user } = await createUserWithEmailAndPassword(auth!, event.data.email, event.data.password)
        //add displayName to user object
        await updateProfile(user, { displayName: event.data.username })
        //add user to firestore with default data
        await setUserInFirestore(db, user.uid, { uid: user.uid, username: event.data.username, email: event.data.email, theme: "emerald", movies: [] })

        state.loading = false
        state.email = undefined
        state.username = undefined
        state.password = undefined
        if (!state.error) {
            state.success = true
            console.log("User created successfully")
            return await navigateTo("/", { replace: true });
        }
    } catch (error: any) {
        console.error(error)
        state.error = error.message;
        state.loading = false
        state.success = false
    }
}

const signUpWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth!, googleAuthProvider)
        console.log(result)
        return await navigateTo("/", { replace: true });
    } catch (error: any) {
        console.error(error)
    }
}

//TODO: add UNotifications and toast for account created
//TODO: simplify state management
</script>
