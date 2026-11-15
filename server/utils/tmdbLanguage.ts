import type { H3Event } from "h3"
import {
	APP_LOCALE_COOKIE,
	appLocaleToTmdbLanguage,
	DEFAULT_APP_LOCALE,
	normalizeAppLocale,
} from "~/domain/locale/appLocale"

export function localeFromCookieHeader(cookieHeader: string | undefined): string | null {
	if (!cookieHeader) return null
	for (const part of cookieHeader.split(";")) {
		const trimmed = part.trim()
		if (!trimmed.startsWith(`${APP_LOCALE_COOKIE}=`)) continue
		const value = decodeURIComponent(trimmed.slice(APP_LOCALE_COOKIE.length + 1))
		return value || null
	}
	return null
}

/** Prefer the live request header over the cookie so locale switches are not one request behind. */
export function pickAppLocaleFromRequest(options: {
	override?: string | null
	header?: string | null
	cookieHeader?: string
}) {
	if (options.override) return normalizeAppLocale(options.override)
	if (options.header) return normalizeAppLocale(options.header)
	const fromCookie = localeFromCookieHeader(options.cookieHeader)
	if (fromCookie) return normalizeAppLocale(fromCookie)
	return DEFAULT_APP_LOCALE
}

export function resolveTmdbLanguage(event?: H3Event, override?: string): string {
	if (!event) {
		return appLocaleToTmdbLanguage(pickAppLocaleFromRequest({ override }))
	}
	const query = getQuery(event)
	const queryLanguage = typeof query.language === "string" ? query.language : undefined
	return appLocaleToTmdbLanguage(
		pickAppLocaleFromRequest({
			override: override ?? queryLanguage,
			header: getRequestHeader(event, "x-mymdb-locale"),
			cookieHeader: getRequestHeader(event, "cookie"),
		}),
	)
}