<script setup lang="ts">
const { theme, setTheme } = useUserDocument()

const selectedColor = ref('')

const colors = [
    { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500 hover:bg-emerald-500/75' },
    { value: 'mandy', label: 'Mandy', class: 'bg-mandy-500 hover:bg-mandy-500/75' },
    { value: 'dusk', label: 'Dusk', class: 'bg-dusk-500 hover:bg-dusk-500/75' },
    { value: 'pumpkin', label: 'Pumpkin', class: 'bg-pumpkin-500 hover:bg-pumpkin-500/75' },
    { value: 'mauve', label: 'Mauve', class: 'bg-mauve-500 hover:bg-mauve-500/75' },
    { value: 'periwinkle', label: 'Periwinkle', class: 'bg-periwinkle-500 hover:bg-periwinkle-500/75' },
    { value: 'saffron', label: 'Saffron', class: 'bg-saffron-500 hover:bg-saffron-500/75' },
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
                    :class="[color.class, 'rounded-lg cursor-pointer text-lg transition-colors duration-200', color.value === theme ? 'ring-2 ring-primary ring-offset-4 ring-offset-surface-page' : '']">
                    {{ color.label }}
                </UBadge>
            </label>
        </div>
    </div>
</template>
