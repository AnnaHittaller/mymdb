import { DISCOVER_SORT_DEFAULT } from "~/constants/discoverFilters"
import type { DiscoverSortKey } from "~/constants/discoverFilters"

export function useDiscoverFilterLabels() {
	const { t } = useI18n()

	const ratingItems = computed(() => [
		{ label: t("browse.anyRating"), value: 0 },
		{ label: t("browse.ratingPlus", { value: 8 }), value: 8 },
		{ label: t("browse.ratingPlus", { value: 7 }), value: 7 },
		{ label: t("browse.ratingPlus", { value: 6 }), value: 6 },
		{ label: t("browse.ratingPlus", { value: 5 }), value: 5 },
		{ label: t("browse.ratingPlus", { value: 4 }), value: 4 },
		{ label: t("browse.ratingPlus", { value: 3 }), value: 3 },
		{ label: t("browse.ratingPlus", { value: 2 }), value: 2 },
	])

	const discoverSortItems = computed(
		(): { label: string; value: DiscoverSortKey }[] => [
			{ label: t("browse.popularity"), value: DISCOVER_SORT_DEFAULT },
			{ label: t("browse.highestRated"), value: "rating.desc" },
			{ label: t("browse.lowestRated"), value: "rating.asc" },
			{ label: t("browse.newest"), value: "release.desc" },
		],
	)

	return { ratingItems, discoverSortItems }
}