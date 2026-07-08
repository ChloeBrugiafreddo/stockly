'use client'

import { useState } from 'react'
import { BarcodeScanner } from './BarcodeScanner'
import { ReceptionForm } from './ReceptionForm'
import { ScanSuccess } from './ScanSuccess'

export type ScanStep = 'scan' | 'reception' | 'success'

export function ScannerClient() {
  const [step, setStep] = useState<ScanStep>('scan')
  const [scannedCode, setScannedCode] = useState('')
  const [product, setProduct] = useState<any>(null)
  const [result, setResult] = useState<any>(null)

  async function handleScan(code: string) {
    setScannedCode(code)
    // Cherche le produit par SKU
    const r = await fetch(`/api/scan/lookup?code=${encodeURIComponent(code)}`)
    const j = await r.json()
    setProduct(j.product || null)
    setStep('reception')
  }

  function handleSuccess(data: any) {
    setResult(data)
    setStep('success')
  }

  function handleReset() {
    setStep('scan')
    setScannedCode('')
    setProduct(null)
    setResult(null)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '4px' }}>
          📦 Scanner un colis
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
          Scannez le code-barres ou QR code du colis reçu
        </p>
      </div>

      {/* Étapes */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '32px' }}>
        {[
          { id: 'scan', label: '1. Scanner', icon: '📷' },
          { id: 'reception', label: '2. Réception', icon: '📋' },
          { id: 'success', label: '3. Confirmé', icon: '✅' },
        ].map((s, i) => {
          const steps = ['scan', 'reception', 'success']
          const currentIndex = steps.indexOf(step)
          const stepIndex = steps.indexOf(s.id)
          const done = stepIndex < currentIndex
          const active = stepIndex === currentIndex

          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: done ? '#16a34a' : active ? 'var(--domain-primary)' : 'var(--card-bg)',
                  border: `2px solid ${done ? '#16a34a' : active ? 'var(--domain-primary)' : 'var(--card-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 6px', fontSize: '18px',
                  transition: 'all 0.3s',
                }}>
                  {done ? '✓' : s.icon}
                </div>
                <p style={{ fontSize: '11px', fontWeight: active ? 700 : 400, color: active ? 'var(--domain-primary)' : 'var(--muted)' }}>
                  {s.label}
                </p>
              </div>
              {i < 2 && (
                <div style={{
                  height: '2px', width: '40px', flexShrink: 0, marginBottom: '20px',
                  background: stepIndex < currentIndex ? '#16a34a' : 'var(--card-border)',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {step === 'scan'      && <BarcodeScanner onScan={handleScan} />}
      {step === 'reception' && <ReceptionForm code={scannedCode} product={product} onSuccess={handleSuccess} onRescan={handleReset} />}
      {step === 'success'   && <ScanSuccess result={result} onNew={handleReset} />}
    </div>
  )
}