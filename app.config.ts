export default defineAppConfig({
	ui: {
		colors: {
			primary: "emerald",
			neutral: "zinc",
		},
		button: {
			slots: {
				base: "font-extrabold cursor-pointer",
			},
		},
		input: {
			slots: {
				root: "w-full",
			},
		},
		textarea: {
			slots: {
				root: "w-full",
			},
		},
		avatar: {
			slots: {
				root: "bg-surface-inset",
				fallback: "text-primary",
			},
		},
		separator: {
			slots: {
				border: "border-border-default",
			},
		},
		selectMenu: {
			slots: {
				content: "bg-surface-elevated",
			},
			option: {
				active: "bg-surface-nav-active",
				selectedIcon: {
					base: "text-primary flex-shrink-0 cursor-pointer",
				},
			},
		},
	},
});
