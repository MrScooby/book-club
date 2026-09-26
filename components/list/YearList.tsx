'use client'

import { useState, useTransition } from 'react'
import {
  Box, Card, CardContent, Typography, Stack, IconButton, Menu, MenuItem, Table, TableHead, TableRow,
  TableCell, TableBody, Paper, Link, Chip
} from '@mui/material'
import { MoreVert } from '@mui/icons-material'
import type { YearBookItem } from '@/lib/types'
import { PEOPLE, PERSON_NAME } from '@/lib/people'
import { pagesPerMonth, sumPages } from '@/lib/stats'
import { moveOnList, removeFromList } from '@/lib/actions'
import ReadToggle from './ReadToggle'
import MonthRail from './MonthRail'

function Title({ item }: { item: YearBookItem }) {
  if (!item.book.url) return <>{item.book.title}</>
  return (
    <Link href={item.book.url} target="_blank" rel="noreferrer" color="inherit" underline="hover">
      {item.book.title}
    </Link>
  )
}

function RowMenu({ item, isFirst, isLast }: { item: YearBookItem; isFirst: boolean; isLast: boolean }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [, startTransition] = useTransition()

  const remove = () => {
    setAnchor(null)
    if (!confirm(`Remove "${item.book.title}" from the ${item.year} list?`)) return
    startTransition(async () => { await removeFromList(item.id) })
  }

  const move = (direction: 'up' | 'down') => {
    setAnchor(null)
    startTransition(async () => { await moveOnList(item.id, direction) })
  }

  return (
    <>
      <IconButton aria-label="More" onClick={(e) => setAnchor(e.currentTarget)} size="small">
        <MoreVert />
      </IconButton>
      <Menu open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => move('up')} disabled={isFirst}>Move up</MenuItem>
        <MenuItem onClick={() => move('down')} disabled={isLast}>Move down</MenuItem>
        <MenuItem onClick={remove} sx={{ color: 'error.main' }}>Remove from list</MenuItem>
      </Menu>
    </>
  )
}

function Summary({ items }: { items: YearBookItem[] }) {
  const pages = sumPages(items)
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2, flexWrap: 'wrap' }}>
      <Chip label={`${items.length} books`} />
      <Chip label={`${pages.toLocaleString('en')} pages`} variant="outlined" />
      <Chip label={`${pagesPerMonth(pages)} pages / month`} variant="outlined" />
    </Stack>
  )
}

export default function YearList({ year, items }: { year: number; items: YearBookItem[] }) {
  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
        <Typography variant="h6">Nothing on the {year} list yet</Typography>
        <Typography>Pick books from the suggestions.</Typography>
      </Box>
    )
  }

  return (
    <>
      <Summary items={items} />

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'stretch' }}>
        <MonthRail year={year} />

        <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' }, flex: 1, minWidth: 0 }}>
          {items.map((item, i) => (
            <Card key={item.id}>
              <CardContent sx={{ pb: '12px !important' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ pt: 0.4, minWidth: 22 }}>
                    {item.position}.
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      <Title item={item} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {[item.book.author, item.book.pages ? `${item.book.pages} pages` : null].filter(Boolean).join(' · ')}
                    </Typography>
                  </Box>
                  <RowMenu item={item} isFirst={i === 0} isLast={i === items.length - 1} />
                </Stack>
                <Stack direction="row" spacing={1.5} sx={{ mt: 1.5, pl: 3.75 }}>
                  {PEOPLE.map((person) => (
                    <ReadToggle key={person} yearBookId={item.id} person={person} read={item.reads.includes(person)} />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Paper variant="outlined" sx={{ display: { xs: 'none', md: 'block' }, flex: 1, minWidth: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={48}>#</TableCell>
                <TableCell>Title</TableCell>
                {PEOPLE.map((p) => (
                  <TableCell key={p} align="center" width={72}>{PERSON_NAME[p]}</TableCell>
                ))}
                <TableCell align="right" width={90}>Pages</TableCell>
                <TableCell width={56} />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, i) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.position}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 500 }}><Title item={item} /></Typography>
                    {item.book.author && (
                      <Typography variant="body2" color="text.secondary">{item.book.author}</Typography>
                    )}
                  </TableCell>
                  {PEOPLE.map((person) => (
                    <TableCell key={person} align="center" sx={{ px: 0.5 }}>
                      <ReadToggle yearBookId={item.id} person={person} read={item.reads.includes(person)} size="small" />
                    </TableCell>
                  ))}
                  <TableCell align="right">{item.book.pages ?? '—'}</TableCell>
                  <TableCell align="right"><RowMenu item={item} isFirst={i === 0} isLast={i === items.length - 1} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </>
  )
}
