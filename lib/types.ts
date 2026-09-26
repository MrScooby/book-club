import type { Person } from '@/lib/generated/prisma/enums'

export interface BookInfo {
  id: string
  title: string
  author: string | null
  url: string | null
  pages: number | null
  coverUrl: string | null
}

export interface YearBookItem {
  id: string
  year: number
  position: number
  month: string | null
  book: BookInfo
  reads: Person[]
}

export interface SuggestionItem {
  id: string
  year: number
  proposedBy: Person
  vetoed: boolean
  onList: boolean
  book: BookInfo
}

export interface YearStats {
  year: number
  books: number
  readByAll: number
  pages: number
}
