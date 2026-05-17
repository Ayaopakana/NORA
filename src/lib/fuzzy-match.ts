function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
}

/** Расстояние Левенштейна. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = i
    for (let j = 1; j <= b.length; j++) {
      const val =
        a[i - 1] === b[j - 1]
          ? row[j - 1]
          : Math.min(row[j - 1], row[j], prev) + 1
      row[j - 1] = prev
      prev = val
    }
    row[b.length] = prev
  }
  return row[b.length]
}

/** Чем выше score, тем лучше совпадение (0 = нет). */
export function fuzzyScore(query: string, target: string): number {
  const q = normalize(query)
  const t = normalize(target)
  if (!q) return 1
  if (!t) return 0
  if (t === q) return 100
  if (t.startsWith(q)) return 90 - (t.length - q.length)
  if (t.includes(q)) return 75 - (t.length - q.length)
  const dist = levenshtein(q, t)
  const maxLen = Math.max(q.length, t.length)
  const similarity = 1 - dist / maxLen
  if (similarity < 0.45) return 0
  return Math.round(similarity * 70)
}

export function fuzzySearch<T>(
  items: T[],
  query: string,
  getLabel: (item: T) => string,
  options?: { limit?: number; minScore?: number },
): T[] {
  const limit = options?.limit ?? 8
  const minScore = options?.minScore ?? 28
  const q = query.trim()
  if (!q) return items.slice(0, limit)

  return items
    .map((item) => ({
      item,
      score: Math.max(
        fuzzyScore(q, getLabel(item)),
        ...getLabel(item)
          .split(/[,/]/)
          .map((part) => fuzzyScore(q, part.trim())),
      ),
    }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item)
}
