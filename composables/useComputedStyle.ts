import { computed } from "vue";

export const useComputedStyle = () => {
	const { theme } = useUserDocument();
	const config = useAppConfig();

	const themeColors: Record<string, string> = {
		mandy: "#ea546c",
		dusk: "#839dd1",
		emerald: "#10b981",
		pumpkin: "#ff8c0a",
		mauve: "#bf6ddf",
		periwinkle: "#7976de",
		saffron: "#f5c518",
	};

	const computedStyle = computed(() => {
		const colorValue = themeColors[theme.value] || "#10b981";
		return { "--computed-style": colorValue };
	});

	watchEffect(() => {
		if (theme.value) {
			config.ui.primary = theme.value;
		}
		if (typeof document !== "undefined") {
			document.documentElement.style.setProperty(
				"--computed-style",
				computedStyle.value["--computed-style"]
			);
		}
	});

	return { computedStyle };
};
