<script setup>
definePageMeta({
    middleware: "auth"
})

const { currentUserPromise, deleteUserAccount } = useFirebaseAuth()
const { getUser, deleteUserDoc } = useFirestore()

const userData = await currentUserPromise()
const user = await getUser(userData.uid)
//console.log("User:", user)

const isOpen = ref(false)

const deleteCurrentUser = async () => {
    //deleting user from Firebase
    deleteUserAccount()
    //deleting user doc from Firestore DB
    await deleteUserDoc(userData.uid)
    navigateTo('/login')
}

</script>
            
<template>
    <div>
        <Heading>My Profile</Heading>
        <div class="flex items-center flex-col py-8 gap-4">
            <UAvatar src="" :ui="{ background: 'dark:bg-gray-900', placeholder: 'dark:text-primary' }"
                :alt="`${user?.username}`" size="3xl" class="avatar border mb-4" />
            <div class="flex items-center gap-4">
                <p class="text-4xl">{{ user?.username }}</p>
                <NuxtLink to="./profile/update">
                    <UIcon name="i-heroicons-pencil-solid" class="text-primary sm:text-3xl text-2xl hover:scale-125 transition" />
                </NuxtLink>
            </div>
            <p class="text-2xl -mt-2 text-zinc-400">{{ user?.email }}</p>
            <!-- <NuxtLink to="./profile/update">
                <UButton icon="" label="Update my data" size="xl" class="text-2xl mt-4" />
            </NuxtLink> -->
            <UButton icon="" variant="outline" label="Delete profile" size="xl" class="text-2xl mt-8"
                @click="isOpen = true" />
            <UModal v-model="isOpen" :ui="{ margin: 'sm:my-8', wrapper: 'relative top-[100px] border-2 border-red-500'}" class="top-0">
                <div class="p-4 ">
                    <h4 class="text-red-500 text-center text-lg mb-8">Are you sure you want to delete your profile? This
                        action is irreversible and all
                        of your data will be lost. </h4>
                    <div
                        class="flex items-center justify-center gap-8 max-[300px]:flex-col max-[300px]:gap-4 max-[300px]:mb-4">
                        <UButton icon="" label="Cancel" size="md" class="text-md duration-150" color="green"
                            @click="isOpen = false" />
                        <UButton icon="" label="Yes, delete my profile" size="md" class="text-md duration-150" color="red"
                            @click="deleteCurrentUser" />
                    </div>
                </div>
            </UModal>
        </div>
    </div>
</template>


<style scoped></style>