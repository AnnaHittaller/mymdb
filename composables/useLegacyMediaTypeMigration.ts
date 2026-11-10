import type { ComputedRef } from "vue";
import { inferMediaTypeHints } from "~/domain/user-document/inferMediaTypeHints";
import type { CatalogUpdate } from "~/domain/user-document/createUserDocument";
import type { MediaTypeHint } from "~/domain/user-document/reconcileWatchlist";
import type { UserMovie } from "~/types/movie";

/**
 * One-time backfill for watchlist rows saved before mediaType existed.
 * The user-document module only receives hints; this composable owns the catalog request.
 */
export function useLegacyMediaTypeMigration(documentApi: {
	movies: ComputedRef<UserMovie[]>;
	repairWatchlist: (hints: MediaTypeHint[]) => Promise<void>;
}) {
	const user = useCurrentUser();
	const { movies, repairWatchlist } = documentApi;
	if (import.meta.server) return;

	const runs = new Set<string>();
	watch(
		() => {
			const uid = user.value?.uid;
			return uid && movies.value.some((movie) => !movie.mediaType) ? uid : null;
		},
		(uid) => {
			if (!uid || runs.has(uid)) return;
			runs.add(uid);
			void (async () => {
				try {
					const hints = await inferMediaTypeHints(movies.value, (entries) =>
						$fetch<CatalogUpdate[]>("/api/catalog/summaries", { query: { entries } }),
					);
					if (user.value?.uid !== uid) {
						runs.delete(uid);
						return;
					}
					if (hints.length > 0) {
						await repairWatchlist(hints);
					}
				} catch {
					runs.delete(uid);
				}
			})();
		},
		{ immediate: true },
	);
}
