import { ListCapError, ListCountCapError } from "~/domain/user-document/listConstants";

export function useListCapToast() {
	const toast = useToast();

	function notifyListError(error: unknown) {
		if (error instanceof ListCapError) {
			toast.add({
				title: "List full",
				description: error.message,
				color: "error",
			});
			return true;
		}
		if (error instanceof ListCountCapError) {
			toast.add({
				title: "Too many lists",
				description: error.message,
				color: "error",
			});
			return true;
		}
		return false;
	}

	return { notifyListError };
}
