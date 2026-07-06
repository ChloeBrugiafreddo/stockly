'use client'

import { useEffect, useState } from 'react'

export function AlertBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch('/api/alerts')
      .then(r => r.json())
      .then(d => setCount(d.count || 0))
  }, [])

  if (!count) return null

  return (
    <div style={{
      minWidth: '18px', height: '18px',
      borderRadius: '9px',
      background: '#dc2626',
      color: 'white',
      fontSize: '11px',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 4px',
      marginLeft: 'auto',
    }}>
      {count > 9 ? '9+' : count}
    </div>
  )
}