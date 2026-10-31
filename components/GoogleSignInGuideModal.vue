<template>
	<UModal v-model:open="open" :ui="{ content: 'max-w-md' }">
		<template #body>
			<div class="space-y-4 p-2">
				<h3 class="text-lg font-semibold">Sign in with Google</h3>
				<ul class="list-disc space-y-2 pl-5 text-sm text-zinc-400">
					<li>
						<strong class="text-zinc-200">Already linked</strong> Google to this account? Choose
						<strong class="text-zinc-200">Continue with Google</strong> — you do not need to fill the form.
					</li>
					<li>
						<strong class="text-zinc-200">First time</strong> connecting an existing email &amp; password
						account? Enter both above, then click Sign in with Google again. That is
						<strong class="text-zinc-200">only needed once</strong>; afterward you can use Google or
						password without refilling the form.
					</li>
					<li>
						Registered with <strong class="text-zinc-200">Google only</strong> (no password here)? Continue
						with Google below.
					</li>
				</ul>
				<p v-if="variant === 'missing-password'" class="text-sm text-amber-500/90">
					You entered an email but no password. If you are linking for the first time, add your password
					above, then use Sign in with Google again.
				</p>
				<div class="flex flex-col gap-2 pt-2">
					<UButton block :loading="loading" @click="continueGoogleOnly">
						Continue with Google
					</UButton>
					<UButton variant="outline" color="neutral" block @click="useFormFirst">
						Use email &amp; password above
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
