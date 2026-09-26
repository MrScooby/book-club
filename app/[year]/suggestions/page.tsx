import { notFound } from 'next/navigation'
import { Typography } from '@mui/material'
import { parseYear } from '@/lib/years'
import { getSuggestions } from '@/lib/queries'
import SuggestionsBoard from '@/components/suggestions/SuggestionsBoard'

export const dynamic = 'force-dynamic'

export default async function SuggestionsPage({ params }: PageProps<'/[year]/suggestions'>) {
  const year = parseYear((await params).year)
  if (!year) notFound()
  const items = await getSuggestions(year)

  return (
    <>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1.5 }}>
        {year} suggestions
      </Typography>
      <SuggestionsBoard year={year} items={items} />
    </>
  )
}
