import { expect, test } from "@nuxt/test-utils/playwright";

const movieId = "550";

function registerForm(page: import("@playwright/test").Page) {
	return page.locator("form").last();
}

function loginForm(page: import("@playwright/test").Page) {
	return page.locator("form").last();
}

test.describe("critical path (email/password, no Google popup)", () => {
	test.beforeEach(({}, testInfo) => {
		testInfo.skip(
			!process.env.NUXT_API_BEARER_TOKEN,
			"Set TMDB vars in .env (NUXT_API_BEARER_TOKEN, etc.) for movie pages.",
		);
	});

	test("register, sign in again, add to watchlist", async ({ page, goto }) => {
		const email = `e2e-${Date.now()}@example.com`;
		const password = "password12";
		const username = `e2e-${Date.now()}`;

		await goto("/register", { waitUntil: "hydration" });
		const reg = registerForm(page);
		await reg.locator('input[name="email"]').fill(email);
		await reg.locator('input[name="username"]').fill(username);
		await reg.locator('input[name="password"]').fill(password);
		await reg.getByRole("button", { name: "Create an account" }).click();
		await expect(page).toHaveURL("/", { timeout: 30_000 });
		await expect(page.getByRole("heading", { name: /My movies/i })).toBeVisible({
			timeout: 30_000,
		});

		// Client navigation keeps Firebase auth in memory; goto('/profile') SSR-middleware sends you to login without session cookies.
		await page.locator('a[href="/profile"]').last().click();
		await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible({ timeout: 30_000 });
		await page.getByRole("button", { name: "Sign out" }).click();
		await expect(page).toHaveURL(/\/login(\?|$)/);

		const login = loginForm(page);
		await login.locator('input[name="email"]').fill(email);
		await login.locator('input[name="password"]').fill(password);
		await login.getByRole("button", { name: "Sign in", exact: true }).click();
		await expect(page).toHaveURL("/", { timeout: 30_000 });

		await goto(`/movie/${movieId}`, { waitUntil: "hydration" });
		await expect(page.getByRole("button", { name: "Add to my movies" }).last()).toBeVisible({
			timeout: 30_000,
		});
		await page.getByRole("button", { name: "Add to my movies" }).last().click();
		await expect(page.getByRole("button", { name: "Remove from watchlist" }).last()).toBeVisible({
			timeout: 15_000,
		});
	});
});
