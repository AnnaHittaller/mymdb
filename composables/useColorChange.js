export const useColorChange = () => {
	const config = useAppConfig();

	function updatePrimaryColor(color) {
		config.ui.primary = color;
	}

	function handlePrimaryColorChange(event) {
		const selectedColor = event.target.value;
		updatePrimaryColor(selectedColor);
	}

    return {
        handlePrimaryColorChange,
        updatePrimaryColor,
        config
    }
};
