'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { isPerson } from '@/lib/people'
import { parseYear } from '@/lib/years'
import { isLubimyczytacUrl, scrapeBook, type ScrapedBook } from '@/lib/lubimyczytac'

export type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string }

function revalidateYear(year: number) {
  revalidatePath(`/${year}`)
  revalidatePath(`/${year}/suggestions`)
  revalidatePath('/stats')
}

const clean = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

const toPages = (v: unknown) => {
  const n = Number(v)
  return Number.isInteger(n) && n > 0 && n < 10000 ? n : null
}

export async function toggleRead(yearBookId: string, person: unknown): Promise<Result> {
  if (!isPerson(person)) return { ok: false, error: 'Unknown person' }
  const yearBook = await db.yearBook.findUnique({ where: { id: yearBookId } })
  if (!yearBook) return { ok: false, error: 'Book not found' }
  const key = { yearBookId_person: { yearBookId, person } }
  const existing = await db.read.findUnique({ where: key })
  if (existing) await db.read.delete({ where: key })
  else await db.read.create({ data: { yearBookId, person } })
  revalidateYear(yearBook.year)
  return { ok: true }
}

export async function moveOnList(yearBookId: string, direction: 'up' | 'down'): Promise<Result> {
  const current = await db.yearBook.findUnique({ where: { id: yearBookId } })
  if (!current) return { ok: false, error: 'Book not found' }
  const neighbour = await db.yearBook.findFirst({
    where: { year: current.year, position: direction === 'up' ? { lt: current.position } : { gt: current.position } },
    orderBy: { position: direction === 'up' ? 'desc' : 'asc' }
  })
  if (!neighbour) return { ok: true }
  await db.$transaction([
    db.yearBook.update({ where: { id: current.id }, data: { position: -1 } }),
    db.yearBook.update({ where: { id: neighbour.id }, data: { position: current.position } }),
    db.yearBook.update({ where: { id: current.id }, data: { position: neighbour.position } })
  ])
  revalidateYear(current.year)
  return { ok: true }
}

export async function removeFromList(yearBookId: string): Promise<Result> {
  const yearBook = await db.yearBook.delete({ where: { id: yearBookId } })
  revalidateYear(yearBook.year)
  return { ok: true }
}

export async function addToList(suggestionId: string): Promise<Result> {
  const suggestion = await db.suggestion.findUnique({ where: { id: suggestionId } })
  if (!suggestion) return { ok: false, error: 'Suggestion not found' }
  const { year, bookId } = suggestion
  const exists = await db.yearBook.findUnique({ where: { year_bookId: { year, bookId } } })
  if (exists) return { ok: false, error: 'Already on the list' }
  const last = await db.yearBook.aggregate({ where: { year }, _max: { position: true } })
  await db.yearBook.create({ data: { year, bookId, position: (last._max.position ?? 0) + 1 } })
  revalidateYear(year)
  return { ok: true }
}

export async function toggleRejected(suggestionId: string): Promise<Result> {
  const suggestion = await db.suggestion.findUnique({ where: { id: suggestionId } })
  if (!suggestion) return { ok: false, error: 'Suggestion not found' }
  await db.suggestion.update({ where: { id: suggestionId }, data: { rejected: !suggestion.rejected } })
  revalidateYear(suggestion.year)
  return { ok: true }
}

export async function deleteSuggestion(suggestionId: string): Promise<Result> {
  const suggestion = await db.suggestion.delete({ where: { id: suggestionId } })
  revalidateYear(suggestion.year)
  return { ok: true }
}

export interface NewSuggestion {
  year: number
  proposedBy: string
  title: string
  author?: string
  url?: string
  pages?: number | string | null
  lcId?: number | null
}

export async function addSuggestion(input: NewSuggestion): Promise<Result> {
  const year = parseYear(String(input.year))
  if (!year) return { ok: false, error: 'Invalid year' }
  if (!isPerson(input.proposedBy)) return { ok: false, error: 'Pick a person' }
  const title = clean(input.title)
  if (!title) return { ok: false, error: 'Title is required' }
  const url = clean(input.url, 500) || null
  const lcId = typeof input.lcId === 'number' && Number.isInteger(input.lcId) && input.lcId > 0 ? input.lcId : null
  const author = clean(input.author) || null
  const pages = toPages(input.pages)

  let book =
    (lcId ? await db.book.findUnique({ where: { lcId } }) : null) ??
    (await db.book.findFirst({ where: { title: { equals: title, mode: 'insensitive' } } }))

  if (!book) {
    book = await db.book.create({ data: { title, author, url, pages, lcId } })
  } else {
    await db.book.update({
      where: { id: book.id },
      data: {
        author: book.author ?? author,
        url: book.url ?? url,
        pages: book.pages ?? pages,
        lcId: book.lcId ?? lcId
      }
    })
  }

  const exists = await db.suggestion.findUnique({ where: { year_bookId: { year, bookId: book.id } } })
  if (exists) return { ok: false, error: 'This book is already suggested this year' }

  await db.suggestion.create({ data: { year, bookId: book.id, proposedBy: input.proposedBy } })
  revalidateYear(year)
  return { ok: true }
}

export async function fetchBookFromUrl(url: unknown): Promise<Result<ScrapedBook>> {
  const value = clean(url, 500)
  if (!isLubimyczytacUrl(value)) return { ok: false, error: 'Paste a lubimyczytac.pl link' }
  try {
    const data = await scrapeBook(value)
    if (!data.title) return { ok: false, error: 'Could not read the book page' }
    return { ok: true, data }
  } catch {
    return { ok: false, error: 'Could not fetch the page' }
  }
}
