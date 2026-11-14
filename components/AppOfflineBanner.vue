<script setup lang="ts">
import { useCurrentUser } from "vuefire";

const route = useRoute();
const user = useCurrentUser();
const { isOffline } = useOfflineReady();

const message = computed(() => {
	if (route.path.startsWith("/lists")) {
		return "Offline — showing saved lists.";
	}
	if (route.path === "/login" || route.path === "/register") {
		return "Sign-in needs a connection.";
	}
	if (/^\/(movie|show)\//.test(route.path)) {
		return "Offline — connect to load catalog details.";
	}
	if (user.value) {
		return "You're offline. Open Your lists to see saved titles.";
	}
	return "You're offline. Connect to browse or search.";
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