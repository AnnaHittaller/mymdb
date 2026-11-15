<script setup lang="ts">
const { theme, setTheme } = useUserDocument();
const { colors: themeColors, themeAccentLabel } = useThemeAccentLabels();

const updateColor = async (color: string) => {
	await setTheme(color);
};
</script>

<template>
	<div class="space-y-4">
		<p class="text-base text-fg-muted">
			{{ $t('profile.currentTheme') }}
			<span class="text-fg-default">{{ themeAccentLabel(theme) }}</span>
		</p>
		<div class="flex flex-wrap gap-4">
			<div v-for="color in themeColors" :key="color.value" class="inline-block">
				<label :for="`theme-${color.value}`" class="cursor-pointer">
					<input
						:id="`theme-${color.value}`"
						type="radio"
						name="theme-accent"
						:value="color.value"
						:checked="color.value === theme"
						class="hidden"
						@change="updateColor(color.value)" />
					<UBadge
						color="neutral"
						variant="solid"
						size="lg"
						:class="[
							color.swatchClass,
							'cursor-pointer rounded-lg text-lg transition-colors duration-200',
							color.value === theme
								? 'ring-2 ring-primary ring-offset-4 ring-offset-surface-elevated'
								: '',
						]">
						{{ color.label }}
					</UBadge>
				</label>
			</div>
		</div>
	</div>
</template>
