import { defineStore } from "pinia";

export const useUiColorStore = defineStore("ui-color", () => {
	const config = useAppConfig();

	function updatePrimaryColor(color) {
		config.ui.primary = color;
	}

	function handlePrimaryColorChange(event) {
		const selectedColor = event.target.value;
		updatePrimaryColor(selectedColor);
	}


	return { config, updatePrimaryColor, handlePrimaryColorChange };
});
