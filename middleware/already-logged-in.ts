export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser()

  if (user) {
    return await navigateTo(pathFromRedirect(to.query.redirect))
  }
})
