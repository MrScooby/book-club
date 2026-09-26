import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as XLSX from 'xlsx'

const SOURCE = resolve(process.argv[2] ?? '../12 books challenge.xlsx')
const TARGET = resolve('prisma/seed-data.json')
const PEOPLE = ['SCOOBY', 'MINIS', 'BARTEK']
const SUGGESTION_BLOCK_YEARS = [2020, 2021, null, 2022, 2023, 2024, 2025, 2026]
const SPLIT_ROWS = {
  'otoczeni przez idiotów / hrabia monte christo / chrobot': [
    'Otoczeni przez idiotów',
    'Hrabia Monte Christo',
    'Chrobot'
  ]
}

const wb = XLSX.read(readFileSync(SOURCE))
const rows = (name) => XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: null })

const text = (v) => {
  if (v == null) return null
  const s = typeof v === 'number' ? String(v).replace(/\.0$/, '') : String(v)
  const t = s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
  return t.length ? t : null
}
const normalize = (title) => text(title)?.toLowerCase().replace(/[.\s]+$/, '') ?? null
const isMark = (v) => typeof v === 'string' && v.trim().toLowerCase() === 'x'
const pagesOf = (v) => (typeof v === 'number' && v > 0 ? Math.round(v) : null)
const lcIdOf = (url) => {
  const m = typeof url === 'string' && url.match(/\/ksiazka\/(\d+)/)
  return m ? Number(m[1]) : null
}

const books = new Map()
const titleToKey = new Map()
function bookKey({ title, url, pages, canonicalPages = false }) {
  const norm = normalize(title)
  const lcId = lcIdOf(url)
  let key = titleToKey.get(norm) ?? (lcId ? `lc:${lcId}` : `t:${norm}`)
  if (!books.has(key)) books.set(key, { key, title: text(title), url: null, pages: null, lcId: null })
  const book = books.get(key)
  if (!book.url && url) { book.url = text(url); book.lcId = lcId }
  if (pages && (canonicalPages || !book.pages)) book.pages = pages
  if (!titleToKey.has(norm)) titleToKey.set(norm, key)
  return key
}

const suggestions = []
const sugRows = rows('suggestions')
let block = -1
for (const r of sugRows) {
  const [a] = r
  if (text(a)?.startsWith('Scooby') || text(a)?.startsWith('Kasia')) { block++; continue }
  const year = SUGGESTION_BLOCK_YEARS[block]
  if (!year) continue
  for (const [i, person] of PEOPLE.entries()) {
    const [title, url, pages, veto] = r.slice(i * 4, i * 4 + 4)
    if (!text(title)) continue
    const key = bookKey({ title, url, pages: pagesOf(pages) })
    if (suggestions.some((s) => s.year === year && s.bookKey === key)) continue
    suggestions.push({ year, bookKey: key, proposedBy: person, rejected: isMark(veto) })
  }
}

const yearBooks = []
let year = null
let position = 0
for (const r of rows('all')) {
  const [num, title, s, m, b, pages] = r
  if (typeof title === 'number' && title > 2000 && text(r[2]) === 'Scooby') { year = title; position = 0; continue }
  if (!year || !Number.isFinite(Number(num)) || !text(title)) continue
  const reads = PEOPLE.filter((_, i) => isMark([s, m, b][i]))
  const parts = SPLIT_ROWS[normalize(title)]
  if (parts) {
    for (const part of parts) {
      const key = bookKey({ title: part })
      yearBooks.push({ year, bookKey: key, position: ++position, reads })
    }
    continue
  }
  const key = bookKey({ title, pages: pagesOf(pages), canonicalPages: true })
  yearBooks.push({ year, bookKey: key, position: ++position, reads })
}

for (const r of rows('2023')) {
  if (!text(r[1]) || text(r[1]) === 'book') continue
  const key = bookKey({ title: r[1] })
  if (!yearBooks.some((y) => y.year === 2023 && y.bookKey === key)) {
    const pos = yearBooks.filter((y) => y.year === 2023).length + 1
    yearBooks.push({ year: 2023, bookKey: key, position: pos, reads: [] })
  }
}

const data = { books: [...books.values()], yearBooks, suggestions }
writeFileSync(TARGET, JSON.stringify(data, null, 2) + '\n')

const years = [...new Set(yearBooks.map((y) => y.year))].sort()
console.log(`books ${data.books.length}, yearBooks ${yearBooks.length}, suggestions ${suggestions.length}`)
for (const y of years) {
  const list = yearBooks.filter((b) => b.year === y)
  const pages = list.reduce((sum, b) => sum + (books.get(b.bookKey).pages ?? 0), 0)
  const sugg = suggestions.filter((s) => s.year === y).length
  console.log(`${y}: ${list.length} books, ${pages} pages, ${sugg} suggestions`)
}
