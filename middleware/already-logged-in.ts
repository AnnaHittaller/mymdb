export default defineNuxtRouteMiddleware(async(to, from) => {
console.log("logged in auth says hi")
        const { currentUserPromise } = useFirebaseAuth();
try{
        const currentUser = await currentUserPromise();

        // For authenticated users
        if (currentUser) {
             return await navigateTo('/'); 
        }
 } catch (error: any) {
        console.error("Error getting current user:", error);
        // Handle error or redirect as needed
        if (error.message === "No user found" && to.path === '/register' || error.message === "No user found" && to.path === '/login' || error.message === "No user found" && to.path === '/forgot-password') {
            return;
        }

        return await navigateTo('/login');
    }
})