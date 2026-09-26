import axios from 'axios'
import * as cheerio from 'cheerio'

export interface ScrapedBook {
  lcId: number | null
  title: string
  author: string | null
  pages: number | null
  coverUrl: string | null
}

export function isLubimyczytacUrl(url: string) {
  try {
    return new URL(url).hostname.endsWith('lubimyczytac.pl')
  } catch {
    return false
  }
}

export async function scrapeBook(url: string): Promise<ScrapedBook> {
  const res = await axios.get<string>(url, { responseType: 'text', timeout: 15000 })
  const $ = cheerio.load(res.data)

  const authors = $('.author a')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
  const lcId = Number($('button.btn-rate').attr('data-bookid'))
  const pages = Number($('#book-details dl dt:contains("Liczba stron:")').next().text())

  return {
    lcId: Number.isFinite(lcId) && lcId > 0 ? lcId : null,
    title: $('h1.book__title').text().trim(),
    author: authors.length ? authors.join(', ') : null,
    pages: Number.isFinite(pages) && pages > 0 ? pages : null,
    coverUrl: $('#js-lightboxCover').attr('href') || null
  }
}
