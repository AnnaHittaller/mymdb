import type { MaybeRefOrGetter } from "vue";
import type { UserMovie } from "~/types/movie";
import {
	defaultLibraryListFilterState,
	filterLibraryMovies,
	libraryListFiltersActive,
	type LibraryListFilterState,
} from "~/utils/filterLibraryMovies";

export function useLibraryListFilters(movies: MaybeRefOrGetter<UserMovie[]>) {
	const state = reactive<LibraryListFilterState>(defaultLibraryListFilterState());

	const filteredMovies = computed(() =>
		filterLibraryMovies(toValue(movies), state),
	);

	const filtersActive = computed(() => libraryListFiltersActive(state));

	function clearFilters() {
		const sortByBestRating = state.sortByBestRating;
		Object.assign(state, defaultLibraryListFilterState());
		state.sortByBestRating = sortByBestRating;
	}

	return {
		state,
		filteredMovies,
		filtersActive,
		clearFilters,
	};
}