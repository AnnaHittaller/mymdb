export default defineNuxtRouteMiddleware((to, from) => {
   // const isLoggedIn = false
    console.log("hello from middleware auth")
    // if(isLoggedIn) {
    //     return navigateTo(to.fullPath)
    // } else {
    //     return navigateTo("/login")
    // }
})

function defineNuxtRouteMiddleware(arg0: (to: any, from: any) => void) {
    throw new Error("Function not implemented.");
}
