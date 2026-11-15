import { resolveTmdbLanguage } from "~/server/utils/tmdbLanguage"

export default defineEventHandler((event) => {
	event.context.tmdbLanguage = resolveTmdbLanguage(event)
})