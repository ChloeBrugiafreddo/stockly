'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Result {
  type: string
  icon: string
  label: string
  sub: string
  href: string
  id: string
}

const typeLabels: Record<string, string> = {
  product:    'Produit',
  customer:   'Client',
  supplier:   'Fournisseur',
  production: 'Production',
  invoice:    'Devis',
}

export function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
        setResults([])
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Ferme si clic dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounce recherche
  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const j = await r.json()
      setResults(j.results || [])
      setLoading(false)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  function handleSelect(result: Result) {
    router.push(result.href)
    setOpen(false)
    setQuery('')
    setResults([])
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selected >= 0) {
      handleSelect(results[selected])
    }
  }

  // Groupe par type
  const grouped = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = []
    acc[result.type].push(result)
    return acc
  }, {} as Record<string, Result[]>)

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
      {/* Input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 14px', borderRadius: '10px',
        border: `1px solid ${open ? 'var(--domain-primary)' : 'var(--card-border)'}`,
        background: 'var(--card-bg)',
        transition: 'border-color 0.15s',
        cursor: 'text',
      }}
        onClick={() => { inputRef.current?.focus(); setOpen(true) }}
      >
        <Search size={15} color="var(--muted)" style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setSelected(-1) }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher…"
          style={{
            flex: 1, border: 'none', outline: 'none',
            background: 'transparent', color: 'var(--foreground)',
            fontSize: '14px',
          }}
        />
        {query ? (
          <button onClick={() => { setQuery(''); setResults([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0 }}>
            <X size={14} />
          </button>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--muted)', background: 'var(--card-border)', padding: '2px 6px', borderRadius: '5px', whiteSpace: 'nowrap' }}>
            ⌘K
          </span>
        )}
      </div>

      {/* Dropdown résultats */}
      {open && (query.length >= 2) && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          marginTop: '6px', borderRadius: '12px',
          background: 'var(--background)', border: '1px solid var(--card-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 200, overflow: 'hidden',
          maxHeight: '420px', overflowY: 'auto',
        }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              Recherche…
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              Aucun résultat pour "{query}"
            </div>
          ) : (
            Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <p style={{ padding: '10px 14px 4px', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {typeLabels[type] || type}
                </p>
                {items.map((result, i) => {
                  const globalIndex = results.indexOf(result)
                  const isSelected = globalIndex === selected
                  return (
                    <div
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 14px', cursor: 'pointer',
                        background: isSelected ? 'var(--domain-primary-light)' : 'transparent',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--card-bg)'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = isSelected ? 'var(--domain-primary-light)' : 'transparent'}
                    >
                      <span style={{ fontSize: '18px', flexShrink: 0 }}>{result.icon}</span>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {result.label}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{result.sub}</p>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', flexShrink: 0 }}>→</span>
                    </div>
                  )
                })}
              </div>
            ))
          )}

          {results.length > 0 && (
            <div style={{ padding: '8px 14px', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>↑↓ naviguer · Entrée sélectionner</span>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{results.length} résultat{results.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}