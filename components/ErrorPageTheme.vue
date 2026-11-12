<script setup lang="ts">
import { doc } from "firebase/firestore";
import { useCurrentUser, useDocument, useFirestore } from "vuefire";
import { resolveThemeAccent } from "~/constants/themeAccentColors";

const DEFAULT_THEME = "emerald";

const user = useCurrentUser();
const db = useFirestore();
const config = useAppConfig();
const userRef = computed(() =>
	user.value?.uid ? doc(db, "users", user.value.uid) : null,
);
const userDoc = useDocument(userRef);

watchEffect(() => {
	if (!user.value) {
		config.ui.colors.primary = DEFAULT_THEME;
		return;
	}
	const theme =
		userDoc.value &&
		typeof userDoc.value === "object" &&
		"theme" in userDoc.value &&
		typeof userDoc.value.theme === "string"
			? userDoc.value.theme
			: "";
	config.ui.colors.primary = resolveThemeAccent(theme, DEFAULT_THEME);
});
</script>

<template />
