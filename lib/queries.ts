import { db } from '@/lib/db'
import { currentYear } from '@/lib/years'
import type { SuggestionItem, YearBookItem, YearStats } from '@/lib/types'

const bookSelect = { id: true, title: true, author: true, url: true, pages: true, coverUrl: true } as const

export async function getYearList(year: number): Promise<YearBookItem[]> {
  const rows = await db.yearBook.findMany({
    where: { year },
    orderBy: { position: 'asc' },
    include: { book: { select: bookSelect }, reads: { select: { person: true } } }
  })
  return rows.map((r) => ({
    id: r.id,
    year: r.year,
    position: r.position,
    book: r.book,
    reads: r.reads.map((x) => x.person)
  }))
}

export async function getSuggestions(year: number): Promise<SuggestionItem[]> {
  const [rows, listed] = await Promise.all([
    db.suggestion.findMany({
      where: { year },
      orderBy: { createdAt: 'asc' },
      include: { book: { select: bookSelect } }
    }),
    db.yearBook.findMany({ where: { year }, select: { bookId: true } })
  ])
  const onList = new Set(listed.map((x) => x.bookId))
  return rows.map((r) => ({
    id: r.id,
    year: r.year,
    proposedBy: r.proposedBy,
    rejected: r.rejected,
    onList: onList.has(r.bookId),
    book: r.book
  }))
}

export async function getYears(): Promise<number[]> {
  const [lists, suggestions] = await Promise.all([
    db.yearBook.findMany({ distinct: ['year'], select: { year: true } }),
    db.suggestion.findMany({ distinct: ['year'], select: { year: true } })
  ])
  const years = new Set([...lists, ...suggestions].map((x) => x.year))
  years.add(currentYear())
  years.add(currentYear() + 1)
  return [...years].sort((a, b) => b - a)
}

export async function getStats(): Promise<YearStats[]> {
  const rows = await db.yearBook.findMany({
    include: { book: { select: { pages: true } } }
  })
  const byYear = new Map<number, YearStats>()
  for (const r of rows) {
    const s = byYear.get(r.year) ?? { year: r.year, books: 0, pages: 0 }
    s.books += 1
    s.pages += r.book.pages ?? 0
    byYear.set(r.year, s)
  }
  return [...byYear.values()].sort((a, b) => b.year - a.year)
}
