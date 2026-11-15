import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Brownfield baseline: ESLint is present and runnable; tighten rules incrementally.
    'vue/multi-word-component-names': 'off',
    'vue/valid-template-root': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/no-parsing-error': 'off',
    'vue/require-v-for-key': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'import/no-duplicates': 'warn',
    'preserve-caught-error': 'off',
    'prefer-const': 'warn',
    'no-empty-pattern': 'warn',
  },
})
