<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { updateProfile } from "firebase/auth";
import { editUsernameSchema, type EditUsernameSchema } from "~/schemas/schemas";

const open = defineModel<boolean>("open", { default: false });

const user = useCurrentUser();
const { setUsername } = useUserDocument();

const state = reactive({
	username: user.value?.displayName ?? "",
	error: undefined as string | undefined,
	loading: false,
	success: false,
});

useFormToasts(state, { successTitle: "Your username was updated" });

watch(
	() => open.value,
	(isOpen) => {
		if (!isOpen) return;
		state.username = user.value?.displayName ?? "";
		state.error = undefined;
		state.loading = false;
		state.success = false;
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

async function onSubmit(event: FormSubmitEvent<EditUsernameSchema>) {
	state.loading = true;
	state.error = undefined;
	state.success = false;
	try {
		const current = user.value;
		if (!current) {
			throw new Error("You need to be signed in to update your username");
		}
		const displayName = event.data.username;
		await updateProfile(current, { displayName });
		await setUsername(displayName);
		state.success = true;
	} catch (error: unknown) {
		state.error = error instanceof Error ? error.message : "Could not update username";
		state.success = false;
	} finally {
		state.loading = false;
	}
}
</script>

<template>
	<UModal
		v-model:open="open"
		title="Edit username"
		:ui="{ content: 'max-w-md' }"
		:dismissible="!state.loading"
		:close="!state.loading">
		<template #body>
			<UForm :schema="editUsernameSchema" :state="state" class="space-y-4" @submit="onSubmit">
				<UFormField label="Username" name="username" required>
					<UInput
						v-model.trim="state.username"
						placeholder="Username"
						type="text"
						:disabled="state.loading" />
				</UFormField>
				<div class="flex justify-end gap-2">
					<UButton label="Cancel" color="neutral" variant="outline" :disabled="state.loading" @click="open = false" />
					<UButton type="submit" label="Save" :loading="state.loading" />
				</div>
			</UForm>
		</template>
	</UModal>
</template>
