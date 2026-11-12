/**
 * Discover page filters (`USelect`, `USelectMenu`, `UInputMenu` — only used on Discover).
 * Wired in `app.config.ts` (triggers + portal menus). Do not use `UTheme` for these: menus teleport outside the page tree.
 */

export const discoverFilterTrigger =
	"group discover-filter-control rounded-[8px] text-base min-h-11";

export const discoverMenuSlots = {
	content:
		"max-h-60 bg-surface-popover border border-border-default rounded-lg ring-0 shadow-lg overflow-hidden",
	viewport: "scrollbar-menu scroll-py-1",
	item: "text-base text-fg-default data-highlighted:not-data-disabled:text-fg-default data-highlighted:not-data-disabled:before:!bg-surface-hover",
};

export const discoverSelectTriggerSlots = {
	base: discoverFilterTrigger,
	placeholder: "text-fg-default",
};

export const discoverInputMenuTriggerSlots = {
	root: discoverFilterTrigger,
	base: "discover-filter-input",
};

export const discoverFilterVariants = {
	color: "neutral" as const,
	variant: "none" as const,
};

/**
 * Popper content for filter menus.
 * - `position: 'popper'` — avoids `item-aligned` fighting page scroll when `bodyLock` is off.
 * - `bodyLock: true` — block background scroll while open (normal for selects); pair with `UApp` `scroll-body="false"` so Reka does not add extra `padding-right` on top of `scrollbar-gutter: stable`.
 */
export const discoverFilterContent = {
	bodyLock: true,
	position: "popper",
} as const;

/** InputMenu `base` is the `<input>`; page `:ui` overrides theme `placeholder:text-dimmed`. */
export const castActorInputUi = {
	base: "discover-filter-input text-base text-fg-default placeholder:text-fg-default",
};
