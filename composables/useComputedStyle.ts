import { computed } from "vue";
import { useCurrentUser } from "vuefire";

const DEFAULT_THEME = "emerald";

export const useComputedStyle = () => {
	const { theme } = useUserDocument();
	const user = useCurrentUser();
	const config = useAppConfig();

	const effectiveTheme = computed(() => {
		if (!user.value) {
			return DEFAULT_THEME;
		}
		return theme.value || DEFAULT_THEME;
	});

	watchEffect(() => {
		const themeName = effectiveTheme.value;
		config.ui.colors.primary = themeName;
		if (typeof document !== "undefined") {
			document.documentElement.style.setProperty(
				"--color-accent",
				`var(--color-${themeName}-500)`,
			);
		}
	});

	return { effectiveTheme };
};
