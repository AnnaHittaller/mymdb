<template>
    <div>
        <Heading>My profile</Heading>
        <div class="flex items-center flex-col py-8 gap-4 pb-16">
            <UAvatar src="" :ui="{ background: 'dark:bg-gray-900', placeholder: 'dark:text-primary' }"
                :alt="`${user?.displayName}`" size="3xl" class="avatar border mb-4" />
            <div class="flex items-center gap-4">
                <p class="text-4xl">{{ user?.displayName }}</p>
                <NuxtLink to="./profile/update">
                    <UIcon name="i-heroicons-pencil-solid"
                        class="text-primary sm:text-3xl text-2xl hover:scale-125 transition" />
                </NuxtLink>
            </div>
            <p class="text-2xl -mt-2 text-zinc-400">{{ user?.email }}</p>
            <div class="flex max-[440px]:flex-col gap-4 mt-4">
                <UButton to="./profile/update" icon="i-heroicons-arrow-left-on-rectangle" label="Sign out" size="xl"
                    class="text-2xl" @click="logout" />

                <UButton icon="i-heroicons-x-circle" variant="outline" label="Delete profile" size="xl" class="text-2xl"
                    @click="isOpen = true" />
            </div>
            <!-- TODO: fix modal for mobile -->
            <UModal v-model="isOpen"
                :ui="{ margin: 'sm:my-8', wrapper: 'relative top-[100px] border-2 border-red-500' }" class="top-0">
                <div class="p-4 ">
                    <h4 class="text-red-500 text-center text-lg mb-8">Are you sure you want to delete your profile? This
                        action is irreversible and all
                        of your data will be lost. </h4>
                    <div
                        class="flex items-center justify-center gap-8 max-[300px]:flex-col max-[300px]:gap-4 max-[300px]:mb-4">
                        <UButton icon="" label="Cancel" size="md" class="text-md duration-150" color="green"
                            @click="isOpen = false" />
                        <UButton icon="" label="Yes, delete my profile" size="md" class="text-md duration-150"
                            color="red" @click="deleteCurrentUser" />
                    </div>
                </div>
            </UModal>
        </div>

    </div>
    <div>
        <Heading>Change theme color</Heading>
        <ColorSelector />
    </div>
</template>

<script setup>
import { signOut } from 'firebase/auth';

definePageMeta({
    middleware: "auth"
})

// const { currentUserPromise, deleteUserAccount } = useFirebaseAuth()
// const { getUser, deleteUserDoc } = useFirestore()

// const userData = await currentUserPromise()
// const user = await getUser(userData.uid)
//console.log("User:", user)

const auth = useFirebaseAuth()
const user = useCurrentUser()

const isOpen = ref(false)

const logout = async () => {
    await signOut(auth)
    navigateTo('/login', { replace: true })
}

const deleteCurrentUser = async () => {
    //deleting user from Firebase
    // deleteUserAccount()
    // //deleting user doc from Firestore DB
    // await deleteUserDoc(userData.uid)
    // navigateTo('/login')
}

</script>
