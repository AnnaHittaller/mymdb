import { doc, getDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import {
	DEFAULT_APP_LOCALE,
	isAppLocale,
	type AppLocale,
} from "~/domain/locale/appLocale";
import { defaultUsername, ensureUserProfile } from "~/composables/userProfile";

function detectBrowserLocale(): AppLocale {
	if (typeof navigator === "undefined") return DEFAULT_APP_LOCALE;
	for (const raw of navigator.languages?.length ? navigator.languages : [navigator.language]) {
		const base = (raw.split("-")[0] ?? "").toLowerCase();
		if (isAppLocale(base)) return base;
	}
	return DEFAULT_APP_LOCALE;
}

export function shouldOfferLocaleAfterSignIn(wasNewUser: boolean, profileLocale: unknown): boolean {
	const browser = detectBrowserLocale();
	if (browser === DEFAULT_APP_LOCALE) return false;
	if (wasNewUser) return true;
	if (profileLocale === undefined || profileLocale === null || profileLocale === "") {
		return true;
	}
	return false;
}

export function useSignInLocalePrompt() {
	const db = useFirestore();
	const userDocument = useUserDocument();
	const { changeLocale } = useLocaleProfileSync(userDocument);
	const open = ref(false);
	const loading = ref(false);
	const pendingDestination = ref("/");
	const suggestedLocale = ref<AppLocale>(detectBrowserLocale());
	const pendingNavigation = ref<(() => Promise<void>) | null>(null);

	async function offerLocaleAfterSignIn(
		destination: string,
		wasNewUser: boolean,
		profileLocale: unknown,
	) {
		if (!shouldOfferLocaleAfterSignIn(wasNewUser, profileLocale)) {
			await navigateTo(destination, { replace: true });
			return;
		}
		suggestedLocale.value = detectBrowserLocale();
		pendingDestination.value = destination;
		open.value = true;
		pendingNavigation.value = async () => {
			await navigateTo(destination, { replace: true });
		};
	}

	async function finishAuthAndOfferLocale(
		user: User,
		email: string,
		destination: string,
		username?: string,
	) {
		const ref = doc(db, "users", user.uid);
		const existingBefore = await getDoc(ref);
		const wasNew = !existingBefore.exists();
		await ensureUserProfile(db, user, {
			username: username?.trim() || defaultUsername(user, email),
			email,
		});
		const profileLocale = (await getDoc(ref)).data()?.locale;
		await offerLocaleAfterSignIn(destination, wasNew, profileLocale);
	}

	async function confirmLocale(choice: AppLocale) {
		loading.value = true;
		try {
			await changeLocale(choice);
			open.value = false;
			await pendingNavigation.value?.();
			pendingNavigation.value = null;
		} finally {
			loading.value = false;
		}
	}

	async function keepEnglishAndContinue() {
		open.value = false;
		await pendingNavigation.value?.();
		pendingNavigation.value = null;
	}

	return {
		open,
		loading,
		suggestedLocale,
		offerLocaleAfterSignIn,
		finishAuthAndOfferLocale,
		confirmLocale,
		keepEnglishAndContinue,
		detectBrowserLocale,
	};
}