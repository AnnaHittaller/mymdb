<script setup lang="ts">
import type { NuxtError } from "#app";
import { pickRandomErrorScreenContent } from "~/constants/errorScreenContent";

const props = defineProps<{
	error: NuxtError;
}>();

const screen = useState(
	`error-screen:${props.error.statusCode ?? 500}:${props.error.message ?? ""}`,
	() => pickRandomErrorScreenContent(props.error.statusCode ?? 500),
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
				{{ error.statusCode }}
			</p>
			<h1 class="mt-5 max-w-2xl text-4xl font-semibold text-balance sm:text-[2.5rem]">
				{{ screen.title }}
			</h1>
			<p class="mt-5 max-w-xl text-xl text-pretty text-fg-muted sm:text-2xl">
				{{ screen.description }}
			</p>
			<UButton
				class="mt-12"
				label="Back to homepage"
				size="xl"
				@click="handleError"
			/>
		</div>
	</UApp>
</template>
