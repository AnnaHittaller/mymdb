import { describe, expect, it } from 'vitest'
import { formatKeywordIdsForDiscover, isBlockedDiscoverKeyword } from './tmdbDiscoverKeywords'

describe('formatKeywordIdsForDiscover', () => {
	it('joins thematic keyword ids with OR and skips mood tags', () => {
		const ids = formatKeywordIdsForDiscover([
			{ id: 818, name: 'based on novel or book' },
			{ id: 9826, name: 'romance' },
			{ id: 1, name: 'depressing' },
			{ id: 2, name: 'pretentious' },
			{ id: 3, name: 'costume drama' },
		])
		expect(ids).toBe('818|9826|3')
		expect(isBlockedDiscoverKeyword('cliche')).toBe(true)
	})
})
