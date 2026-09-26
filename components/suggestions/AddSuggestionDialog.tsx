'use client'

import { useState, useTransition } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, ToggleButtonGroup, ToggleButton,
  Stack, Alert, CircularProgress, InputAdornment, IconButton, useMediaQuery, useTheme
} from '@mui/material'
import { CloudDownload } from '@mui/icons-material'
import type { Person } from '@/lib/generated/prisma/enums'
import { PEOPLE, PERSON_NAME } from '@/lib/people'
import { addSuggestion, fetchBookFromUrl } from '@/lib/actions'
import { isLubimyczytacUrl } from '@/lib/lubimyczytac'

interface Props {
  year: number
  open: boolean
  onClose: () => void
  defaultPerson: Person
}

const empty = { url: '', title: '', author: '', pages: '', lcId: null as number | null }

export default function AddSuggestionDialog({ year, open, onClose, defaultPerson }: Props) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [person, setPerson] = useState<Person>(defaultPerson)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [saving, startSaving] = useTransition()

  const reset = () => {
    setForm(empty)
    setError(null)
    setPerson(defaultPerson)
  }

  const set = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const fetchFromUrl = async (url: string) => {
    if (!isLubimyczytacUrl(url)) return
    setFetching(true)
    setError(null)
    const res = await fetchBookFromUrl(url)
    setFetching(false)
    if (!res.ok) return setError(res.error)
    const b = res.data!
    setForm((f) => ({
      ...f,
      url,
      title: b.title || f.title,
      author: b.author ?? f.author,
      pages: b.pages ? String(b.pages) : f.pages,
      lcId: b.lcId
    }))
  }

  const onUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim()
    setForm((f) => ({ ...f, url }))
    if (isLubimyczytacUrl(url) && !form.title) void fetchFromUrl(url)
  }

  const submit = () => {
    startSaving(async () => {
      const res = await addSuggestion({
        year,
        proposedBy: person,
        title: form.title,
        author: form.author,
        url: form.url,
        pages: form.pages,
        lcId: form.lcId
      })
      if (!res.ok) return setError(res.error)
      reset()
      onClose()
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm"
      slotProps={{ transition: { onExited: reset } }}>
      <DialogTitle>Suggest a book for {year}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={person}
            onChange={(_, v: Person | null) => v && setPerson(v)}
            color="primary"
          >
            {PEOPLE.map((p) => (
              <ToggleButton key={p} value={p} sx={{ py: 1.25, fontWeight: 600 }}>{PERSON_NAME[p]}</ToggleButton>
            ))}
          </ToggleButtonGroup>

          <TextField
            label="lubimyczytac.pl link"
            value={form.url}
            onChange={onUrlChange}
            fullWidth
            type="url"
            autoComplete="off"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {fetching ? (
                      <CircularProgress size={20} />
                    ) : (
                      <IconButton aria-label="Fetch book data" onClick={() => fetchFromUrl(form.url)}
                        disabled={!isLubimyczytacUrl(form.url)} edge="end">
                        <CloudDownload />
                      </IconButton>
                    )}
                  </InputAdornment>
                )
              }
            }}
          />

          <TextField label="Title" value={form.title} onChange={set('title')} fullWidth required />
          <TextField label="Author" value={form.author} onChange={set('author')} fullWidth />
          <TextField label="Pages" value={form.pages} onChange={set('pages')} type="number" sx={{ maxWidth: 160 }}
            slotProps={{ htmlInput: { inputMode: 'numeric', min: 1 } }} />

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={saving || !form.title.trim()}>
          {saving ? 'Saving…' : 'Add suggestion'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
