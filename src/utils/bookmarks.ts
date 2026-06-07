const KEY = 'hp_bookmarks'

export function getBookmarks(): string[] {
  return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
}

export function isBookmarked(qid: string): boolean {
  return getBookmarks().includes(qid)
}

export function toggleBookmark(qid: string): boolean {
  const current = getBookmarks()
  const idx = current.indexOf(qid)
  if (idx >= 0) {
    localStorage.setItem(KEY, JSON.stringify(current.filter((_, i) => i !== idx)))
    return false
  } else {
    localStorage.setItem(KEY, JSON.stringify([...current, qid]))
    return true
  }
}

export function clearBookmarks() {
  localStorage.removeItem(KEY)
}
