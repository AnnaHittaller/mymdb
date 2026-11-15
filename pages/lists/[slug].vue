<script setup lang="ts">
import { findListByPathSegment, listPath } from "~/domain/user-document/listHelpers";

definePageMeta({
	middleware: "auth",
});

const { t } = useI18n();
const route = useRoute();
const { lists } = useUserDocument();

const slug = computed(() => String(route.params.slug ?? ""));
const resolvedId = ref<string | null>(null);

watch(
	[slug, lists],
	() => {
		const match = findListByPathSegment(lists.value, slug.value);
		if (match) {
			resolvedId.value = match.id;
			return;
		}
		if (resolvedId.value && lists.value.some((row) => row.id === resolvedId.value)) {
			return;
		}
		resolvedId.value = null;
	},
	{ immediate: true },
);

const list = computed(() => lists.value.find((row) => row.id === resolvedId.value));

watchEffect(() => {
	const current = list.value;
	if (!current) {
		if (lists.value.length > 0 && resolvedId.value === null) {
			throw createError({ statusCode: 404, statusMessage: t("lists.listNotFound") });
		}
		return;
	}
	const canonical = listPath(current, lists.value);
	if (route.path !== canonical) {
		void navigateTo(canonical, { replace: true });
	}
});
</script>

<template>
	<ListDetailPage v-if="list" :list="list" />
</template>
