'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, X, Keyboard } from 'lucide-react'

interface Props {
  onScan: (code: string) => void
}

export function BarcodeScanner({ onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [showManual, setShowManual] = useState(false)
  const controlsRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)

  function stopScan() {
    // Arrête les controls zxing
    if (controlsRef.current) {
      try { controlsRef.current.stop() } catch (e) {}
      controlsRef.current = null
    }
    // Arrête le flux caméra
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    // Vide la vidéo
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }

 async function startScan() {
    setError('')
    setScanning(true)

    try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')

        const reader = new BrowserMultiFormatReader(undefined, {
        delayBetweenScanAttempts: 100,
        })

        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        if (!devices.length) throw new Error('Aucune caméra détectée')

        // Préfère caméra arrière sur mobile
        const device = devices.find(d =>
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('rear') ||
        d.label.toLowerCase().includes('environment')
        ) || devices[devices.length - 1]

        const constraints: MediaStreamConstraints = {
        video: {
            deviceId: device.deviceId,
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
        }
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream

        if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        }

        const controls = await reader.decodeFromStream(
        stream,
        videoRef.current!,
        (result, err) => {
            if (result) {
            const code = result.getText()
            console.log('✅ Code détecté :', code)
            stopScan()
            onScan(code)
            }
        }
        )

        controlsRef.current = controls

    } catch (e: any) {
        console.error('Erreur scanner :', e)
        setError(e.message || 'Erreur caméra — essayez la saisie manuelle')
        setScanning(false)
    }
    }

  useEffect(() => {
    return () => { stopScan() }
  }, [])

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (manualCode.trim()) onScan(manualCode.trim())
  }

  return (
    <div>
      {/* Boutons modes */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={scanning ? stopScan : startScan}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '14px', borderRadius: '12px',
            background: scanning ? '#fef2f2' : 'var(--domain-primary)',
            color: scanning ? '#dc2626' : 'white',
            border: scanning ? '1px solid #fecaca' : 'none',
            fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {scanning ? <><X size={18} /> Arrêter</> : <><Camera size={18} /> Activer la caméra</>}
        </button>
        <button
          onClick={() => setShowManual(!showManual)}
          style={{
            padding: '14px 16px', borderRadius: '12px',
            border: '1px solid var(--card-border)',
            background: showManual ? 'var(--card-bg)' : 'transparent',
            color: 'var(--muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '14px',
          }}
        >
          <Keyboard size={16} />
          Manuel
        </button>
      </div>

      {/* Vidéo caméra */}
      <div style={{
        position: 'relative', borderRadius: '16px', overflow: 'hidden',
        background: '#000', marginBottom: '16px',
        border: scanning ? '2px solid var(--domain-primary)' : '2px solid transparent',
        display: scanning ? 'block' : 'none',
        transition: 'border-color 0.3s',
      }}>
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: '100%', display: 'block', maxHeight: '320px', objectFit: 'cover' }}
        />
        {/* Viseur */}
        {scanning && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              width: '240px', height: '150px',
              border: '2px solid rgba(255,255,255,0.6)',
              borderRadius: '12px',
              boxShadow: '0 0 0 2000px rgba(0,0,0,0.35)',
              position: 'relative',
            }}>
              {/* Coins colorés */}
              {[
                { top: -2, left: -2, borderTop: '4px solid var(--domain-primary)', borderLeft: '4px solid var(--domain-primary)', borderRadius: '4px 0 0 0' },
                { top: -2, right: -2, borderTop: '4px solid var(--domain-primary)', borderRight: '4px solid var(--domain-primary)', borderRadius: '0 4px 0 0' },
                { bottom: -2, left: -2, borderBottom: '4px solid var(--domain-primary)', borderLeft: '4px solid var(--domain-primary)', borderRadius: '0 0 0 4px' },
                { bottom: -2, right: -2, borderBottom: '4px solid var(--domain-primary)', borderRight: '4px solid var(--domain-primary)', borderRadius: '0 0 4px 0' },
              ].map((corner, i) => (
                <div key={i} style={{ position: 'absolute', width: '22px', height: '22px', ...corner }} />
              ))}

              {/* Ligne de scan animée */}
              <div style={{
                position: 'absolute', left: '8px', right: '8px', height: '2px',
                background: 'var(--domain-primary)',
                animation: 'scanLine 2s ease-in-out infinite',
                boxShadow: '0 0 8px var(--domain-primary)',
              }} />
            </div>
          </div>
        )}
        <p style={{
          position: 'absolute', bottom: '10px', left: 0, right: 0,
          textAlign: 'center', color: 'white', fontSize: '12px',
          fontWeight: 500, textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        }}>
          Placez le code-barres dans le cadre
        </p>
      </div>

      {/* Saisie manuelle */}
      {showManual && (
        <form onSubmit={handleManualSubmit} style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px', fontWeight: 500 }}>
            Saisie manuelle du code
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="SKU ou code-barres..."
              autoFocus
              style={{
                flex: 1, padding: '11px 14px', borderRadius: '10px',
                border: '1.5px solid var(--card-border)',
                background: 'var(--card-bg)', color: 'var(--foreground)',
                fontSize: '14px', outline: 'none',
              }}
            />
            <button type="submit" style={{
              padding: '11px 20px', borderRadius: '10px',
              background: 'var(--domain-primary)', color: 'white',
              border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}>
              Valider
            </button>
          </div>
        </form>
      )}

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px',
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#dc2626', fontSize: '13px', fontWeight: 500,
          marginBottom: '16px',
        }}>
          ⚠️ {error}
          <button onClick={() => { setError(''); setShowManual(true) }} style={{
            marginLeft: '8px', background: 'none', border: 'none',
            color: '#dc2626', textDecoration: 'underline', cursor: 'pointer',
            fontSize: '13px',
          }}>
            Saisir manuellement
          </button>
        </div>
      )}

      {!scanning && !showManual && !error && (
        <div style={{
          padding: '40px 32px', borderRadius: '16px', textAlign: 'center',
          background: 'var(--card-bg)', border: '2px dashed var(--card-border)',
        }}>
          <div style={{ fontSize: '52px', marginBottom: '14px' }}>📷</div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '6px' }}>
            Prêt à scanner
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
            Activez la caméra ou utilisez la saisie manuelle.<br />
            Fonctionne avec tous les codes-barres et QR codes.
          </p>
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          0% { top: 8px; }
          50% { top: calc(100% - 10px); }
          100% { top: 8px; }
        }
      `}</style>
    </div>
  )
}