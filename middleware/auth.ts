export default defineNuxtRouteMiddleware(async(to, from) => {

const { currentUserPromise } = useFirebaseAuth();

//console.log("auth middleware says hi");

  try {
        const currentUser = await currentUserPromise();

        // For authenticated users
        if (currentUser) {
            if (['/login', '/register'].includes(to.path)) {
                return navigateTo('/');
            }
            return; // Continue to the requested page for authenticated users
        }

        // For non-authenticated users
        if (!currentUser) {
            if (['/login', '/register'].includes(to.path)) {
                return; // Allow access to login and register pages for non-authenticated users
            }
            return navigateTo('/login'); // Redirect non-authenticated users to the login page for other pages
        }
    } catch (error) {
        console.error("Error getting current user:", error);
        // Handle error or redirect as needed
        if (error.message === "No user found" && to.path === '/register') {
            return;
        }

        return navigateTo('/login');
    }

})