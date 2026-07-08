'use client'

import { useRouter } from 'next/navigation'

interface Props {
  result: {
    productName: string
    sku: string
    quantity: number
    isNew: boolean
  }
  onNew: () => void
}

export function ScanSuccess({ result, onNew }: Props) {
  const router = useRouter()

  return (
    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
      {/* Animation succès */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: '#f0fdf4', border: '3px solid #16a34a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', fontSize: '36px',
        animation: 'pop 0.4s ease',
      }}>
        ✅
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
        Réception confirmée !
      </h2>

      <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6 }}>
        {result.isNew ? '✨ Nouveau produit créé et ' : ''}
        <strong style={{ color: 'var(--foreground)' }}>{result.quantity} unité{result.quantity > 1 ? 's' : ''}</strong>
        {' '}ajoutée{result.quantity > 1 ? 's' : ''} au stock pour<br />
        <strong style={{ color: 'var(--foreground)' }}>{result.productName}</strong>
      </p>

      {/* Détails */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: '14px', padding: '20px', marginBottom: '28px',
        textAlign: 'left',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Produit</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{result.productName}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>SKU</span>
          <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--foreground)' }}>{result.sku}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--card-border)' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Quantité ajoutée</span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>+{result.quantity}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onNew} style={{
          flex: 1, padding: '13px',
          borderRadius: '12px',
          background: 'var(--domain-primary)', color: 'white',
          border: 'none', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
        }}>
          📷 Scanner un autre
        </button>
        <button onClick={() => router.push('/stock')} style={{
          flex: 1, padding: '13px',
          borderRadius: '12px',
          border: '1px solid var(--card-border)',
          background: 'var(--card-bg)', color: 'var(--foreground)',
          fontSize: '15px', fontWeight: 500, cursor: 'pointer',
        }}>
          Voir le stock →
        </button>
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}