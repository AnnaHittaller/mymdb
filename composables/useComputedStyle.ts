import { computed } from "vue";

export const useComputedStyle = () => {
	const user = useCurrentUser();
	const db = useFirestore();
	const userData = useUserData(db, user.value?.uid as string);
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
		const colorValue = themeColors[userData.value?.theme] || "#10b981"; // Default to emerald
		return { "--computed-style": colorValue };
	});

	watchEffect(() => {
		config.ui.primary = userData.value?.theme;
		document.documentElement.style.setProperty(
			"--computed-style",
			computedStyle.value["--computed-style"]
		);
	});

	return { computedStyle };
};
