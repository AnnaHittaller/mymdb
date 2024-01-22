<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'

const state = reactive({
    subject: undefined,
    message: undefined
})

const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.subject) errors.push({ path: 'subject', message: 'Required' })
    if (!state.message) errors.push({ path: 'message', message: 'Required' })
    return errors
}

async function onSubmit(event: FormSubmitEvent<any>) {
    // Do something with data
    console.log("CONTACT FORM SUBMIT EVENT", event.data)
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
                    :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }" class="mt-2 " />
            </UFormGroup>
            <UButton type="submit" class="text-xl">
                Send message
            </UButton>
        </UForm>
    </div>
</template>

