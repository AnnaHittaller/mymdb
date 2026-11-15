import { ref } from "vue";

export function useGoogleLinkPasswordPrompt() {
	const linkModalOpen = ref(false);
	const linkModalEmail = ref("");
	const linkModalLoading = ref(false);
	let pendingResolve: ((password: string | null) => void) | null = null;

	function promptForPassword(email: string) {
		linkModalEmail.value = email;
		linkModalOpen.value = true;
		linkModalLoading.value = false;
		return new Promise<string | null>((resolve) => {
			pendingResolve = resolve;
		});
	}

	function confirmLinkPassword(password: string) {
		linkModalLoading.value = true;
		pendingResolve?.(password);
		pendingResolve = null;
	}

	function cancelLinkPassword() {
		pendingResolve?.(null);
		pendingResolve = null;
		linkModalOpen.value = false;
		linkModalLoading.value = false;
	}

	function finishLinkPasswordFlow() {
		linkModalOpen.value = false;
		linkModalLoading.value = false;
	}

	return {
		linkModalOpen,
		linkModalEmail,
		linkModalLoading,
		promptForPassword,
		confirmLinkPassword,
		cancelLinkPassword,
		finishLinkPasswordFlow,
	};
}
