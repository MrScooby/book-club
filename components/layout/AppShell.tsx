'use client'

import { AppBar, Toolbar, Typography, Box, Button, Container, Paper, BottomNavigation, BottomNavigationAction, Select, MenuItem } from '@mui/material'
import { AutoStories, Lightbulb, BarChart } from '@mui/icons-material'
import { usePathname, useRouter } from 'next/navigation'
import { currentYear } from '@/lib/years'

const NAV = [
  { key: 'list', label: 'List', icon: <AutoStories /> },
  { key: 'suggestions', label: 'Suggestions', icon: <Lightbulb /> },
  { key: 'stats', label: 'Stats', icon: <BarChart /> }
] as const

type NavKey = (typeof NAV)[number]['key']

function hrefFor(key: NavKey, year: number) {
  if (key === 'stats') return '/stats'
  if (key === 'suggestions') return `/${year}/suggestions`
  return `/${year}`
}

export default function AppShell({ years, children }: { years: number[]; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [first, second] = pathname.split('/').filter(Boolean)
  const year = Number(first) || currentYear()
  const active: NavKey = first === 'stats' ? 'stats' : second === 'suggestions' ? 'suggestions' : 'list'
  const showYear = active !== 'stats'

  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 700, color: 'primary.main', mr: { md: 2 } }}>
            Book Club
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flex: 1 }}>
            {NAV.map((item) => (
              <Button
                key={item.key}
                startIcon={item.icon}
                variant={active === item.key ? 'contained' : 'text'}
                onClick={() => router.push(hrefFor(item.key, year))}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          <Box sx={{ flex: { xs: 1, md: 0 } }} />
          {showYear && (
            <Select
              size="small"
              value={years.includes(year) ? year : ''}
              onChange={(e) => router.push(hrefFor(active, Number(e.target.value)))}
              sx={{ minWidth: 96, fontWeight: 600 }}
              aria-label="Year"
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 }, pb: { xs: 'calc(88px + env(safe-area-inset-bottom))', md: 4 } }}>
        {children}
      </Container>

      <Paper
        elevation={3}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: { xs: 'block', md: 'none' }, pb: 'env(safe-area-inset-bottom)', zIndex: 1100 }}
      >
        <BottomNavigation
          showLabels
          value={active}
          onChange={(_, value: NavKey) => router.push(hrefFor(value, year))}
          sx={{ height: 64 }}
        >
          {NAV.map((item) => (
            <BottomNavigationAction key={item.key} value={item.key} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      </Paper>
    </>
  )
}
