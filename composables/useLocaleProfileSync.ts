import type { AppLocale } from "~/domain/locale/appLocale"
import { normalizeAppLocale } from "~/domain/locale/appLocale"

type UserDocumentApi = ReturnType<typeof useUserDocument>

export function useLocaleProfileSync(document: UserDocumentApi) {
	const user = useCurrentUser()
	const { locale, setLocale } = useI18n()
	const catalogStamp = ref(0)

	async function refreshCatalogForLocale() {
		if (import.meta.client) {
			await refreshNuxtData()
		}
		if (user.value) {
			await document.refreshLibraryCatalog()
		}
		catalogStamp.value += 1
	}

	function syncFromDocument() {
		const stored = normalizeAppLocale(document.locale.value)
		if (stored !== normalizeAppLocale(locale.value)) {
			void setLocale(stored).then(() => refreshCatalogForLocale())
		}
	}

	watch(
		() => user.value?.uid,
		(uid) => {
			if (!uid) return
			syncFromDocument()
		},
		{ immediate: true },
	)

	watch(
		() => document.locale.value,
		() => {
			if (!user.value) return
			syncFromDocument()
		},
	)

	async function changeLocale(next: AppLocale) {
		const normalized = normalizeAppLocale(next)
		if (normalizeAppLocale(locale.value) !== normalized) {
			await setLocale(normalized)
		}
		if (user.value) {
			await document.setLocale(normalized)
		}
		await refreshCatalogForLocale()
	}

	return { changeLocale, catalogStamp }
}