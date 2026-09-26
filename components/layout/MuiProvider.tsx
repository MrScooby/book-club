'use client'

import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import EmotionRegistry from './EmotionRegistry'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5d4037' },
    secondary: { main: '#00796b' },
    background: { default: '#faf7f2', paper: '#ffffff' }
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: { defaultProps: { variant: 'outlined' } },
    MuiButton: { defaultProps: { disableElevation: true } }
  }
})

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </EmotionRegistry>
  )
}
