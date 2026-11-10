import {
	discoverFilterVariants,
	discoverInputMenuTriggerSlots,
	discoverMenuSlots,
	discoverSelectTriggerSlots,
} from "./constants/discoverFilterUi";

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
			variants: {
				color: {
					custom: "",
				},
				variant: {
					iconbutton: "",
				},
				size: {
					icon: {
						base: "size-8 justify-center p-0 gap-0",
						leadingIcon: "size-6",
						trailingIcon: "size-6",
					},
				},
			},
			compoundVariants: [
				{
					color: "custom",
					variant: "iconbutton",
					class:
						"rounded-full border border-border-default bg-surface-overlay/80 font-medium text-fg-subtle shadow-none ring-0 hover:border-primary hover:bg-surface-overlay hover:text-primary focus-visible:outline-3 focus-visible:outline-primary/25",
				},
				{
					size: "icon",
					square: true,
					class: "p-0",
				},
			],
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
		/* Discover filters only — full theme here (portals need global menu slots). */
		select: {
			slots: {
				...discoverSelectTriggerSlots,
				...discoverMenuSlots,
			},
			defaultVariants: discoverFilterVariants,
		},
		selectMenu: {
			slots: {
				...discoverSelectTriggerSlots,
				...discoverMenuSlots,
			},
			defaultVariants: discoverFilterVariants,
		},
		inputMenu: {
			slots: {
				...discoverInputMenuTriggerSlots,
				...discoverMenuSlots,
			},
			defaultVariants: discoverFilterVariants,
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
	},
});
