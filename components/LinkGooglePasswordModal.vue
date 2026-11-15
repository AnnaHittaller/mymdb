<template>
	<UModal v-model:open="open" :ui="{ content: 'max-w-md' }">
		<template #body>
			<div class="space-y-4 p-2">
				<h3 class="text-lg font-semibold">{{ $t('auth.linkGoogleTitle') }}</h3>
				<p class="text-sm text-fg-muted">
					{{ $t('auth.linkGoogleBody', { email }) }}
				</p>
				<UFormField :label="$t('auth.password')" name="linkPassword" required>
					<UInput
						v-model="password"
						type="password"
						:placeholder="$t('profile.deletePasswordPlaceholder')"
						size="lg"
						:disabled="loading"
						@keyup.enter="confirm"
					/>
				</UFormField>
				<p v-if="localError" class="text-sm text-red-500">{{ localError }}</p>
				<div class="flex justify-end gap-2 pt-2">
					<UButton variant="ghost" :disabled="loading" @click="cancel">{{ $t('common.cancel') }}</UButton>
					<UButton :loading="loading" @click="confirm">{{ $t('auth.linkGoogleConfirm') }}</UButton>
				</div>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
	email: string;
	loading: boolean;
}>();

const emit = defineEmits<{
	confirm: [password: string];
	cancel: [];
}>();

const { t } = useI18n();
const password = ref("");
const localError = ref<string | undefined>();

watch(open, (isOpen) => {
	if (!isOpen) {
		password.value = "";
		localError.value = undefined;
	}
});

function confirm() {
	if (!password.value) {
		localError.value = t("auth.linkGoogleEnterPassword");
		return;
	}
	localError.value = undefined;
	emit("confirm", password.value);
}

function cancel() {
	emit("cancel");
	open.value = false;
}
</script>