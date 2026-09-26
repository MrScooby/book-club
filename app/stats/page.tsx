import { Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Box } from '@mui/material'
import NextLink from 'next/link'
import { getStats } from '@/lib/queries'
import { pagesPerMonth } from '@/lib/stats'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const stats = await getStats()
  const totalBooks = stats.reduce((s, y) => s + y.books, 0)
  const totalPages = stats.reduce((s, y) => s + y.pages, 0)

  return (
    <>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1.5 }}>
        Stats
      </Typography>
      <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ '& td, & th': { py: 1.25, whiteSpace: 'nowrap' } }}>
          <TableHead>
            <TableRow>
              <TableCell>Year</TableCell>
              <TableCell align="right">Books</TableCell>
              <TableCell align="right">Read by all</TableCell>
              <TableCell align="right">Pages</TableCell>
              <TableCell align="right">Pages / month</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((y) => (
              <TableRow key={y.year} hover>
                <TableCell sx={{ fontWeight: 600 }}>
                  <NextLink href={`/${y.year}`} style={{ color: 'inherit' }}>{y.year}</NextLink>
                </TableCell>
                <TableCell align="right">{y.books}</TableCell>
                <TableCell align="right">{y.readByAll}</TableCell>
                <TableCell align="right">{y.pages.toLocaleString('en')}</TableCell>
                <TableCell align="right">{pagesPerMonth(y.pages)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{totalBooks}</TableCell>
              <TableCell />
              <TableCell align="right" sx={{ fontWeight: 700 }}>{totalPages.toLocaleString('en')}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
      <Box sx={{ mt: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Pages / month is the year total divided by 12, as in the spreadsheet.
        </Typography>
      </Box>
    </>
  )
}
