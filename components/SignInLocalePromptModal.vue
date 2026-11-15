<script setup lang="ts">
import { discoverFilterContent } from "~/constants/discoverFilterUi";
import { APP_LOCALE_OPTIONS, type AppLocale } from "~/domain/locale/appLocale";

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
	suggested: AppLocale;
	loading?: boolean;
}>();

const emit = defineEmits<{
	confirm: [locale: AppLocale];
	keepEnglish: [];
}>();

const filterMenuControl = { highlightOnHover: true };
const choice = ref<AppLocale>(props.suggested);

watch(
	() => props.suggested,
	(value) => {
		choice.value = value;
	},
);

function onConfirm() {
	emit("confirm", choice.value);
}

function onKeepEnglish() {
	emit("keepEnglish");
}
</script>

<template>
	<UModal v-model:open="open" :title="$t('auth.localePromptTitle')" :dismissible="false" :ui="{ content: 'max-w-md' }">
		<template #body>
			<div class="space-y-4 p-2">
				<p class="text-sm text-fg-muted">{{ $t("auth.localePromptBody") }}</p>
				<UFormField :label="$t('profile.language')" name="signInLocale">
					<USelectMenu
						v-model="choice"
						:items="APP_LOCALE_OPTIONS"
						value-key="value"
						class="w-full min-w-0"
						:content="discoverFilterContent"
						v-bind="filterMenuControl" />
				</UFormField>
				<p class="text-sm text-fg-muted">{{ $t("auth.localePromptHint") }}</p>
				<div class="flex flex-col gap-2 pt-2">
					<UButton block :loading="loading" @click="onConfirm">
						{{ $t("auth.localePromptUse") }}
					</UButton>
					<UButton variant="outline" color="neutral" block :disabled="loading" @click="onKeepEnglish">
						{{ $t("auth.localePromptKeepEnglish") }}
					</UButton>
				</div>
			</div>
		</template>
	</UModal>
</template>