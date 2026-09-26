export const FIRST_YEAR = 2020

export function currentYear() {
  return new Date().getFullYear()
}

export function parseYear(raw: string): number | null {
  const year = Number(raw)
  return Number.isInteger(year) && year >= FIRST_YEAR && year <= currentYear() + 1 ? year : null
}

export function allYears(latest = currentYear()) {
  const years: number[] = []
  for (let y = latest; y >= FIRST_YEAR; y--) years.push(y)
  return years
}
