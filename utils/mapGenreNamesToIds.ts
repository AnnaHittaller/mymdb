export function mapGenreNamesToIds(
	names: string[],
	genres: { id: number, name: string }[],
): number[] {
	if (names.length === 0 || genres.length === 0) return []
	const byName = new Map(genres.map((genre) => [genre.name.toLowerCase(), genre.id]))
	const ids: number[] = []
	for (const name of names) {
		const id = byName.get(name.toLowerCase())
		if (id !== undefined && !ids.includes(id)) ids.push(id)
	}
	return ids
}
