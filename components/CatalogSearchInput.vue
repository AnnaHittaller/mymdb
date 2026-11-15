<script setup lang="ts">
const query = defineModel<string>({ required: true });

const props = withDefaults(
	defineProps<{
		placeholder?: string;
		ariaLabel?: string;
		name?: string;
		submitOnTrailing?: boolean;
		/** Decorative trailing icon (e.g. filter on list pages). */
		trailingIcon?: string;
		trailingIconLabel?: string;
	}>(),
	{
		placeholder: undefined,
		ariaLabel: undefined,
		name: "query",
		submitOnTrailing: false,
		trailingIcon: undefined,
		trailingIconLabel: undefined,
	},
);

const { t } = useI18n();
const resolvedPlaceholder = computed(() => props.placeholder ?? t("browse.searchPlaceholder"));
const resolvedAriaLabel = computed(() => props.ariaLabel ?? t("browse.searchAria"));

const emit = defineEmits<{
	clear: [];
}>();

function onClear() {
	query.value = "";
	emit("clear");
}
</script>

<template>
	<UInput
		v-model="query"
		type="search"
		:name="name"
		:placeholder="resolvedPlaceholder"
		:aria-label="resolvedAriaLabel"
		autocomplete="off"
		:enterkeyhint="submitOnTrailing ? 'search' : undefined"
		size="xl"
		:ui="{
			base: 'text-lg placeholder:italic [appearance:textfield]',
			trailing: 'pe-1',
		}"
		class="search-page-input w-full">
		<template #trailing>
			<div class="flex shrink-0 items-center gap-0.5">
				<UButton
					v-show="query !== ''"
					:type="submitOnTrailing ? 'button' : 'button'"
					color="neutral"
					variant="ghost"
					icon="i-heroicons-x-mark-20-solid"
					size="sm"
					square
					:aria-label="$t('browse.clearSearch')"
					@click="onClear" />
				<UButton
					v-if="submitOnTrailing"
					type="submit"
					color="primary"
					variant="ghost"
					icon="i-heroicons-magnifying-glass-20-solid"
					size="sm"
					square
					:aria-label="$t('common.search')"
					:ui="{ base: 'font-medium justify-center' }" />
				<UButton
					v-else-if="trailingIcon"
					type="button"
					color="primary"
					variant="ghost"
					:icon="trailingIcon"
					size="sm"
					square
					tabindex="-1"
					:aria-label="trailingIconLabel"
					:ui="{ base: 'font-medium justify-center pointer-events-none' }" />
			</div>
		</template>
	</UInput>
</template>

<style scoped>
.search-page-input :deep(input) {

	&::-webkit-search-cancel-button,
	&::-webkit-search-decoration {
		display: none;
	}
}
</style>