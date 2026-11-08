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
