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

const { $pwa } = useNuxtApp();
const showPwaInstall = computed(() => Boolean($pwa?.showInstallPrompt));

async function installPwa() {
	await $pwa?.install();
}

function dismissPwaInstall() {
	$pwa?.cancelInstall();
}

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
		<Heading>{{ $t('profile.title') }}</Heading>

		<div class="flex flex-col gap-4">
			<div
				class="grid grid-cols-1 gap-4 min-[36rem]:grid-cols-2">
				<ProfileSectionCard :title="$t('profile.myProfile')" class="min-w-0">
					<div
						class="flex min-w-0 flex-col items-center gap-4 text-center max-sm:items-center max-sm:text-center sm:flex-row sm:items-center sm:text-left">
						<UAvatar
							:alt="user?.displayName ?? $t('profile.title')"
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
								:label="$t('profile.editUsername')"
								icon="i-heroicons-pencil-square"
								variant="outline"
								size="lg"
								class="mx-auto w-fit max-sm:mx-auto sm:mx-0"
								@click="editUsernameOpen = true" />
						</div>
					</div>
				</ProfileSectionCard>

				<ProfileSectionCard :title="$t('profile.accountSecurity')" class="min-w-0">
					<UButton
						v-if="hasPasswordProvider"
						:label="$t('profile.changePassword')"
						icon="i-heroicons-key"
						variant="outline"
						size="lg"
						@click="changePasswordOpen = true" />
					<p v-else class="text-lg text-fg-muted">
						{{ $t('profile.googlePasswordHint') }}
					</p>
				</ProfileSectionCard>
			</div>

			<ProfileSectionCard v-if="showPwaInstall" :title="$t('profile.installApp')" class="min-w-0">
				<p class="mb-4 text-lg text-fg-muted">
					{{ $t('profile.installHint') }}
				</p>
				<div class="flex flex-wrap gap-3">
					<UButton
						:label="$t('profile.install')"
						icon="i-heroicons-arrow-down-tray"
						size="lg"
						@click="installPwa" />
					<UButton
						:label="$t('profile.notNow')"
						variant="outline"
						color="neutral"
						size="lg"
						@click="dismissPwaInstall" />
				</div>
			</ProfileSectionCard>

			<ProfileSectionCard :title="$t('profile.languagePreferences')" class="min-w-0">
				<ProfileLanguagePrefs />
			</ProfileSectionCard>

			<ProfileSectionCard :title="$t('profile.recommendations')" class="min-w-0">
				<ProfileCatalogPrefs />
			</ProfileSectionCard>

			<ProfileSectionCard :title="$t('profile.theme')" class="min-w-0">
				<ColorSelector />
			</ProfileSectionCard>

			<ProfileSectionCard :title="$t('profile.accountManagement')" class="min-w-0">
				<p class="mb-4 text-lg text-fg-muted">
					{{ $t('profile.dangerZone') }}
				</p>
				<div class="flex flex-wrap gap-3">
					<UButton
						icon="i-heroicons-arrow-left-on-rectangle"
						:label="$t('profile.signOut')"
						variant="outline"
						color="neutral"
						size="lg"
						@click="logout" />
					<UButton
						icon="i-heroicons-exclamation-triangle"
						variant="outline"
						color="error"
						size="lg"
						:label="$t('profile.deleteProfile')"
						@click="openDelete" />
				</div>
			</ProfileSectionCard>
		</div>

		<p class="pb-4 text-center text-base text-fg-muted">
			<NuxtLink to="/legal" class="text-primary hover:underline">{{ $t('profile.legalLink') }}</NuxtLink>
		</p>

		<ProfileEditUsernameModal v-model:open="editUsernameOpen" />
		<ProfileChangePasswordModal v-model:open="changePasswordOpen" />

		<UModal
			v-model:open="isOpen"
			:title="$t('profile.deleteModalTitle')"
			scrollable
			:dismissible="!deleting"
			:close="!deleting"
			:description="$t('profile.deleteModalDescription')"
			:ui="{ title: 'text-error', footer: 'justify-end flex-wrap' }">
			<template v-if="needsPassword || errorMessage" #body>
				<div class="space-y-4">
					<UFormField v-if="needsPassword" :label="$t('profile.deletePassword')" name="deletePassword" required>
						<UInput
							v-model="password"
							type="password"
							:placeholder="$t('profile.deletePasswordPlaceholder')"
							size="lg"
							:disabled="deleting"
							@keyup.enter="deleteCurrentUser" />
					</UFormField>
					<p v-if="errorMessage" class="text-sm text-error">{{ errorMessage }}</p>
				</div>
			</template>
			<template #footer="{ close }">
				<UButton :label="$t('common.cancel')" color="neutral" variant="outline" :disabled="deleting" @click="close" />
				<UButton
					:label="$t('profile.yesDelete')"
					color="error"
					:loading="deleting"
					@click="deleteCurrentUser" />
			</template>
		</UModal>
	</div>
</template>