'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { DomainThemeProvider } from './DomainThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <DomainThemeProvider>
          {children}
        </DomainThemeProvider>
      </NextThemesProvider>
    </SessionProvider>
  )
}