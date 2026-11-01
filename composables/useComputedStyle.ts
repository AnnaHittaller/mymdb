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
		config.ui.colors.primary = effectiveTheme.value;
	});

	return { effectiveTheme };
};
