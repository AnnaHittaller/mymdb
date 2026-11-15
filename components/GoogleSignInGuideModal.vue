<template>
	<UModal v-model:open="open" :title="$t('auth.googleGuideTitle')" :ui="{ content: 'max-w-md' }">
		<template #body>
			<div class="space-y-4 p-2">
				<ul class="list-disc space-y-2 pl-5 text-sm text-fg-muted">
					<li>{{ $t('auth.googleGuideLinked') }}</li>
					<li>{{ $t('auth.googleGuideFirstLink') }}</li>
					<li>{{ $t('auth.googleGuideGoogleOnly') }}</li>
				</ul>
				<p v-if="variant === 'missing-password'" class="text-sm text-amber-500/90">
					{{ $t('auth.googleGuideMissingPassword') }}
				</p>
				<div class="flex flex-col gap-2 pt-2">
					<UButton block :loading="loading" @click="continueGoogleOnly">
						{{ $t('auth.continueWithGoogle') }}
					</UButton>
					<UButton variant="outline" color="neutral" block @click="useFormFirst">
						{{ $t('auth.useEmailPasswordAbove') }}
					</UButton>
				</div>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>("open", { default: false });

defineProps<{
	variant: "missing-both" | "missing-password";
	loading: boolean;
}>();

const emit = defineEmits<{
	useFormFirst: [];
	continueGoogleOnly: [];
}>();

function useFormFirst() {
	emit("useFormFirst");
	open.value = false;
}

function continueGoogleOnly() {
	emit("continueGoogleOnly");
}
</script>