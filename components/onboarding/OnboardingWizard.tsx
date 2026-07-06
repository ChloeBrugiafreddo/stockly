'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  X, CheckCircle, Circle, ArrowRight,
  User, Truck, Package, Users, Sparkles
} from 'lucide-react'

interface Steps {
  profile: boolean
  supplier: boolean
  product: boolean
  customer: boolean
}

const stepConfig = [
  {
    key: 'profile',
    icon: User,
    title: 'Compte créé ✓',
    description: 'Votre compte et votre entreprise sont configurés.',
    action: null,
    actionLabel: null,
    color: '#16a34a',
  },
  {
    key: 'supplier',
    icon: Truck,
    title: 'Ajoutez votre premier fournisseur',
    description: 'D\'où viennent vos produits ? Enregistrez au moins un fournisseur pour tracer la provenance de votre stock.',
    action: '/suppliers',
    actionLabel: 'Ajouter un fournisseur',
    color: '#7c3aed',
  },
  {
    key: 'product',
    icon: Package,
    title: 'Ajoutez votre premier produit',
    description: 'Créez votre premier article en stock. Donnez-lui une référence, un nom et une quantité initiale.',
    action: '/stock',
    actionLabel: 'Ajouter un produit',
    color: '#1d4ed8',
  },
  {
    key: 'customer',
    icon: Users,
    title: 'Ajoutez votre premier client',
    description: 'Enregistrez un client pour pouvoir lui créer des devis et suivre son historique.',
    action: '/customers',
    actionLabel: 'Ajouter un client',
    color: '#d97706',
  },
]

export function OnboardingWizard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [steps, setSteps] = useState<Steps | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const domain = (session?.user as any)?.domain || ''
  const firstName = session?.user?.name?.split(' ')[0] || ''

  useEffect(() => {
    fetch('/api/onboarding')
      .then(r => r.json())
      .then(d => {
        if (d.showOnboarding) {
          setShow(true)
          setSteps(d.steps)
          // Trouve la première étape non complétée
          const stepKeys = ['profile', 'supplier', 'product', 'customer']
          const firstIncomplete = stepKeys.findIndex(k => !d.steps[k as keyof Steps])
          setActiveStep(firstIncomplete === -1 ? 3 : firstIncomplete)
        }
      })
  }, [])

  async function handleDismiss() {
    await fetch('/api/onboarding', { method: 'POST' })
    setDismissed(true)
    setTimeout(() => setShow(false), 300)
  }

  async function handleFinish() {
    await fetch('/api/onboarding', { method: 'POST' })
    setDismissed(true)
    setTimeout(() => setShow(false), 300)
  }

  function handleAction(path: string) {
    router.push(path)
    handleDismiss()
  }

  if (!show || dismissed) return null
  if (!steps) return null

  const allDone = Object.values(steps).every(Boolean)
  const completedCount = Object.values(steps).filter(Boolean).length

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      animation: dismissed ? 'fadeOut 0.3s ease' : 'fadeIn 0.3s ease',
    }}>
      <div style={{
        background: 'var(--background)', borderRadius: '20px',
        border: '1px solid var(--card-border)',
        width: '100%', maxWidth: '560px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
          padding: '28px 28px 24px',
          position: 'relative',
        }}>
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(255,255,255,0.2)', border: 'none',
              borderRadius: '8px', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white',
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles size={20} color="white" />
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
              Bienvenue sur Stockly
            </p>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>
            Bonjour {firstName} ! 👋
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>
            Votre espace {domain} est prêt. Suivez ces 4 étapes pour bien démarrer.
          </p>

          {/* Progress bar */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                {completedCount} / 4 étapes complétées
              </span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                {Math.round((completedCount / 4) * 100)}%
              </span>
            </div>
            <div style={{
              height: '6px', borderRadius: '3px',
              background: 'rgba(255,255,255,0.2)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                background: 'white',
                width: `${(completedCount / 4) * 100}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div style={{ padding: '20px 24px' }}>
          {stepConfig.map((step, i) => {
            const done = steps[step.key as keyof Steps]
            const active = activeStep === i
            const Icon = step.icon

            return (
              <div
                key={step.key}
                onClick={() => setActiveStep(i)}
                style={{
                  display: 'flex', gap: '14px',
                  padding: '14px', borderRadius: '12px',
                  marginBottom: '8px',
                  background: active ? 'var(--accent-light)' : 'transparent',
                  border: active ? '1px solid var(--card-border)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {/* Icône état */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: done ? '#f0fdf4' : active ? 'var(--accent-light)' : 'var(--card-bg)',
                  border: `1px solid ${done ? '#bbf7d0' : active ? 'var(--card-border)' : 'var(--card-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {done
                    ? <CheckCircle size={18} color="#16a34a" />
                    : <Icon size={18} color={active ? step.color : 'var(--muted)'} />
                  }
                </div>

                {/* Contenu */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <p style={{
                      fontSize: '14px', fontWeight: 600,
                      color: done ? '#16a34a' : 'var(--foreground)',
                    }}>
                      {step.title}
                    </p>
                    {done && (
                      <span style={{
                        fontSize: '11px', background: '#f0fdf4', color: '#16a34a',
                        padding: '1px 8px', borderRadius: '10px', fontWeight: 600,
                      }}>
                        Fait ✓
                      </span>
                    )}
                  </div>
                  {active && !done && (
                    <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Numéro étape */}
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                  background: done ? '#16a34a' : active ? step.color : 'var(--card-bg)',
                  border: `1px solid ${done ? '#16a34a' : active ? step.color : 'var(--card-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                  color: done || active ? 'white' : 'var(--muted)',
                }}>
                  {i + 1}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer actions */}
        <div style={{
          padding: '16px 24px 24px',
          borderTop: '1px solid var(--card-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <button
            onClick={handleDismiss}
            style={{
              padding: '9px 16px', borderRadius: '10px',
              border: '1px solid var(--card-border)',
              background: 'transparent', color: 'var(--muted)',
              fontSize: '13px', cursor: 'pointer',
            }}
          >
            Passer pour l'instant
          </button>

          {allDone ? (
            <button
              onClick={handleFinish}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
                color: 'white', border: 'none',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Sparkles size={16} />
              Commencer !
            </button>
          ) : (
            stepConfig[activeStep]?.action && !steps[stepConfig[activeStep].key as keyof Steps] ? (
              <button
                onClick={() => handleAction(stepConfig[activeStep].action!)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '10px',
                  background: stepConfig[activeStep].color,
                  color: 'white', border: 'none',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {stepConfig[activeStep].actionLabel}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setActiveStep(prev => Math.min(prev + 1, 3))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '10px',
                  background: '#3b82f6', color: 'white', border: 'none',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Suivant
                <ArrowRight size={16} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}