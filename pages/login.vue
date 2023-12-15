<script setup lang="ts">
definePageMeta({
    layout: "not-logged-in",
})

const { sayHello } = useSample()
sayHello()

import { useCounterStore } from "~/stores/testStore"
const store = useCounterStore()
//console.log(store)

const response = await $fetch("/api/hello")
//console.log(response)

const { data } = await useFetch('/api/hello')
//console.log("data:", data) //both works but we need here data.value
//console.log(toRaw(data.value))
import type { FormError, FormSubmitEvent } from '#ui/types'

const state = reactive({
    username: undefined,
    password: undefined
})

const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.username) errors.push({ path: 'username', message: 'Required' })
    if (!state.password) errors.push({ path: 'password', message: 'Required' })
    return errors
}

async function onSubmit(event: FormSubmitEvent<any>) {
    // Do something with data
    console.log("SUBMIT EVENT LOGIN", event.data)
}
</script>

<template>
    <div class="max-w-[700px] mx-auto">
        <Heading>Sign in</Heading>
        <UForm :validate="validate" :state="state" class="space-y-4 w-full pt-8 " @submit="onSubmit">
            <UFormGroup label="Username or email" name="username" required size="xl">
                <UInput v-model="state.username" placeholder="Username or email" size="xl" :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }"
                    class="mt-2" />
            </UFormGroup>

            <UFormGroup label="Password " name="password" required size="xl">
                <UInput v-model="state.password" placeholder="Password" size="xl" :ui="{ size: { xl: 'text-xl' }, placeholder: 'placeholder:italic' }"
                    class="mt-2" type="password" />
            </UFormGroup>

            <div class="flex items-center justify-between pt-8 max-[350px]:flex-col max-[350px]:gap-8">
                <UButton type="submit" class="text-xl">
                    Sign in
                </UButton>
                <div class="flex items-center gap-3 max-[250px]:flex-col max-[250px]:gap-4">
                    <p class="text-lg">Don't have an account yet?</p>
                    <NuxtLink to="/" class="text-lg text-primary font-semibold flex items-center gap-1">
                        <UIcon name="i-heroicons-chevron-double-right-20-solid" class="text-xl" />
                        Register
                    </NuxtLink>
                </div>
            </div>
        </UForm>
    </div>
</template>