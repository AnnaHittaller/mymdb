import { tmdbLanguageToIso639, type AppLocale } from "./appLocale"

/** TMDB TV genre IDs whose names stay English in de/hu. */
export const TMDB_TV_GENRE_OVERLAY_IDS = [10759, 10765, 10768] as const

const TMDB_TV_GENRE_LABELS: Record<(typeof TMDB_TV_GENRE_OVERLAY_IDS)[number], Record<AppLocale, string>> = {
	10759: {
		en: "Action & Adventure",
		de: "Action und Abenteuer",
		hu: "Akció és kaland",
	},
	10765: {
		en: "Sci-Fi & Fantasy",
		de: "Sci-Fi und Fantasy",
		hu: "Sci-fi és fantasy",
	},
	10768: {
		en: "War & Politics",
		de: "Krieg und Politik",
		hu: "Háború és politika",
	},
}

const LABELS_BY_ENGLISH_NAME = new Map<string, Record<AppLocale, string>>(
	TMDB_TV_GENRE_OVERLAY_IDS.map((id) => [TMDB_TV_GENRE_LABELS[id].en, TMDB_TV_GENRE_LABELS[id]]),
)

export function localizeTmdbGenreName(
	name: string,
	languageOrLocale: string,
	id?: number,
): string {
	const locale = tmdbLanguageToIso639(languageOrLocale)
	if (id === 10759 || id === 10765 || id === 10768) {
		return TMDB_TV_GENRE_LABELS[id][locale]
	}
	const byName = LABELS_BY_ENGLISH_NAME.get(name)
	return byName ? byName[locale] : name
}

export function localizeTmdbGenreNames(names: string[], languageOrLocale: string): string[] {
	return names.map((name) => localizeTmdbGenreName(name, languageOrLocale))
}

export function localizeTmdbGenreEntries<T extends { id: number; name: string }>(
	genres: T[],
	languageOrLocale: string,
): T[] {
	return genres.map((genre) => ({
		...genre,
		name: localizeTmdbGenreName(genre.name, languageOrLocale, genre.id),
	}))
}

export function overlayTmdbGenreNameMap(
	map: Map<number, string>,
	languageOrLocale: string,
): Map<number, string> {
	const next = new Map(map)
	for (const [id, name] of next) {
		next.set(id, localizeTmdbGenreName(name, languageOrLocale, id))
	}
	return next
}