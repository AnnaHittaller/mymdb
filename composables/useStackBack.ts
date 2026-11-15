import { stackBackConfigForName } from "~/constants/stackNavigation";

export function useStackBack() {
	const { t } = useI18n();
	const route = useRoute();
	const router = useRouter();

	const stackBackAllowed = useState("stackBackAllowed", () => false);

	const config = computed(() => stackBackConfigForName(route.name));

	const visible = computed(() => config.value !== null);

	async function goBack() {
		if (stackBackAllowed.value) {
			router.back();
			return;
		}
		const fallback = config.value?.fallback;
		if (fallback) {
			await navigateTo(fallback);
		}
	}

	const backLinkLabel = computed(() => t("common.back"));

	return {
		visible,
		backLinkLabel,
		goBack,
	};
}