<script setup lang="ts">
import { legalContactEmail, legalOperatorName } from "~/constants/legal"

const { t } = useI18n()
const { preferences, hasUserMadeChoice, isConsentExpired, updatePreferences } = useCookieConsent()

const mailto = computed(() => (legalContactEmail ? `mailto:${legalContactEmail}` : ""))

const embedChoice = computed(() => {
	if (!hasUserMadeChoice.value || isConsentExpired.value) return "unset" as const
	return preferences.value.embeddedVideo ? "allowed" as const : "off" as const
})

const embedStatus = computed(() => {
	if (embedChoice.value === "allowed") return t("legal.embedAllowed")
	if (embedChoice.value === "off") return t("legal.embedOff")
	if (isConsentExpired.value) return t("legal.embedExpired")
	return t("legal.embedUnset")
})

function allowEmbeds() {
	updatePreferences({ embeddedVideo: true })
}

function blockEmbeds() {
	updatePreferences({ embeddedVideo: false })
}

const sections = computed(() => [
	{ href: "#about", label: t("legal.about") },
	{ href: "#privacy", label: t("legal.privacy") },
	{ href: "#cookies", label: t("legal.cookies") },
	{ href: "#terms", label: t("legal.terms") },
	{ href: "#impressum", label: t("legal.impressum") },
	{ href: "#attribution", label: t("legal.attribution") },
	{ href: "#contact", label: t("legal.contact") },
])
</script>

<template>
	<div class="legal-page mx-auto max-w-3xl space-y-10 pb-8 text-base leading-relaxed">
		<div class="space-y-4">
			<Heading>{{ $t('legal.title') }}</Heading>
			<p class="max-w-xl text-fg-muted">
				{{ $t('legal.intro') }}
			</p>
			<nav class="flex flex-wrap gap-x-4 gap-y-2 text-sm" :aria-label="$t('legal.onThisPage')">
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
			<h2 class="text-2xl font-semibold">{{ $t('legal.aboutTitle') }}</h2>
			<p>{{ $t('legal.aboutBody') }}</p>
		</section>

		<section id="privacy" class="scroll-mt-8 space-y-3">
			<h2 class="text-2xl font-semibold">{{ $t('legal.privacyTitle') }}</h2>
			<p>
				{{ $t('legal.privacyResponsible', { operator: legalOperatorName }) }}
				<template v-if="legalContactEmail">
					{{ $t('legal.privacyWriteTo') }}
					<a :href="mailto" class="text-primary hover:underline">{{ legalContactEmail }}</a>.
				</template>
			</p>
			<p>{{ $t('legal.privacyStoresIntro') }}</p>
			<ul class="list-disc space-y-1 pl-5 text-fg-muted">
				<li>{{ $t('legal.privacyStoresEmail') }}</li>
				<li>{{ $t('legal.privacyStoresLists') }}</li>
				<li>{{ $t('legal.privacyStoresPrefs') }}</li>
				<li>{{ $t('legal.privacyStoresSession') }}</li>
				<li>{{ $t('legal.privacyStoresOffline') }}</li>
			</ul>
			<p>{{ $t('legal.privacyPasswords') }}</p>
			<p>{{ $t('legal.privacyTmdb') }}</p>
			<p>{{ $t('legal.privacyRetention') }}</p>
			<p>{{ $t('legal.privacyProcessors') }}</p>
			<p>
				{{ $t('legal.privacyRights') }}
				<NuxtLink to="/profile" class="text-primary hover:underline">{{ $t('nav.profile') }}</NuxtLink>{{ $t('legal.privacyRightsEnd') }}
			</p>
			<p>{{ $t('legal.privacyShare') }}</p>
			<p>{{ $t('legal.privacyMinAge') }}</p>
		</section>

		<section id="cookies" class="scroll-mt-8 space-y-4">
			<h2 class="text-2xl font-semibold">{{ $t('legal.cookiesTitle') }}</h2>
			<div class="overflow-x-auto">
				<table class="w-full min-w-[36rem] border-collapse text-left text-sm">
					<thead>
						<tr class="border-b border-border-default text-fg-muted">
							<th class="py-2 pr-4 font-medium">{{ $t('legal.tableName') }}</th>
							<th class="py-2 pr-4 font-medium">{{ $t('legal.tableWhy') }}</th>
							<th class="py-2 font-medium">{{ $t('legal.tableDuration') }}</th>
						</tr>
					</thead>
					<tbody class="text-fg-default">
						<tr class="border-b border-border-default align-top">
							<td class="py-3 pr-4"><code>__session</code></td>
							<td class="py-3 pr-4">{{ $t('legal.cookieSessionWhy') }}</td>
							<td class="py-3">{{ $t('legal.cookieSessionDuration') }}</td>
						</tr>
						<tr class="border-b border-border-default align-top">
							<td class="py-3 pr-4"><code>mymdb_consent</code></td>
							<td class="py-3 pr-4">{{ $t('legal.cookieConsentWhy') }}</td>
							<td class="py-3">{{ $t('legal.cookieConsentDuration') }}</td>
						</tr>
						<tr class="border-b border-border-default align-top">
							<td class="py-3 pr-4"><code>cookie_consent_timestamp</code></td>
							<td class="py-3 pr-4">{{ $t('legal.cookieTimestampWhy') }}</td>
							<td class="py-3">{{ $t('legal.cookieConsentDuration') }}</td>
						</tr>
						<tr class="align-top">
							<td class="py-3 pr-4"><code>cookie_consent_version</code></td>
							<td class="py-3 pr-4">{{ $t('legal.cookieVersionWhy') }}</td>
							<td class="py-3">{{ $t('legal.cookieConsentDuration') }}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p>{{ embedStatus }}</p>
			<p class="text-fg-muted">{{ $t('legal.embedChangeHint') }}</p>
			<div class="flex flex-wrap gap-3">
				<UButton type="button" @click="allowEmbeds">{{ $t('legal.allowTrailers') }}</UButton>
				<UButton type="button" color="neutral" variant="outline" @click="blockEmbeds">
					{{ $t('legal.keepTrailersOff') }}
				</UButton>
			</div>
			<p>{{ $t('legal.trailerProcessors') }}</p>
		</section>

		<section id="terms" class="scroll-mt-8 space-y-3">
			<h2 class="text-2xl font-semibold">{{ $t('legal.termsTitle') }}</h2>
			<p>{{ $t('legal.termsBody1') }}</p>
			<p>{{ $t('legal.termsBody2') }}</p>
		</section>

		<section id="impressum" class="scroll-mt-8 space-y-3">
			<h2 class="text-2xl font-semibold">{{ $t('legal.impressumTitle') }}</h2>
			<p>
				{{ $t('legal.impressumBody', { operator: legalOperatorName }) }}
				<template v-if="legalContactEmail">
					{{ $t('legal.impressumContact') }}
					<a :href="mailto" class="text-primary hover:underline">{{ legalContactEmail }}</a>.
				</template>
				<template v-else>
					{{ $t('legal.impressumNoEmail') }}
				</template>
			</p>
			<p class="text-fg-muted">{{ $t('legal.impressumFootnote') }}</p>
		</section>

		<section id="attribution" class="scroll-mt-8 space-y-3">
			<h2 class="text-2xl font-semibold">{{ $t('legal.attributionTitle') }}</h2>
			<p>{{ $t('legal.attributionBody') }}</p>
			<a
				href="https://www.themoviedb.org/"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-block">
				<img src="/tmdb-logo.svg" alt="TMDB" class="h-5 w-auto" />
			</a>
			<p>{{ $t('legal.attributionFirebase') }}</p>
		</section>

		<section id="contact" class="scroll-mt-8 space-y-3">
			<h2 class="text-2xl font-semibold">{{ $t('legal.contactTitle') }}</h2>
			<p v-if="legalContactEmail">
				{{ $t('legal.contactEmail', { email: legalContactEmail }) }}
			</p>
			<p v-else class="text-fg-muted">
				{{ $t('legal.contactNoEmail') }}
			</p>
		</section>
	</div>
</template>