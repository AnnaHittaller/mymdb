export default defineNuxtRouteMiddleware((to, from) => {
	if (import.meta.server) return;

	const arrivedFromInApp = from.matched.length > 0 && from.fullPath !== to.fullPath;

	const stackBackAllowed = useState("stackBackAllowed", () => false);

	stackBackAllowed.value = arrivedFromInApp;
});