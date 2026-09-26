import type { Person } from '@/lib/generated/prisma/enums'

export const PEOPLE: Person[] = ['SCOOBY', 'MINIS', 'BARTEK']

export const PERSON_NAME: Record<Person, string> = {
  SCOOBY: 'Scooby',
  MINIS: 'Minis',
  BARTEK: 'Bartek'
}

export const PERSON_INITIAL: Record<Person, string> = {
  SCOOBY: 'S',
  MINIS: 'M',
  BARTEK: 'B'
}

export const PERSON_COLOR: Record<Person, string> = {
  SCOOBY: '#fdebd0',
  MINIS: '#dbe9f6',
  BARTEK: '#e6def7'
}

export function isPerson(value: unknown): value is Person {
  return typeof value === 'string' && (PEOPLE as string[]).includes(value)
}
