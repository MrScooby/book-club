import { notFound } from 'next/navigation'
import { Typography } from '@mui/material'
import { parseYear } from '@/lib/years'
import { getYearList } from '@/lib/queries'
import YearList from '@/components/list/YearList'

export const dynamic = 'force-dynamic'

export default async function YearPage({ params }: PageProps<'/[year]'>) {
  const year = parseYear((await params).year)
  if (!year) notFound()
  const items = await getYearList(year)

  return (
    <>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1.5 }}>
        {year} list
      </Typography>
      <YearList year={year} items={items} />
    </>
  )
}
