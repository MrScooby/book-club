import { Box, Typography } from '@mui/material'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function MonthRail({ year }: { year: number }) {
  const now = new Date()
  const current = now.getFullYear() === year ? now.getMonth() : -1

  return (
    <Box
      aria-hidden
      sx={{
        width: { xs: 28, md: 44 },
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 1.5,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      {MONTHS.map((label, i) => (
        <Box
          key={label}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: i < 11 ? 1 : 0,
            borderColor: 'divider',
            bgcolor: i === current ? 'secondary.main' : i % 2 ? 'action.hover' : 'transparent',
            color: i === current ? 'secondary.contrastText' : 'text.secondary'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: i === current ? 700 : 500,
              letterSpacing: 0.5,
              writingMode: { xs: 'vertical-rl', md: 'horizontal-tb' },
              transform: { xs: 'rotate(180deg)', md: 'none' }
            }}
          >
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
