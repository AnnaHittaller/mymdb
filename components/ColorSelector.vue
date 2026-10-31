<script setup lang="ts">
const { theme, setTheme } = useUserDocument()

const selectedColor = ref('')

const colors = [
    { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500 text-white' },
    { value: 'mandy', label: 'Mandy', class: 'bg-mandy-500 text-white' },
    { value: 'dusk', label: 'Dusk', class: 'bg-dusk-500 text-white' },
    { value: 'pumpkin', label: 'Pumpkin', class: 'bg-pumpkin-500 text-white' },
    { value: 'mauve', label: 'Mauve', class: 'bg-mauve-500 text-white' },
    { value: 'periwinkle', label: 'Periwinkle', class: 'bg-periwinkle-500 text-white' },
    { value: 'saffron', label: 'Saffron', class: 'bg-saffron-500 text-neutral-950' },
]

const updateColor = async (color: string) => {
    selectedColor.value = color; // Update the selectedColor value
    await setTheme(color)
}

</script>
        
<template>
    <div class="flex flex-wrap gap-4 pt-4 justify-center">
        <div v-for="color in colors" :key="color.value" class="inline-block">
            <label :for="color.value">
                <input type="radio" :id="color.value" :value="color.value" v-model="selectedColor"
                    @change="updateColor(color.value)" class="hidden" />
                <UBadge color="neutral" variant="solid" size="lg"
                    :class="[color.class, 'cursor-pointer text-lg', color.value === theme ? 'ring-2 ring-primary ring-offset-4 ring-offset-surface-nav-active' : '']">
                    {{ color.label }}
                </UBadge>
            </label>
        </div>
    </div>
</template>
