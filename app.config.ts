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
		select: {
			slots: {
				base: "discover-filter-control",
				content: "bg-surface-nav-active border border-border-default",
				trigger: "bg-surface-page",
			},
			defaultVariants: {
				color: "neutral",
				variant: "outline",
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
		inputMenu: {
			slots: {
				root: "w-full",
				base: "discover-filter-control w-full min-h-9 px-2.5 py-1.5 placeholder:text-fg-default !ring-1 ring-inset !ring-border-default focus-visible:!ring-border-default",
				content: "bg-surface-nav-active border border-border-default",
				trailing: "pe-2",
			},
			defaultVariants: {
				color: "neutral",
				variant: "outline",
			},
		},
		selectMenu: {
			slots: {
				base: "discover-filter-control",
				content: "bg-surface-nav-active border border-border-default",
				placeholder: "text-fg-default",
			},
			defaultVariants: {
				color: "neutral",
				variant: "outline",
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
