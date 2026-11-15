<script setup lang="ts">
import { useCurrentUser } from "vuefire";

const route = useRoute();
const user = useCurrentUser();
const { isOffline } = useOfflineReady();

const { t } = useI18n();

const message = computed(() => {
	if (route.path.startsWith("/lists")) {
		return t("offline.lists");
	}
	if (route.path === "/login" || route.path === "/register") {
		return t("offline.signIn");
	}
	if (/^\/(movie|show)\//.test(route.path)) {
		return t("offline.detail");
	}
	if (user.value) {
		return t("offline.signedIn");
	}
	return t("offline.guest");
});

const showBanner = computed(() => isOffline.value);
</script>

<template>
	<div v-if="showBanner" class="mb-4 min-w-0 max-w-full" role="status">
		<UAlert
			color="neutral"
			variant="subtle"
			icon="i-heroicons-signal-slash"
			:title="message"
			:ui="{ title: 'text-base font-medium' }" />
	</div>
</template>