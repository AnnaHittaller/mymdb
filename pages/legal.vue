<script setup lang="ts">
import { legalContactEmail, legalOperatorName } from "~/constants/legal"

const { preferences, hasUserMadeChoice, isConsentExpired, updatePreferences } = useCookieConsent()

const mailto = computed(() => (legalContactEmail ? `mailto:${legalContactEmail}` : ""))

const embedChoice = computed(() => {
	if (!hasUserMadeChoice.value || isConsentExpired.value) return "unset" as const
	return preferences.value.embeddedVideo ? "allowed" as const : "off" as const
})

const embedStatus = computed(() => {
	if (embedChoice.value === "allowed") return "Trailer embeds are allowed on this browser."
	if (embedChoice.value === "off") return "Trailer embeds are off on this browser."
	if (isConsentExpired.value) return "Your earlier choice has expired. Trailers stay off until you choose again."
	return "You have not chosen yet. Trailers stay off until you allow them."
})

function allowEmbeds() {
	updatePreferences({ embeddedVideo: true })
}

function blockEmbeds() {
	updatePreferences({ embeddedVideo: false })
}

const sections = [
	{ href: "#about", label: "About" },
	{ href: "#privacy", label: "Privacy" },
	{ href: "#cookies", label: "Cookies" },
	{ href: "#terms", label: "Terms" },
	{ href: "#impressum", label: "Impressum" },
	{ href: "#attribution", label: "Attribution" },
	{ href: "#contact", label: "Contact" },
]
</script>

<template>
	<div class="legal-page mx-auto max-w-3xl space-y-10 pb-8 text-base leading-relaxed">
		<div class="space-y-4">
			<Heading>Legal</Heading>
			<p class="max-w-xl text-fg-muted">
				MyMDb is a free hobby app. This page says what the app stores, when a trailer is allowed to load, and how to reach the person who runs it.
			</p>
			<nav class="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="On this page">
				<a
					v-for="section in sections"
					:key="section.href"
					:href="section.href"
					class="text-primary hover:underline">
					{{ section.label }}
				</a>
			</nav>
		</div>

		<section id="about" class="scroll-mt-8 space-y-3">
			<h2 class="text-2xl font-semibold">About MyMDb</h2>
			<p>
				MyMDb is a personal watchlist: save films and shows, mark favorites, and open a trailer when you want one.
				It is a hobby project. It can change or stop, and it is not endorsed by TMDB or any studio.
			</p>
		</section>

		<section id="privacy" class="scroll-mt-8 space-y-3">
			<h2 class="text-2xl font-semibold">Privacy</h2>
			<p>
				The person responsible for MyMDb is {{ legalOperatorName }}.
				<template v-if="legalContactEmail">
					Write to
					<a :href="mailto" class="text-primary hover:underline">{{ legalContactEmail }}</a>.
				</template>
			</p>
			<p>If you create an account, the app stores:</p>
			<ul class="list-disc space-y-1 pl-5 text-fg-muted">
				<li>Your email address and display name, so you can sign in and see your lists.</li>
				<li>The lists and favorites you save.</li>
				<li>A sign-in session cookie (<code>__session</code>), so a refresh keeps you signed in.</li>
			</ul>
			<p>
				Passwords are handled by Firebase Authentication and are not stored in MyMDb’s own database.
				The app does not run advertising or a separate analytics product.
			</p>
			<p>
				Browsing loads poster images from TMDB (<code>image.tmdb.org</code>). That request includes your IP address because the image is shown in your browser.
				Opening a trailer is separate: the YouTube or Vimeo player loads only after you allow embedded video. Until then, no trailer iframe is requested.
			</p>
			<p>
				The app host may keep short-lived server logs, which can include an IP address, to operate and protect the site.
				Account data stays until you delete the profile. The embedded-video choice is kept for 180 days, then you are asked again.
			</p>
			<p>
				Firebase (Google) stores accounts and lists and may process that data in the United States.
				TMDB supplies catalog data and images. YouTube or Vimeo receive a connection only after you allow a trailer.
			</p>
			<p>
				You can ask for a copy of your account data, a correction, or deletion.
				Signed-in users can delete the account and saved titles from
				<NuxtLink to="/profile" class="text-primary hover:underline">Profile</NuxtLink>.
				You can also complain to your EU data-protection authority.
			</p>
			<p>MyMDb is not directed at anyone under 16.</p>
		</section>

		<section id="cookies" class="scroll-mt-8 space-y-4">
			<h2 class="text-2xl font-semibold">Cookies and embedded video</h2>
			<div class="overflow-x-auto">
				<table class="w-full min-w-[36rem] border-collapse text-left text-sm">
					<thead>
						<tr class="border-b border-border-default text-fg-muted">
							<th class="py-2 pr-4 font-medium">Name</th>
							<th class="py-2 pr-4 font-medium">Why it exists</th>
							<th class="py-2 font-medium">How long</th>
						</tr>
					</thead>
					<tbody class="text-fg-default">
						<tr class="border-b border-border-default align-top">
							<td class="py-3 pr-4"><code>__session</code></td>
							<td class="py-3 pr-4">Keeps you signed in. Needed for accounts. Not used for ads.</td>
							<td class="py-3">Session</td>
						</tr>
						<tr class="border-b border-border-default align-top">
							<td class="py-3 pr-4"><code>mymdb_consent</code></td>
							<td class="py-3 pr-4">Remembers whether trailer embeds are allowed.</td>
							<td class="py-3">180 days</td>
						</tr>
						<tr class="border-b border-border-default align-top">
							<td class="py-3 pr-4"><code>cookie_consent_timestamp</code></td>
							<td class="py-3 pr-4">When you last saved that choice.</td>
							<td class="py-3">180 days</td>
						</tr>
						<tr class="align-top">
							<td class="py-3 pr-4"><code>cookie_consent_version</code></td>
							<td class="py-3 pr-4">Which version of this choice you saved.</td>
							<td class="py-3">180 days</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p>{{ embedStatus }}</p>
			<p class="text-fg-muted">
				Allow and block use the same control. You can change the choice here at any time, including after you accepted in a trailer window.
			</p>
			<div class="flex flex-wrap gap-3">
				<UButton type="button" @click="allowEmbeds">Allow trailers</UButton>
				<UButton type="button" color="neutral" variant="outline" @click="blockEmbeds">Keep trailers off</UButton>
			</div>
			<p>
				A trailer plays through
				<a href="https://policies.google.com/privacy" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">YouTube</a>
				or
				<a href="https://vimeo.com/privacy" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Vimeo</a>.
				<code>youtube-nocookie.com</code> and Vimeo’s do-not-track flag reduce tracking. They do not stop the player from connecting once you allow it.
			</p>
		</section>

		<section id="terms" class="scroll-mt-8 space-y-3">
			<h2 class="text-2xl font-semibold">Terms of use</h2>
			<p>
				MyMDb is free and provided as-is, without a warranty. It may change, break, or be shut down.
				You are responsible for the security of your account.
			</p>
			<p>
				Do not abuse the service, scrape it, or misuse the TMDB data shown here.
				Catalog text and images are for display inside MyMDb, not for copying into another product.
				Accounts that abuse the app can be suspended.
			</p>
		</section>

		<section id="impressum" class="scroll-mt-8 space-y-3">
			<h2 class="text-2xl font-semibold">Impressum</h2>
			<p>
				{{ legalOperatorName }} is responsible for the content of this hobby site.
				<template v-if="legalContactEmail">
					Contact:
					<a :href="mailto" class="text-primary hover:underline">{{ legalContactEmail }}</a>.
				</template>
				<template v-else>
					A dedicated contact address for this app is not published yet.
				</template>
			</p>
			<p class="text-fg-muted">
				This is a non-commercial personal project. No street address is published here.
			</p>
		</section>

		<section id="attribution" class="scroll-mt-8 space-y-3">
			<h2 class="text-2xl font-semibold">Attribution</h2>
			<p>
				This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.
				Catalog data and posters come from
				<a href="https://www.themoviedb.org/" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">The Movie Database</a>.
			</p>
			<a
				href="https://www.themoviedb.org/"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-block">
				<img src="/tmdb-logo.svg" alt="TMDB" class="h-5 w-auto" />
			</a>
			<p>
				Accounts and saved lists use Firebase.
				When you allow a trailer, playback is provided by YouTube or Vimeo.
			</p>
		</section>

		<section id="contact" class="scroll-mt-8 space-y-3">
			<h2 class="text-2xl font-semibold">Contact</h2>
			<p v-if="legalContactEmail">
				Email
				<a :href="mailto" class="text-primary hover:underline">{{ legalContactEmail }}</a>.
				That address is only for MyMDb. There is no contact form.
			</p>
			<p v-else class="text-fg-muted">
				Contact is by email only. The project mailbox is not published yet.
			</p>
		</section>
	</div>
</template>
