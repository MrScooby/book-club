import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import type { Person } from '../lib/generated/prisma/enums'
import data from './seed-data.json'

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

async function main() {
  await db.read.deleteMany()
  await db.yearBook.deleteMany()
  await db.suggestion.deleteMany()
  await db.book.deleteMany()

  const ids = new Map<string, string>()
  for (const book of data.books) {
    const created = await db.book.create({
      data: { title: book.title, url: book.url, pages: book.pages, lcId: book.lcId }
    })
    ids.set(book.key, created.id)
  }

  for (const yb of data.yearBooks) {
    await db.yearBook.create({
      data: {
        year: yb.year,
        bookId: ids.get(yb.bookKey)!,
        position: yb.position,
        month: yb.month,
        reads: { create: yb.reads.map((person) => ({ person: person as Person })) }
      }
    })
  }

  for (const s of data.suggestions) {
    await db.suggestion.create({
      data: { year: s.year, bookId: ids.get(s.bookKey)!, proposedBy: s.proposedBy as Person, vetoed: s.vetoed }
    })
  }

  const years = await db.yearBook.groupBy({ by: ['year'], _count: true, orderBy: { year: 'asc' } })
  console.log(`books ${data.books.length}, suggestions ${data.suggestions.length}`)
  for (const y of years) {
    const list = await db.yearBook.findMany({ where: { year: y.year }, include: { book: true, reads: true } })
    const pages = list.reduce((sum, b) => sum + (b.book.pages ?? 0), 0)
    const reads = list.reduce((sum, b) => sum + b.reads.length, 0)
    console.log(`${y.year}: ${list.length} books, ${pages} pages, ${reads} reads`)
  }
}

main().finally(() => db.$disconnect())
