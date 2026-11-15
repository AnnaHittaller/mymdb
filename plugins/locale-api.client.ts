import { unref } from "vue"
import { normalizeAppLocale } from "~/domain/locale/appLocale"

export default defineNuxtPlugin({
	name: "mymdb-locale-api",
	enforce: "post",
	setup(nuxtApp) {
		const nuxtFetch = globalThis.$fetch

		globalThis.$fetch = ((request: RequestInfo, options?: Parameters<typeof $fetch>[1]) => {
			const url = typeof request === "string" ? request : request.url
			const isApi =
				url.startsWith("/api/")
				|| (url.startsWith("http") && url.includes("/api/"))
			if (!isApi) {
				return nuxtFetch(request, options)
			}
			const nextOptions = { ...(options ?? {}) }
			const headers = new Headers((nextOptions.headers ?? {}) as HeadersInit)
			headers.set("x-mymdb-locale", normalizeAppLocale(unref(nuxtApp.$i18n.locale)))
			nextOptions.headers = headers
			return nuxtFetch(request, nextOptions)
		}) as typeof nuxtFetch
	},
})