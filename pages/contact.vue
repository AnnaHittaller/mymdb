<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { contactSchema, type ContactSchema } from '../schemas/schemas';

const state = reactive({
    subject: undefined,
    message: undefined,
    error: undefined as string | undefined,
    loading: false,
    success: false
})

useFormToasts(state, { successTitle: 'Thank you for your message!', successDuration: 5000 })

const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.subject) errors.push({ path: 'subject', message: 'Required' })
    if (!state.message) errors.push({ path: 'message', message: 'Required' })
    return errors
}

async function onSubmit(event: FormSubmitEvent<ContactSchema>) {
    console.log("CONTACT FORM SUBMIT EVENT", event.data)
    // state.loading = true

    // try {
    //     const userData: any = await currentUserPromise()

    //     await $fetch('https://formspree.io/f/myyrkroy', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             subject: state.subject,
    //             message: state.message,
    //             email: userData.email
    //         })
    //     })

    //     //console.log('Form submitted successfully')
    //     state.loading = false
    //     if (!state.error) {
    //         state.success = true
    //         state.subject = undefined
    //         state.message = undefined

    //     }

    // } catch (error: any) {
    //     console.error('Error submitting form:', error)
    //     state.error = error.message;
    //     state.loading = false
    //     state.success = false
    // }
}
</script>

<template>
    <div class="max-w-[700px]">
        <Heading>Contact</Heading>
        <UForm :validate="validate" :schema="contactSchema" :state="state" class="space-y-4 w-full pt-8 "
            @submit="onSubmit">
            <UFormField label="Subject " name="subject" required size="xl">
                <UInput v-model="state.subject" placeholder="Subject" size="xl"
                    :ui="{ base: 'text-xl placeholder:italic' }" class="mt-2" />
            </UFormField>

            <UFormField label="Message " name="message" required class="pb-8" size="xl">
                <UTextarea v-model="state.message" placeholder="Message" size="xl" :rows="5" autoresize
                    :ui="{ base: 'text-xl placeholder:italic' }" class="mt-2" />
            </UFormField>

            <UButton type="submit" class="text-xl">
                Send message
            </UButton>
        </UForm>
    </div>
</template>
