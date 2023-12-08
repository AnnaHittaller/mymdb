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
    console.log(event.data)
}
</script>

<template>
    <UForm :validate="validate" :state="state" class="space-y-4 max-w-lg" @submit="onSubmit" >
        <UFormGroup label="Subject" name="subject" required>
            <UInput v-model="state.subject" placeholder="Subject" size="md" />
        </UFormGroup>

        <UFormGroup label="Message" name="message"  required >
            <UTextarea v-model="state.message" placeholder="Message" :rows="5" />
        </UFormGroup>

        <UButton type="submit">
            Send message
        </UButton>
    </UForm>
</template>

