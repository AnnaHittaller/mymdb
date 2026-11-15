<script setup lang="ts">
import { discoverFilterContent } from "~/constants/discoverFilterUi"
import { APP_LOCALE_OPTIONS, normalizeAppLocale, type AppLocale } from "~/domain/locale/appLocale"
import { useCurrentUser } from "vuefire"

const filterMenuControl = { highlightOnHover: true }

const user = useCurrentUser()
const userDocument = useUserDocument()
const { locale: storedLocale } = userDocument
const { locale: i18nLocale } = useI18n()
const { changeLocale } = useLocaleProfileSync(userDocument)

const languageItems = APP_LOCALE_OPTIONS

const selectedLanguage = computed({
	get: () => normalizeAppLocale(user.value ? storedLocale.value : i18nLocale.value),
	set: (value: AppLocale) => {
		void changeLocale(value)
	},
})
</script>

<template>
	<div class="space-y-2">
		<UFormField :label="$t('profile.language')" name="appLanguage">
			<USelectMenu
				v-model="selectedLanguage"
				:items="languageItems"
				value-key="value"
				class="w-full min-w-0 max-w-md"
				:content="discoverFilterContent"
				v-bind="filterMenuControl" />
		</UFormField>
		<p class="text-sm text-fg-muted">{{ $t("profile.languageHint") }}</p>
	</div>
</template>