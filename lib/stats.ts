export function pagesPerMonth(totalPages: number) {
  return Math.round(totalPages / 12)
}

export function sumPages(items: { book: { pages: number | null } }[]) {
  return items.reduce((sum, item) => sum + (item.book.pages ?? 0), 0)
}
