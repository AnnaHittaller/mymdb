        
<script setup lang="ts">
// const colorStore = useUiColorStore()
// const { currentUserPromise } = useFirebaseAuth()
// const { updateTheme } = useFirestore()

// const userData = await currentUserPromise()

const user = useCurrentUser()
const db = useFirestore()

const userData = useUserData(db, user.value?.uid as string);

let selectedColor = ref('')

const colors = [
    { value: 'emerald', label: 'Emerald' },
    { value: 'mandy', label: 'Mandy' },
    { value: 'dusk', label: 'Dusk' },
    { value: 'pumpkin', label: 'Pumpkin' },
    { value: 'mauve', label: 'Mauve' },
    { value: 'periwinkle', label: 'Periwinkle' },
    { value: 'saffron', label: 'Saffron' },

    // Add more colors as needed
]

const updateColor = async (color) => {
    selectedColor.value = color; // Update the selectedColor value
    await updateTheme(db, user.value?.uid as string, color)
}

//TODO: add special class for current color button
</script>
        
<template>
    <div class="flex flex-wrap gap-4 pt-4 justify-center">
        <div v-for="color in colors" :key="color.value" class="inline-block">
            <label :for="color.value">
                <input type="radio" :id="color.value" :value="color.value" v-model="selectedColor"
                    @change="updateColor(color.value)" class="hidden" />
                <UBadge :color="color.value" :class="color.value === userData.theme ? 'ring-2 ring-primary ring-offset-4 ring-offset-gray-800' : ''" size="lg" class="cursor-pointer text-lg">{{ color.label }}</UBadge>
            </label>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>