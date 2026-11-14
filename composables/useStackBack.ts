import { stackBackConfigForName } from "~/constants/stackNavigation";

const BACK_LABEL = "Back";

export function useStackBack() {
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

	return {
		visible,
		backLinkLabel: BACK_LABEL,
		goBack,
	};
}