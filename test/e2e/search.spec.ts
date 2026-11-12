import { expect, test } from "@nuxt/test-utils/playwright";

function registerForm(page: import("@playwright/test").Page) {
	return page.locator("form").last();
}

async function registerAndLandHome(
	page: import("@playwright/test").Page,
	goto: (url: string, options?: { waitUntil?: "hydration" }) => Promise<unknown>,
) {
	const email = `e2e-search-${Date.now()}@example.com`;
	const password = "password12";
	const username = `e2e-search-${Date.now()}`;

	await goto("/register", { waitUntil: "hydration" });
	const reg = registerForm(page);
	await reg.locator('input[name="email"]').fill(email);
	await reg.locator('input[name="username"]').fill(username);
	await reg.locator('input[name="password"]').fill(password);
	await reg.getByRole("button", { name: "Create an account" }).click();
	await expect(page).toHaveURL("/", { timeout: 30_000 });

	return { email, password };
}

test.describe("search page", () => {
	test.beforeEach(({}, testInfo) => {
		testInfo.skip(
			!process.env.NUXT_API_BEARER_TOKEN,
			"Set TMDB vars in .env (NUXT_API_BEARER_TOKEN, etc.) for movie search.",
		);
	});

	test("browse nav opens browse page", async ({ page, goto }) => {
		await registerAndLandHome(page, goto);

		await page.getByRole("link", { name: "Browse" }).click();
		await expect(page).toHaveURL("/browse", { timeout: 15_000 });
		await expect(page.getByRole("heading", { name: "Browse" })).toBeVisible();
	});

	test("debounced query loads results", async ({ page, goto }) => {
		await registerAndLandHome(page, goto);
		await goto("/browse", { waitUntil: "hydration" });

		const searchInput = page.getByRole("searchbox", { name: "Search movies and shows" });
		await searchInput.fill("matrix");

		await expect(page).toHaveURL(/\/browse\?q=matrix/, { timeout: 15_000 });
		await expect(page.getByRole("heading", { name: "Browse" })).toBeVisible();
		await expect(page.getByText(/Results for/)).toBeVisible();
		await expect(page.locator(".movie-grid")).toBeVisible({ timeout: 20_000 });
	});

	test("submit via Enter navigates to search", async ({ page, goto }) => {
		await registerAndLandHome(page, goto);
		await goto("/browse", { waitUntil: "hydration" });

		const searchInput = page.getByRole("searchbox", { name: "Search movies and shows" });
		await searchInput.fill("inception");
		await searchInput.press("Enter");

		await expect(page).toHaveURL(/\/browse\?q=inception/, { timeout: 15_000 });
	});

	test("two characters submit on Enter", async ({ page, goto }) => {
		await registerAndLandHome(page, goto);
		await goto("/browse", { waitUntil: "hydration" });

		const searchInput = page.getByRole("searchbox", { name: "Search movies and shows" });
		await searchInput.fill("ab");
		await searchInput.press("Enter");

		await expect(page).toHaveURL(/\/browse\?q=ab/, { timeout: 15_000 });
	});

	test("one character submit shows validation error", async ({ page, goto }) => {
		await registerAndLandHome(page, goto);
		await goto("/browse", { waitUntil: "hydration" });

		const searchInput = page.getByRole("searchbox", { name: "Search movies and shows" });
		await searchInput.fill("a");
		await searchInput.press("Enter");

		await expect(page).toHaveURL("/browse", { timeout: 5_000 });
		await expect(page.getByText("Enter at least 2 characters")).toBeVisible();
	});

	test("discover filters and search are mutually exclusive in the URL", async ({ page, goto }) => {
		await registerAndLandHome(page, goto);
		await goto("/browse?rating=8", { waitUntil: "hydration" });

		const url = new URL(page.url());
		expect(url.searchParams.get("rating")).toBe("8");
		expect(url.searchParams.get("q")).toBeNull();

		const searchInput = page.getByRole("searchbox", { name: "Search movies and shows" });
		await searchInput.fill("matrix");
		await expect(page).toHaveURL(/\/browse\?q=matrix/, { timeout: 15_000 });

		const afterSearch = new URL(page.url());
		expect(afterSearch.searchParams.get("q")).toBe("matrix");
		expect(afterSearch.searchParams.get("rating")).toBeNull();
	});

	test("switching media clears an active search", async ({ page, goto }) => {
		await registerAndLandHome(page, goto);
		await goto("/browse", { waitUntil: "hydration" });

		const searchInput = page.getByRole("searchbox", { name: "Search movies and shows" });
		await searchInput.fill("matrix");
		await expect(page).toHaveURL(/\/browse\?q=matrix/, { timeout: 15_000 });

		await page.getByRole("button", { name: "Shows" }).click();
		await expect(page).toHaveURL(/\/browse\?media=tv$/, { timeout: 15_000 });

		const afterToggle = new URL(page.url());
		expect(afterToggle.searchParams.get("q")).toBeNull();
		expect(afterToggle.searchParams.get("media")).toBe("tv");
	});

	test("search and discover urls redirect to browse", async ({ page, goto }) => {
		await registerAndLandHome(page, goto);

		await goto("/search?q=matrix", { waitUntil: "hydration" });
		await expect(page).toHaveURL(/\/browse\?q=matrix/, { timeout: 15_000 });
		await expect(page.getByRole("heading", { name: "Browse" })).toBeVisible();

		await goto("/discover", { waitUntil: "hydration" });
		await expect(page).toHaveURL("/browse", { timeout: 15_000 });
	});
});
