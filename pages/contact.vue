<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'
const { currentUserPromise } = useFirebaseAuth()
const userData: any = await currentUserPromise()

definePageMeta({
    middleware: "auth"
})

const state = reactive({
    subject: undefined,
    message: undefined,
    error: undefined,
    loading: false,
    success: false
})

const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.subject) errors.push({ path: 'subject', message: 'Required' })
    if (!state.message) errors.push({ path: 'message', message: 'Required' })
    return errors
}

async function onSubmit(event: FormSubmitEvent<any>) {
    //console.log("CONTACT FORM SUBMIT EVENT", event.data, userData.email)
    state.loading = true

    try {
        const userData: any = await currentUserPromise()

        await $fetch('https://formspree.io/f/myyrkroy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: state.subject,
                message: state.message,
                email: userData.email
            })
        })

        //console.log('Form submitted successfully')
        state.loading = false
        if (!state.error) {
            state.success = true
            state.subject = undefined
            state.message = undefined

        }

    } catch (error: any) {
        console.error('Error submitting form:', error)
        state.error = error.message;
        state.loading = false
        state.success = false
    }
}
</script>

<template>
    <div class="max-w-[700px]">
        <Heading>Contact</Heading>
        <UForm :validate="validate" :state="state" class="space-y-4 w-full pt-8 " @submit="onSubmit">
            <UFormGroup label="Subject " name="subject" required size="xl">
                <UInput v-model="state.subject" placeholder="Subject" size="xl"
                    :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }" class="mt-2" />
            </UFormGroup>

            <UFormGroup label="Message " name="message" required class="pb-8" size="xl">
                <UTextarea v-model="state.message" placeholder="Message" size="xl" :rows="5" autoresize
                    :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }" class="mt-2" />
            </UFormGroup>

            <UNotification id="error-notification-login" title="Error:" :description="state.error" v-if="state.error"
                :timeout="0" @close="state.error = undefined" icon="i-heroicons-exclamation-circle" color="red" class="mb-2"/>

            <UNotification id="success-notification-login" title="Thank you for your message!"
                v-if="state.success" :timeout="5000" @close="state.success = false" icon="i-heroicons-check-circle"
                color="green" class="mb-8"/>

            <UButton type="submit" class="text-xl">
                Send message
            </UButton>
        </UForm>
    </div>
</template>

