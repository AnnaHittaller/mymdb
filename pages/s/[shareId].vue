<script setup lang="ts">
import type { PublicPublishedListSnapshot } from "~/types/share";
import { formatReleaseDate } from "~/utils/formatReleaseDate";
import { defaultMediaType } from "~/utils/catalogKey";
import { sharedListOgImage } from "~/utils/catalogSeoMeta";

definePageMeta({
	layout: "default",
});

const route = useRoute();
const user = useCurrentUser();
const { t } = useI18n();

const shareId = computed(() => String(route.params.shareId ?? ""));

const { data, error, pending } = await useFetch<PublicPublishedListSnapshot>(
	() => `/api/share/lists/${shareId.value}`,
	{
		key: () => `shared-list-${shareId.value}`,
	},
);

if (error.value) {
	const statusCode = error.value.statusCode ?? 500;
	throw createError({
		statusCode,
		statusMessage: error.value.statusMessage ?? t("lists.sharedListNotFound"),
	});
}

const snapshot = computed(() => data.value);

const sharedOn = computed(() => {
	const createdAt = snapshot.value?.createdAt;
	if (!createdAt) return "";
	const day = createdAt.slice(0, 10);
	return formatReleaseDate(day) || createdAt.slice(0, 10);
});

const countLabel = computed(() => {
	const n = snapshot.value?.items.length ?? 0;
	return n === 1 ? t("lists.titleCountOne") : t("lists.titleCount", { count: n });
});

const loginTo = computed(() => ({
	path: "/login",
	query: { redirect: route.fullPath },
}));

const registerTo = computed(() => ({
	path: "/register",
	query: { redirect: route.fullPath },
}));

const importOpen = ref(false);

const requestUrl = useRequestURL();

function sharedListDescriptionForSeo() {
	const value = snapshot.value;
	if (!value) return t("lists.sharedListDescriptionFallback");
	const n = value.items.length;
	const countLabel = n === 1 ? t("lists.titleCountOne") : t("lists.titleCount", { count: n });
	return t("lists.sharedListMetaDescription", {
		listName: value.sourceListName,
		owner: value.ownerDisplayName,
		countLabel,
	});
}

useSeoMeta({
	title: () =>
		snapshot.value?.sourceListName
			? `${snapshot.value.sourceListName} · MyMDb`
			: t("lists.sharedListTitleFallback"),
	description: () => sharedListDescriptionForSeo(),
	ogTitle: () => snapshot.value?.sourceListName ?? t("lists.sharedListOgFallback"),
	ogDescription: () => sharedListDescriptionForSeo(),
	ogImage: () =>
		snapshot.value
			? sharedListOgImage(snapshot.value.items, requestUrl.origin)
			: undefined,
	ogUrl: () => `${requestUrl.origin}/s/${shareId.value}`,
	ogType: "website",
	twitterCard: "summary_large_image",
	twitterTitle: () => snapshot.value?.sourceListName ?? t("lists.sharedListOgFallback"),
	twitterDescription: () => sharedListDescriptionForSeo(),
	twitterImage: () =>
		snapshot.value
			? sharedListOgImage(snapshot.value.items, requestUrl.origin)
			: undefined,
});
</script>

<template>
	<div v-if="pending && !snapshot" class="min-w-0 max-w-full space-y-6">
		<USkeleton class="h-8 w-48" />
		<USkeleton class="h-5 w-72 max-w-full" />
		<div class="movie-grid">
			<USkeleton v-for="n in 6" :key="n" class="aspect-2/3 w-full rounded-[12px]" />
		</div>
	</div>
	<div v-else-if="snapshot" class="min-w-0 max-w-full">
		<StackBackButton />
		<div class="mb-6 space-y-2">
			<Heading>{{ snapshot.sourceListName }}</Heading>
			<p class="text-base text-fg-muted">
				{{ $t('lists.sharedBy', { name: snapshot.ownerDisplayName }) }}
				<template v-if="sharedOn">{{ $t('lists.sharedOnDate', { date: sharedOn }) }}</template>
				· {{ countLabel }}
			</p>
		</div>

		<div
			v-if="user && snapshot.items.length > 0"
			class="mb-8 flex flex-wrap items-center gap-3 rounded-[8px] border border-border-default bg-surface-inset p-4">
			<p class="min-w-0 flex-1 text-base text-fg-default">
				{{ $t('lists.importSignedInHint') }}
			</p>
			<UButton size="lg" :label="$t('lists.saveToMyLists')" @click="importOpen = true" />
		</div>
		<div
			v-else-if="!user"
			class="mb-8 flex flex-wrap items-center gap-3 rounded-[8px] border border-border-default bg-surface-inset p-4">
			<p class="min-w-0 flex-1 text-base text-fg-default">
				{{ $t('lists.importGuestHint') }}
			</p>
			<UButton size="lg" :label="$t('auth.register')" :to="registerTo" />
			<UButton variant="outline" size="lg" :label="$t('auth.signIn')" :to="loginTo" />
		</div>

		<SharedListImportPicker v-if="user" v-model:open="importOpen" :snapshot="snapshot" />

		<p v-if="snapshot.items.length === 0" class="text-xl md:text-2xl">
			{{ $t('lists.listEmpty') }}
		</p>
		<div v-else class="movie-grid">
			<MovieCard
				v-for="item in snapshot.items"
				:key="`${item.mediaType}-${item.id}`"
				:movie="{
					...item,
					rating: item.rating ?? undefined,
					poster: item.poster ?? undefined,
				}"
				:media-type="defaultMediaType(item.mediaType)"
				show-media-type />
		</div>
	</div>
</template>