<script setup>
const { currentUserPromise } = useFirebaseAuth()
const { getUser, setTheme } = useFirestore()

const userData = await currentUserPromise()
const user = await getUser(userData.uid)

const setNewTheme = async () => {
await setTheme(userData.uid, )
}
</script>

<template>
    <div>
        <Heading>Change theme color</Heading>
        <ColorSelector/>
    </div>
</template>