<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { changeAccountPassword, changePasswordFailureMessage } from "~/composables/changeAccountPassword";
import { changePasswordSchema, type ChangePasswordSchema } from "~/schemas/schemas";

const open = defineModel<boolean>("open", { default: false });

const user = useCurrentUser();

const state = reactive({
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
	error: undefined as string | undefined,
	loading: false,
	success: false,
});

useFormToasts(state, { successTitle: "Your password was updated" });

function resetFields() {
	state.currentPassword = "";
	state.newPassword = "";
	state.confirmPassword = "";
	state.error = undefined;
	state.loading = false;
	state.success = false;
}

watch(
	() => open.value,
	(isOpen) => {
		if (isOpen) resetFields();
	},
);

watch(
	() => state.success,
	(success) => {
		if (!success) return;
		window.setTimeout(() => {
			open.value = false;
		}, 800);
	},
);

async function onSubmit(event: FormSubmitEvent<ChangePasswordSchema>) {
	const current = user.value;
	if (!current || state.loading) return;
	state.loading = true;
	state.error = undefined;
	state.success = false;
	try {
		await changeAccountPassword(
			current,
			event.data.currentPassword,
			event.data.newPassword,
		);
		resetFields();
		state.success = true;
	} catch (error: unknown) {
		console.error(error);
		state.error = changePasswordFailureMessage(error);
		state.success = false;
	} finally {
		state.loading = false;
	}
}
</script>

<template>
	<UModal
		v-model:open="open"
		title="Change password"
		:dismissible="!state.loading"
		:close="!state.loading">
		<template #body>
			<UForm :schema="changePasswordSchema" :state="state" class="space-y-4" @submit="onSubmit">
				<UFormField label="Current password" name="currentPassword" required>
					<UInput
						v-model="state.currentPassword"
						type="password"
						autocomplete="current-password"
						:disabled="state.loading" />
				</UFormField>
				<UFormField label="New password" name="newPassword" required>
					<UInput
						v-model="state.newPassword"
						type="password"
						autocomplete="new-password"
						:disabled="state.loading" />
				</UFormField>
				<UFormField label="Confirm new password" name="confirmPassword" required>
					<UInput
						v-model="state.confirmPassword"
						type="password"
						autocomplete="new-password"
						:disabled="state.loading" />
				</UFormField>
				<div class="flex justify-end gap-2">
					<UButton label="Cancel" color="neutral" variant="outline" :disabled="state.loading" @click="open = false" />
					<UButton type="submit" label="Update password" :loading="state.loading" />
				</div>
			</UForm>
		</template>
	</UModal>
</template>
