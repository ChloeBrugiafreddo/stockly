'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LogoProps {
  variant?: 'full' | 'icon'
  height?: number
}

export function Logo({ variant = 'full', height = 36 }: LogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div style={{ height, width: variant === 'icon' ? height : 120 }} />

  const isDark = resolvedTheme === 'dark'

  if (variant === 'icon') {
    return (
      <Image
        src="/SmallLogo.png"
        alt="Stockly"
        height={height}
        width={height}
        style={{ objectFit: 'contain' }}
        priority
      />
    )
  }

  return (
    <Image
      src={isDark ? '/Logo-fondsombre.png' : '/Logo-fondclair.png'}
      alt="Stockly"
      height={height}
      width={height * 3.5}
      style={{ objectFit: 'contain' }}
      priority
    />
  )
}