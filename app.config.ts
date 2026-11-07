export default defineAppConfig({
	ui: {
		colors: {
			primary: "emerald",
			neutral: "zinc",
		},
		button: {
			slots: {
				base: "rounded-lg font-extrabold cursor-pointer",
			},
		},
		input: {
			slots: {
				root: "w-full",
				base: "rounded-lg",
			},
		},
		textarea: {
			slots: {
				root: "w-full",
				base: "rounded-lg",
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
		modal: {
			slots: {
				overlay: "z-[1100]",
				content: "z-[1100]",
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
