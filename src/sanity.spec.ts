import { describe, expect, it } from 'vitest'

// Throwaway check that the Vitest pipeline (config, jsdom env, test script)
// is wired correctly. Delete once real tests exist (see ticket #4 onward).
describe('sanity', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
