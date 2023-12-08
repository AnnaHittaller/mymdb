import { defineStore } from "pinia";

export const useUiColorStore = defineStore("colorStore", () => {
	const config = useAppConfig();
	const uiColor = ref("emerald");

	function updatePrimaryColor(color) {
		config.ui.primary = color;
		uiColor.value = config.ui.primary;
		console.log("uiColor:", uiColor.value);
	}

	function handlePrimaryColorChange(event) {
		const selectedColor = event.target.value;
		updatePrimaryColor(selectedColor);
	}

	return { config, uiColor, handlePrimaryColorChange };
});
