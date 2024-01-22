<script setup lang="ts">
import { z } from 'zod'
import type { FormError, FormSubmitEvent } from '#ui/types'
const { getUser } = useFirestore()
const { currentUserPromise } = useFirebaseAuth()

definePageMeta({
    middleware: "auth"
})

const userData = await currentUserPromise()
const user = await getUser(userData.uid)
console.log("User:", userData)

const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Must be at least 6 characters'),
    username: z.string().min(3, 'Must be at least 3 characters').max(30, "Too long - must be under 30 characters")
})

type Schema = z.output<typeof schema>

const state = reactive({
    email: userData.email,
    username: undefined,
    password: undefined,
    error: undefined,
    loading: false
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
    console.log("UPDATE EVENT REGISTER", event.data)
    state.loading = true
    try {
        // const user = await register(event.data.email, event.data.password)
        // console.log(user)

        // const firestoreUser = await setUser(user.uid, event.data.username, event.data.email);
        // console.log(firestoreUser);


        state.loading = false
        state.email = undefined
        state.username = undefined

        if (!state.error) {
            await navigateTo("/profile")
        }
    } catch (error: any) {
        console.error(error)
        state.error = error.message;
        state.loading = false
    }
}

</script>

<template>
    <div class="max-w-[700px] w-full ">
        <Heading>Update user data</Heading>
        <UForm :schema="schema" :state="state" class="space-y-4 w-full pt-8 " @submit="onSubmit">
            <UFormGroup label="Email" name="email" required size="xl" class="mb-8">
                <UInput v-model.trim="state.email" placeholder="Email" size="xl"
                    :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }" class="mt-2" />
            </UFormGroup>

            <UFormGroup label="Username " name="username" required size="xl" class="pb-4">
                <UInput v-model.trim="state.username" placeholder="Username" size="xl"
                    :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }" class="mt-2" type="text" />
            </UFormGroup>

            <!-- <UFormGroup label="Password " name="password" required size="xl" class="pb-4">
                <UInput v-model.trim="state.password" placeholder="Password" size="xl"
                    :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }" class="mt-2" type="password" />
            </UFormGroup> -->

            <UNotification id="error-notification-register" title="Error:" :description="state.error" v-if="state.error"
                :timeout="0" @close="state.error = undefined" icon="i-heroicons-exclamation-circle" color="red" />

         
                <UButton type="submit" class="text-xl" :loading="state.loading">
                    Update
                </UButton>
        </UForm>
    </div>
</template>

//update has to be done in firestore too