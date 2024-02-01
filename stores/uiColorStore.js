import { defineStore } from "pinia";
import { useFirestore } from "@/composables/useFirestore";
import { useFirebaseAuth } from "@/composables/useFirebaseAuth";

export const useUiColorStore = defineStore("colorStore", () => {
	const { currentUserPromise } = useFirebaseAuth();
	const { getUser } = useFirestore();
	const config = useAppConfig();
	const uiColor = ref("emerald");

	// Fetch initial color from Firebase when the store is created
	const initialize = async () => {
		const userData = await currentUserPromise();
		const user = await getUser(userData.uid);
		uiColor.value = user.theme || "emerald"; // Set to default if theme is not available
		config.ui.primary = uiColor.value;
	};

	const colorReset = async () => {
		uiColor.value = "emerald";
		config.ui.primary = uiColor.value;
	};

	initialize();

	return { config, uiColor, initialize, colorReset };
});
