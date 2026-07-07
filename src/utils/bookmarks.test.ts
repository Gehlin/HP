import { describe, it, expect, beforeEach } from 'vitest'
import { getBookmarks, isBookmarked, toggleBookmark, clearBookmarks } from './bookmarks'

const KEY = 'hp_bookmarks'

beforeEach(() => {
  localStorage.clear()
})

describe('getBookmarks', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(getBookmarks()).toEqual([])
  })

  it('reads back whatever was written to the real localStorage key', () => {
    localStorage.setItem(KEY, JSON.stringify(['ord-001', 'xyz-002']))
    expect(getBookmarks()).toEqual(['ord-001', 'xyz-002'])
  })
})

describe('isBookmarked', () => {
  it('is false for a question that was never bookmarked', () => {
    expect(isBookmarked('ord-001')).toBe(false)
  })

  it('is true once the question has been bookmarked', () => {
    toggleBookmark('ord-001')
    expect(isBookmarked('ord-001')).toBe(true)
  })

  it('is false again after toggling the same question off', () => {
    toggleBookmark('ord-001')
    toggleBookmark('ord-001')
    expect(isBookmarked('ord-001')).toBe(false)
  })
})

describe('toggleBookmark', () => {
  it('adds a new bookmark and returns true', () => {
    expect(toggleBookmark('ord-001')).toBe(true)
    expect(getBookmarks()).toEqual(['ord-001'])
  })

  it('removes an existing bookmark and returns false', () => {
    toggleBookmark('ord-001')
    expect(toggleBookmark('ord-001')).toBe(false)
    expect(getBookmarks()).toEqual([])
  })

  it('appends to the end when adding a second bookmark, preserving insertion order', () => {
    toggleBookmark('ord-001')
    toggleBookmark('xyz-002')
    expect(getBookmarks()).toEqual(['ord-001', 'xyz-002'])
  })

  it('removing a middle bookmark leaves the others in their original relative order', () => {
    toggleBookmark('a')
    toggleBookmark('b')
    toggleBookmark('c')
    toggleBookmark('b') // remove the middle one
    expect(getBookmarks()).toEqual(['a', 'c'])
  })

  it('toggling one question does not affect other bookmarked questions', () => {
    toggleBookmark('a')
    toggleBookmark('b')
    toggleBookmark('a') // remove a
    expect(getBookmarks()).toEqual(['b'])
    expect(isBookmarked('b')).toBe(true)
  })

  it('persists across separate calls (real localStorage, not in-memory state)', () => {
    toggleBookmark('ord-001')
    // Simulate a fresh read as a different part of the app would do
    expect(getBookmarks()).toContain('ord-001')
  })
})

describe('clearBookmarks', () => {
  it('removes all bookmarks', () => {
    toggleBookmark('a')
    toggleBookmark('b')
    clearBookmarks()
    expect(getBookmarks()).toEqual([])
  })

  it('is safe to call when there are no bookmarks yet', () => {
    expect(() => clearBookmarks()).not.toThrow()
    expect(getBookmarks()).toEqual([])
  })
})
