<script setup lang="ts">
import type { NuxtError } from "#app";
import { pickRandomErrorScreenContent } from "~/constants/errorScreenContent";

const props = defineProps<{
	error: NuxtError;
}>();

const { t } = useI18n();

const errorStatus = computed(
	() => props.error.status ?? props.error.statusCode ?? 500,
);

const screen = useState(
	`error-screen:${props.error.status ?? props.error.statusCode ?? 500}:${props.error.message ?? ""}`,
	() => pickRandomErrorScreenContent(errorStatus.value, (key) => t(key)),
);

const handleError = () => clearError({ redirect: "/" });
</script>

<template>
	<UApp v-if="error">
		<ErrorPageTheme />
		<div
			class="flex min-h-[100dvh] flex-col items-center justify-center bg-surface-page px-6 text-center text-fg-default"
		>
			<ErrorMemeIcons :names="screen.icons" />
			<p
				class="mt-6 text-8xl font-semibold tracking-tight tabular-nums text-fg-muted"
			>
				{{ errorStatus }}
			</p>
			<h1 class="mt-5 max-w-2xl text-4xl font-semibold text-balance sm:text-[2.5rem]">
				{{ screen.title }}
			</h1>
			<p class="mt-5 max-w-xl text-xl text-pretty text-fg-muted sm:text-2xl">
				{{ screen.description }}
			</p>
			<UButton
				class="mt-12"
				:label="$t('errors.backHome')"
				size="xl"
				@click="handleError"
			/>
		</div>
	</UApp>
</template>
