import { computed } from "vue";
import { useCurrentUser } from "vuefire";

const DEFAULT_THEME = "emerald";
const DEFAULT_COLOR = "#10b981";

export const useComputedStyle = () => {
	const { theme } = useUserDocument();
	const user = useCurrentUser();
	const config = useAppConfig();

	const themeColors: Record<string, string> = {
		mandy: "#ea546c",
		dusk: "#839dd1",
		emerald: DEFAULT_COLOR,
		pumpkin: "#ff8c0a",
		mauve: "#bf6ddf",
		periwinkle: "#7976de",
		saffron: "#f5c518",
	};

	const effectiveTheme = computed(() => {
		if (!user.value) {
			return DEFAULT_THEME;
		}
		return theme.value || DEFAULT_THEME;
	});

	const cssColor = computed((): string => {
		return themeColors[effectiveTheme.value] ?? DEFAULT_COLOR;
	});

	const computedStyle = computed(() => ({
		"--computed-style": cssColor.value,
	}));

	watchEffect(() => {
		config.ui.colors.primary = effectiveTheme.value;
		if (typeof document !== "undefined") {
			document.documentElement.style.setProperty(
				"--computed-style",
				cssColor.value
			);
		}
	});

	return { computedStyle, effectiveTheme, cssColor };
};
