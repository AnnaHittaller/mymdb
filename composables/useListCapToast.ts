import { ListCapError, ListCountCapError } from "~/domain/user-document/listConstants";

export function useListCapToast() {
	const toast = useToast();
	const { t } = useI18n();

	function notifyListError(error: unknown) {
		if (error instanceof ListCapError) {
			toast.add({
				title: t("lists.listFull"),
				description: t("lists.listFullDescription"),
				color: "error",
			});
			return true;
		}
		if (error instanceof ListCountCapError) {
			toast.add({
				title: t("lists.tooManyLists"),
				description: t("lists.tooManyListsDescription"),
				color: "error",
			});
			return true;
		}
		return false;
	}

	return { notifyListError };
}
