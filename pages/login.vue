<script setup>
definePageMeta({
    layout: "not-logged-in",
})

const { sayHello } = useSample()
sayHello()

import { useCounterStore } from "~/stores/testStore"
const store = useCounterStore()
console.log(store)

const response = await $fetch("/api/hello")
console.log(response)

const { data } = await useFetch('/api/hello')
console.log("data:", data) //both works but we need here data.value
console.log(toRaw(data.value))
</script>

<template>
    <div>
        login page
        <p>{{ data.hello }}</p>
        <MovieSlider />
    </div>
</template>