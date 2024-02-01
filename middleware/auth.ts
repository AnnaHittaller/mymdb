export default defineNuxtRouteMiddleware(async(to, from) => {

const { currentUserPromise } = useFirebaseAuth();

//console.log("auth middleware says hi");

  try {
        const currentUser = await currentUserPromise();

        // For non-authenticated users
        if (!currentUser) {
            if (['/login', '/register'].includes(to.path)) {
                return; // Allow access to login and register pages for non-authenticated users
            }
            return await navigateTo({
                path: '/login',
                query: {
                    redirect: to.fullPath
                }
            }); 
        }
    } catch (error: any) {
        //console.error("Error getting current user:", error);
        if (error.message === "No user found" && to.path === '/register') {
            return;
        }

        return await navigateTo('/login');
    }

})