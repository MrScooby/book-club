'use client'

import { useState, useTransition } from 'react'
import {
  Box, Tabs, Tab, Grid, Card, CardContent, Typography, Stack, Chip, IconButton, Tooltip, Fab, Link
} from '@mui/material'
import { Add, Block, PlaylistAdd, PlaylistAddCheck, DeleteOutlined } from '@mui/icons-material'
import type { Person } from '@/lib/generated/prisma/enums'
import type { SuggestionItem } from '@/lib/types'
import { PEOPLE, PERSON_NAME } from '@/lib/people'
import { addToList, deleteSuggestion, toggleVeto } from '@/lib/actions'
import AddSuggestionDialog from './AddSuggestionDialog'

function SuggestionCard({ item }: { item: SuggestionItem }) {
  const [, startTransition] = useTransition()
  const { book } = item

  const remove = () => {
    if (!confirm(`Delete "${book.title}" from ${item.year} suggestions?`)) return
    startTransition(async () => { await deleteSuggestion(item.id) })
  }

  return (
    <Card sx={{ opacity: item.vetoed ? 0.6 : 1, borderColor: item.onList ? 'secondary.main' : undefined }}>
      <CardContent sx={{ display: 'flex', gap: 1.5, pb: '12px !important' }}>
        {book.coverUrl && (
          <Box component="img" src={book.coverUrl} alt="" loading="lazy"
            sx={{ width: 56, height: 84, objectFit: 'cover', borderRadius: 1, flexShrink: 0, bgcolor: 'grey.100' }} />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, lineHeight: 1.3, textDecoration: item.vetoed ? 'line-through' : 'none' }}>
            {book.url ? (
              <Link href={book.url} target="_blank" rel="noreferrer" color="inherit" underline="hover">{book.title}</Link>
            ) : book.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {[book.author, book.pages ? `${book.pages} pages` : null].filter(Boolean).join(' · ')}
          </Typography>
          <Stack direction="row" spacing={0.5} useFlexGap sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {item.onList && <Chip size="small" color="secondary" label="On the list" />}
            {item.vetoed && <Chip size="small" color="error" variant="outlined" label="Vetoed" />}
            <Box sx={{ flex: 1 }} />
            <Tooltip title={item.vetoed ? 'Remove veto' : 'Veto'}>
              <IconButton size="small" color={item.vetoed ? 'error' : 'default'}
                onClick={() => startTransition(async () => { await toggleVeto(item.id) })} aria-label="Veto">
                <Block fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={item.onList ? 'Already on the list' : 'Add to the list'}>
              <span>
                <IconButton size="small" color="secondary" disabled={item.onList || item.vetoed}
                  onClick={() => startTransition(async () => { await addToList(item.id) })} aria-label="Add to list">
                  {item.onList ? <PlaylistAddCheck fontSize="small" /> : <PlaylistAdd fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={remove} aria-label="Delete">
                <DeleteOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

function Column({ items }: { items: SuggestionItem[] }) {
  return (
    <Stack spacing={1.5}>
      {items.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No suggestions yet</Typography>
      )}
      {items.map((item) => <SuggestionCard key={item.id} item={item} />)}
    </Stack>
  )
}

export default function SuggestionsBoard({ year, items }: { year: number; items: SuggestionItem[] }) {
  const [tab, setTab] = useState<Person>(PEOPLE[0])
  const [open, setOpen] = useState(false)
  const byPerson = (p: Person) => items.filter((i) => i.proposedBy === p)

  return (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' }, pb: 9 }}>
        <Tabs value={tab} onChange={(_, v: Person) => setTab(v)} variant="fullWidth" sx={{ mb: 2 }}>
          {PEOPLE.map((p) => (
            <Tab key={p} value={p} sx={{ fontWeight: 600, minHeight: 48, textTransform: 'none' }}
              label={`${PERSON_NAME[p]} (${byPerson(p).length})`} />
          ))}
        </Tabs>
        <Column items={byPerson(tab)} />
      </Box>

      <Grid container spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
        {PEOPLE.map((p) => (
          <Grid key={p} size={4}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              {PERSON_NAME[p]} <Typography component="span" color="text.secondary">({byPerson(p).length})</Typography>
            </Typography>
            <Column items={byPerson(p)} />
          </Grid>
        ))}
      </Grid>

      <Fab color="primary" aria-label="Suggest a book" onClick={() => setOpen(true)}
        sx={{ position: 'fixed', right: 16, bottom: { xs: 'calc(80px + env(safe-area-inset-bottom))', md: 24 } }}>
        <Add />
      </Fab>

      <AddSuggestionDialog year={year} open={open} onClose={() => setOpen(false)} defaultPerson={tab} />
    </>
  )
}
