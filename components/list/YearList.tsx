'use client'

import { useState, useTransition } from 'react'
import {
  Box, Card, CardContent, Typography, Stack, IconButton, Menu, MenuItem, Table, TableHead, TableRow,
  TableCell, TableBody, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Link, Chip
} from '@mui/material'
import { MoreVert } from '@mui/icons-material'
import type { YearBookItem } from '@/lib/types'
import { PEOPLE, PERSON_NAME } from '@/lib/people'
import { pagesPerMonth, sumPages } from '@/lib/stats'
import { removeFromList, setMonth } from '@/lib/actions'
import ReadToggle from './ReadToggle'

function Title({ item }: { item: YearBookItem }) {
  if (!item.book.url) return <>{item.book.title}</>
  return (
    <Link href={item.book.url} target="_blank" rel="noreferrer" color="inherit" underline="hover">
      {item.book.title}
    </Link>
  )
}

function RowMenu({ item, onMonth }: { item: YearBookItem; onMonth: (item: YearBookItem) => void }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [, startTransition] = useTransition()

  const remove = () => {
    setAnchor(null)
    if (!confirm(`Remove "${item.book.title}" from the ${item.year} list?`)) return
    startTransition(async () => { await removeFromList(item.id) })
  }

  return (
    <>
      <IconButton aria-label="More" onClick={(e) => setAnchor(e.currentTarget)} size="small">
        <MoreVert />
      </IconButton>
      <Menu open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { setAnchor(null); onMonth(item) }}>Set month</MenuItem>
        <MenuItem onClick={remove} sx={{ color: 'error.main' }}>Remove from list</MenuItem>
      </Menu>
    </>
  )
}

function MonthDialog({ item, onClose }: { item: YearBookItem | null; onClose: () => void }) {
  const [value, setValue] = useState('')
  const [, startTransition] = useTransition()

  const save = () => {
    if (!item) return
    startTransition(async () => { await setMonth(item.id, value) })
    onClose()
  }

  return (
    <Dialog open={Boolean(item)} onClose={onClose} fullWidth maxWidth="xs"
      slotProps={{ transition: { onEnter: () => setValue(item?.month ?? '') } }}>
      <DialogTitle>When was it read?</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="Month"
          placeholder="e.g. March or April / May"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={save}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}

function Summary({ items }: { items: YearBookItem[] }) {
  const pages = sumPages(items)
  const readByAll = items.filter((i) => i.reads.length === PEOPLE.length).length
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2, flexWrap: 'wrap' }}>
      <Chip label={`${items.length} books`} />
      <Chip label={`${readByAll} read by all`} color="secondary" variant="outlined" />
      <Chip label={`${pages.toLocaleString('en')} pages`} variant="outlined" />
      <Chip label={`${pagesPerMonth(pages)} pages / month`} variant="outlined" />
    </Stack>
  )
}

export default function YearList({ year, items }: { year: number; items: YearBookItem[] }) {
  const [monthItem, setMonthItem] = useState<YearBookItem | null>(null)

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

      <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
        {items.map((item) => (
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
                    {[item.book.author, item.book.pages ? `${item.book.pages} pages` : null, item.month]
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                </Box>
                <RowMenu item={item} onMonth={setMonthItem} />
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

      <Paper variant="outlined" sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={48}>#</TableCell>
              <TableCell>Title</TableCell>
              {PEOPLE.map((p) => (
                <TableCell key={p} align="center" width={72}>{PERSON_NAME[p]}</TableCell>
              ))}
              <TableCell align="right" width={90}>Pages</TableCell>
              <TableCell width={160}>Month</TableCell>
              <TableCell width={56} />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
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
                <TableCell>{item.month ?? ''}</TableCell>
                <TableCell align="right"><RowMenu item={item} onMonth={setMonthItem} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <MonthDialog item={monthItem} onClose={() => setMonthItem(null)} />
    </>
  )
}
