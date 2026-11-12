<script setup lang="ts">
import { signOut } from "firebase/auth";
import { googleAuthProvider } from "~/composables/googleAuthProvider";
import { accountNeedsPassword, deleteAccount, deleteFailureMessage } from "~/composables/deleteAccount";

definePageMeta({
	middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const auth = useFirebaseAuth();
const db = useFirestore();
const user = useCurrentUser();

const editUsernameOpen = ref(false);
const changePasswordOpen = ref(false);
const isOpen = ref(false);
const deleting = ref(false);
const password = ref("");
const errorMessage = ref<string | undefined>();

const hasPasswordProvider = computed(() => (user.value ? accountNeedsPassword(user.value) : false));
const needsPassword = hasPasswordProvider;

watch(
	() => route.query.edit,
	(edit) => {
		if (edit === "username") {
			editUsernameOpen.value = true;
			router.replace({ path: "/profile", query: {} });
		}
	},
	{ immediate: true },
);

function openDelete() {
	password.value = "";
	errorMessage.value = undefined;
	isOpen.value = true;
}

watch(isOpen, (open) => {
	if (!open) {
		password.value = "";
		errorMessage.value = undefined;
	}
});

const logout = async () => {
	if (!auth) return;
	await signOut(auth);
	await navigateTo("/login", { replace: true });
};

const deleteCurrentUser = async () => {
	const current = user.value;
	if (!current || !auth || deleting.value) return;
	deleting.value = true;
	errorMessage.value = undefined;
	try {
		await deleteAccount(db, current, {
			password: password.value,
			googleProvider: googleAuthProvider,
		});
		isOpen.value = false;
		await navigateTo("/login", { replace: true });
	} catch (error: unknown) {
		console.error(error);
		errorMessage.value = deleteFailureMessage(error);
	} finally {
		deleting.value = false;
	}
};
</script>

<template>
	<div class="min-w-0 max-w-full w-full space-y-4">
		<Heading>Profile</Heading>

		<div class="flex flex-col gap-4">
			<div
				class="grid grid-cols-1 gap-4 min-[36rem]:grid-cols-2">
				<ProfileSectionCard title="My profile" class="min-w-0">
					<div
						class="flex min-w-0 flex-col items-center gap-4 text-center max-sm:items-center max-sm:text-center sm:flex-row sm:items-center sm:text-left">
						<UAvatar
							:alt="user?.displayName ?? 'Profile'"
							class="shrink-0 border border-border-default"
							:ui="{
								root: 'size-14 sm:size-16',
								fallback: 'text-lg font-semibold leading-none sm:text-xl',
							}" />
						<div class="flex min-w-0 w-full max-w-full flex-col gap-3 sm:flex-1 sm:items-stretch">
							<div class="min-w-0 space-y-1">
								<p class="max-w-full text-3xl break-words text-fg-default">{{ user?.displayName }}</p>
								<p class="max-w-full text-lg break-words text-fg-muted">{{ user?.email }}</p>
							</div>
							<UButton
								label="Edit username"
								icon="i-heroicons-pencil-square"
								variant="outline"
								size="lg"
								class="mx-auto w-fit max-sm:mx-auto sm:mx-0"
								@click="editUsernameOpen = true" />
						</div>
					</div>
				</ProfileSectionCard>

				<ProfileSectionCard title="Account security" class="min-w-0">
					<UButton
						v-if="hasPasswordProvider"
						label="Change password"
						icon="i-heroicons-key"
						variant="outline"
						size="lg"
						@click="changePasswordOpen = true" />
					<p v-else class="text-lg text-fg-muted">
						Signed in with Google — password can&apos;t be changed here.
					</p>
				</ProfileSectionCard>
			</div>

			<ProfileSectionCard title="Theme &amp; customization" class="min-w-0">
				<ColorSelector />
			</ProfileSectionCard>

			<ProfileSectionCard title="Account management" class="min-w-0">
				<p class="mb-4 text-lg text-fg-muted">
					<span class="text-error">Danger zone</span>
					— sign out or permanently delete your account and saved movies.
				</p>
				<div class="flex flex-wrap gap-3">
					<UButton
						icon="i-heroicons-arrow-left-on-rectangle"
						label="Sign out"
						variant="outline"
						color="neutral"
						size="lg"
						@click="logout" />
					<UButton
						icon="i-heroicons-exclamation-triangle"
						variant="outline"
						color="error"
						size="lg"
						label="Delete profile"
						@click="openDelete" />
				</div>
			</ProfileSectionCard>
		</div>

		<p class="pb-4 text-center text-base text-fg-muted">
			<NuxtLink to="/legal" class="text-primary hover:underline">Legal &amp; privacy</NuxtLink>
		</p>

		<ProfileEditUsernameModal v-model:open="editUsernameOpen" />
		<ProfileChangePasswordModal v-model:open="changePasswordOpen" />

		<UModal
			v-model:open="isOpen"
			title="Delete profile"
			scrollable
			:dismissible="!deleting"
			:close="!deleting"
			description="This permanently deletes your account and every movie you saved. You cannot undo it."
			:ui="{ title: 'text-error', footer: 'justify-end flex-wrap' }">
			<template v-if="needsPassword || errorMessage" #body>
				<div class="space-y-4">
					<UFormField v-if="needsPassword" label="Password" name="deletePassword" required>
						<UInput
							v-model="password"
							type="password"
							placeholder="Your account password"
							size="lg"
							:disabled="deleting"
							@keyup.enter="deleteCurrentUser" />
					</UFormField>
					<p v-if="errorMessage" class="text-sm text-error">{{ errorMessage }}</p>
				</div>
			</template>
			<template #footer="{ close }">
				<UButton label="Cancel" color="neutral" variant="outline" :disabled="deleting" @click="close" />
				<UButton
					label="Yes, delete my profile"
					color="error"
					:loading="deleting"
					@click="deleteCurrentUser" />
			</template>
		</UModal>
	</div>
</template>
