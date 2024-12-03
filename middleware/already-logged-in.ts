// export default defineNuxtRouteMiddleware(async(to, from) => {
//         //console.log("logged in auth says hi")
//         const { currentUserPromise } = useFirebaseAuth();
//     try{
//         const currentUser = await currentUserPromise();

//         // For authenticated users
//         if (currentUser) {
//              return await navigateTo('/'); 
//         }
//     } catch (error: any) {
//        // console.error("Error getting current user:", error);

//         if (error.message === "No user found" && to.path === '/register' || error.message === "No user found" && to.path === '/login' || error.message === "No user found" && to.path === '/forgot-password') {
//             return;
//         }

//         return await navigateTo('/login');
//     }
// })

export default defineNuxtRouteMiddleware(async (to, from) => {
  //get current user
  const user = await getCurrentUser()

  // redirect the user to the login page
  if (user) {
    return await navigateTo('/')
  }
})