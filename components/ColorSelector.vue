        
<script setup>
const colorStore = useUiColorStore()

let selectedColor = ref('') // Selected color value
const colors = [
    { value: 'emerald', label: 'Emerald' },
    { value: 'mandy', label: 'Mandy' },
    { value: 'dusk', label: 'Dusk' },
    // Add more colors as needed
]

function updateColor(color) {
    selectedColor.value = color; // Update the selectedColor value
    colorStore.handlePrimaryColorChange({ target: { value: color } }); // Call the store method with the color value
}

</script>
        
<template>
    <div class="flex gap-4">
        <div v-for="color in colors" :key="color.value" class="inline-block">
            <label :for="color.value" >
                <input type="radio" :id="color.value" :value="color.value" v-model="selectedColor"
                    @change="updateColor(color.value)" class="hidden" />
                <UBadge :color="color.value" size="lg" class="cursor-pointer">{{ color.label }}</UBadge>
            </label>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>