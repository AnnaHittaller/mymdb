import { defineStore } from "pinia";
import { useFirestore } from "@/composables/useFirestore";
import { useFirebaseAuth } from "@/composables/useFirebaseAuth";

export const useUiColorStore = defineStore("colorStore", () => {
	const { currentUserPromise } = useFirebaseAuth();
	const { getUser } = useFirestore();
	const config = useAppConfig();
	// const themeColor = user.theme
	// config.ui.primary = themeColor
	const uiColor = ref("emerald");

	// Fetch initial color from Firebase when the store is created
	const initialize = async () => {
		const userData = await currentUserPromise();
		const user = await getUser(userData.uid);
		uiColor.value = user.theme || "emerald"; // Set to default if theme is not available
		config.ui.primary = uiColor.value;
	};

	const colorReset = async () => {
		console.log("reset first");
		uiColor.value = "emerald";
		config.ui.primary = uiColor.value;
		console.log("reset second");
	};

	// function updatePrimaryColor(color) {
	// 	config.ui.primary = color;
	// 	uiColor.value = config.ui.primary;
	// 	console.log("uiColor:", uiColor.value);
	// }

	// function handlePrimaryColorChange(event) {
	// 	const selectedColor = event.target.value;
	// 	updatePrimaryColor(selectedColor);
	// }

	initialize();

	return { config, uiColor, initialize, colorReset };
});
