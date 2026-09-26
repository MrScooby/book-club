'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  Box, Card, CardContent, Typography, Stack, IconButton, Menu, MenuItem, Table, TableHead, TableRow,
  TableCell, TableBody, Paper, Link, Chip
} from '@mui/material'
import { MoreVert, DragIndicator } from '@mui/icons-material'
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import type { YearBookItem } from '@/lib/types'
import { PEOPLE, PERSON_COLOR, PERSON_NAME } from '@/lib/people'
import { pagesPerMonth, sumPages } from '@/lib/stats'
import { removeFromList, reorderList } from '@/lib/actions'
import ReadToggle from './ReadToggle'
import MonthRail from './MonthRail'

const HEADER_HEIGHT = 56

function Title({ item }: { item: YearBookItem }) {
  if (!item.book.url) return <>{item.book.title}</>
  return (
    <Link href={item.book.url} target="_blank" rel="noreferrer" color="inherit" underline="hover">
      {item.book.title}
    </Link>
  )
}

function RowMenu({ item }: { item: YearBookItem }) {
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
        <MenuItem onClick={remove} sx={{ color: 'error.main' }}>Remove from list</MenuItem>
      </Menu>
    </>
  )
}

function Summary({ items }: { items: YearBookItem[] }) {
  const pages = sumPages(items)
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      <Chip label={`${items.length} books`} />
      <Chip label={`${pages.toLocaleString('en')} pages`} variant="outlined" />
      <Chip label={`${pagesPerMonth(pages)} pages / month`} variant="outlined" />
      <Box sx={{ flexBasis: { xs: '100%', sm: 'auto' }, flexGrow: 1 }} />
      {PEOPLE.map((p) => (
        <Chip key={p} size="small" label={PERSON_NAME[p]} sx={{ bgcolor: PERSON_COLOR[p], fontWeight: 600 }} />
      ))}
    </Stack>
  )
}

function useSortableProps(id: string) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
    position: 'relative' as const,
    opacity: isDragging ? 0.85 : 1
  }
  const handle = (
    <IconButton
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      size="small"
      aria-label="Drag to reorder"
      sx={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab', color: 'text.disabled' }}
    >
      <DragIndicator fontSize="small" />
    </IconButton>
  )
  return { setNodeRef, style, handle }
}

function tint(item: YearBookItem) {
  return item.proposedBy ? PERSON_COLOR[item.proposedBy] : 'background.paper'
}

function SortableCard({ item, index }: { item: YearBookItem; index: number }) {
  const { setNodeRef, style, handle } = useSortableProps(`m-${item.id}`)
  return (
    <Card ref={setNodeRef} style={style} sx={{ bgcolor: tint(item) }}>
      <CardContent sx={{ pb: '12px !important', pl: 1 }}>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start' }}>
          {handle}
          <Typography variant="body2" color="text.secondary" sx={{ pt: 0.6, minWidth: 22 }}>
            {index + 1}.
          </Typography>
          <Box sx={{ flex: 1, minWidth: 0, pt: 0.4 }}>
            <Typography sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              <Title item={item} />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {[item.book.author, item.book.pages ? `${item.book.pages} pages` : null].filter(Boolean).join(' · ')}
            </Typography>
          </Box>
          <RowMenu item={item} />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1.25, pl: 7 }}>
          {PEOPLE.map((person) => (
            <ReadToggle key={person} yearBookId={item.id} person={person} read={item.reads.includes(person)} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

function SortableRow({ item, index }: { item: YearBookItem; index: number }) {
  const { setNodeRef, style, handle } = useSortableProps(`d-${item.id}`)
  return (
    <TableRow ref={setNodeRef} style={style} sx={{ bgcolor: tint(item) }}>
      <TableCell sx={{ pr: 0 }}>{handle}</TableCell>
      <TableCell>{index + 1}</TableCell>
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
      <TableCell align="right"><RowMenu item={item} /></TableCell>
    </TableRow>
  )
}

export default function YearList({ year, items }: { year: number; items: YearBookItem[] }) {
  const [order, setOrder] = useState(items)
  const [, startTransition] = useTransition()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => setOrder(items), [items])

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const strip = (id: string | number) => String(id).slice(2)
    const from = order.findIndex((i) => i.id === strip(active.id))
    const to = order.findIndex((i) => i.id === strip(over.id))
    if (from < 0 || to < 0) return
    const next = arrayMove(order, from, to)
    setOrder(next)
    startTransition(async () => { await reorderList(year, next.map((i) => i.id)) })
  }

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
      <Summary items={order} />

      <DndContext id="year-list" sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'stretch' }}>
          <Box sx={{ display: 'flex', mt: { xs: 0, md: `${HEADER_HEIGHT + 1}px` } }}>
            <MonthRail year={year} />
          </Box>

          <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' }, flex: 1, minWidth: 0 }}>
            <SortableContext items={order.map((i) => `m-${i.id}`)} strategy={verticalListSortingStrategy}>
              {order.map((item, i) => <SortableCard key={item.id} item={item} index={i} />)}
            </SortableContext>
          </Stack>

          <Paper variant="outlined" sx={{ display: { xs: 'none', md: 'block' }, flex: 1, minWidth: 0 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ height: HEADER_HEIGHT }}>
                  <TableCell width={40} />
                  <TableCell width={40}>#</TableCell>
                  <TableCell>Title</TableCell>
                  {PEOPLE.map((p) => (
                    <TableCell key={p} align="center" width={64}>{PERSON_NAME[p]}</TableCell>
                  ))}
                  <TableCell align="right" width={90}>Pages</TableCell>
                  <TableCell width={56} />
                </TableRow>
              </TableHead>
              <TableBody>
                <SortableContext items={order.map((i) => `d-${i.id}`)} strategy={verticalListSortingStrategy}>
                  {order.map((item, i) => <SortableRow key={item.id} item={item} index={i} />)}
                </SortableContext>
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </DndContext>
    </>
  )
}
