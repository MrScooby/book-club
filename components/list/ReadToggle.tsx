'use client'

import { useOptimistic, useTransition } from 'react'
import { Button } from '@mui/material'
import { Check } from '@mui/icons-material'
import type { Person } from '@/lib/generated/prisma/enums'
import { PERSON_INITIAL, PERSON_NAME } from '@/lib/people'
import { toggleRead } from '@/lib/actions'

interface Props {
  yearBookId: string
  person: Person
  read: boolean
  size?: 'small' | 'large'
}

export default function ReadToggle({ yearBookId, person, read, size = 'large' }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(read)
  const [, startTransition] = useTransition()

  const onClick = () => {
    startTransition(async () => {
      setOptimistic(!optimistic)
      await toggleRead(yearBookId, person)
    })
  }

  const px = size === 'large' ? 36 : 30

  return (
    <Button
      onClick={onClick}
      variant={optimistic ? 'contained' : 'outlined'}
      color={optimistic ? 'secondary' : 'inherit'}
      aria-pressed={optimistic}
      aria-label={`${PERSON_NAME[person]} ${optimistic ? 'has read' : 'has not read'}`}
      sx={{
        minWidth: px,
        width: px,
        height: px,
        p: 0,
        fontWeight: 700,
        fontSize: size === 'large' ? 14 : 13,
        borderColor: optimistic ? undefined : 'divider',
        color: optimistic ? undefined : 'text.secondary'
      }}
    >
      {optimistic ? <Check fontSize="small" /> : PERSON_INITIAL[person]}
    </Button>
  )
}
