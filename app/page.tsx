'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, inView }
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [dark, setDark] = useState(false) // clair par défaut
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('landing-theme')
    if (saved) setDark(saved === 'dark')
  }, [])

  useEffect(() => {
    localStorage.setItem('landing-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const d = dark
  const c = {
    bg:        d ? '#0a0f1e' : '#ffffff',
    bgAlt:     d ? '#0f1629' : '#f4f6fb',
    card:      d ? '#131d35' : '#ffffff',
    border:    d ? '#1e2d4a' : '#dde3f0',
    text:      d ? '#f0f4ff' : '#0d1117',
    muted:     d ? '#7b8db0' : '#4a5568',
    subtle:    d ? '#3d4f6e' : '#8a97b0',
    navBg:     d ? 'rgba(10,15,30,0.95)' : 'rgba(255,255,255,0.97)',
    accent:    '#1d4ed8',
    accentSoft:d ? 'rgba(29,78,216,0.15)' : 'rgba(29,78,216,0.08)',
    accentBord:d ? 'rgba(29,78,216,0.3)' : 'rgba(29,78,216,0.2)',
    hr:        d ? '#1a2540' : '#e2e8f5',
  }

  const sectors = [
    {
      icon: '🚗', name: 'Automobile', color: '#1d4ed8',
      bg: d ? 'rgba(29,78,216,0.08)' : '#f0f4ff',
      border: d ? 'rgba(29,78,216,0.2)' : '#c7d7f9',
      features: ['Gestion des pièces détachées', 'Suivi véhicules en atelier', 'Traçabilité par référence OEM', 'Alertes seuil critique'],
    },
    {
      icon: '👗', name: 'Textile', color: '#6d28d9',
      bg: d ? 'rgba(109,40,217,0.08)' : '#f5f0ff',
      border: d ? 'rgba(109,40,217,0.2)' : '#d4c4f9',
      features: ['Gestion des matières premières', 'Collections & modèles', 'Suivi taille & coloris', 'Productions non facturées'],
    },
    {
      icon: '🍳', name: 'Alimentaire', color: '#047857',
      bg: d ? 'rgba(4,120,87,0.08)' : '#f0fdf8',
      border: d ? 'rgba(4,120,87,0.2)' : '#a7f3d0',
      features: ['Inventaire équipements', 'Traçabilité DLC & lots', 'Gestion des fournisseurs', 'Alertes expiration'],
    },
  ]

  const features = [
    { icon: '📦', title: 'Stock temps réel', desc: 'Alertes automatiques, filtres par état et catégorie, seuils personnalisés.' },
    { icon: '🔩', title: 'Productions', desc: 'Assemblez vos produits finis. Traçabilité complète pièce par pièce.' },
    { icon: '📋', title: 'Devis', desc: 'Liés à vos productions. HT/TVA/TTC, export PDF professionnel.' },
    { icon: '👥', title: 'Multi-utilisateurs', desc: 'Rôles Admin, Manager, Employé. Accès granulaire par module.' },
    { icon: '📊', title: 'KPI & Rapports', desc: 'Valeur du stock, CA, marges. Export PDF complet en un clic.' },
    { icon: '🔔', title: 'Alertes intelligentes', desc: 'Notifications par secteur. Ruptures, devis en retard, véhicules en attente.' },
  ]

  return (
    <div style={{ background: c.bg, minHeight: '100vh', color: c.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', transition: 'background 0.25s, color 0.25s' }}>
      <style>{`* { margin:0; padding:0; box-sizing:border-box; } html { scroll-behavior:smooth; }`}</style>

      {/* ── NAV ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 56px', height: '68px',
        position: 'sticky', top: 0, zIndex: 100,
        background: c.navBg, backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${scrolled ? c.border : 'transparent'}`,
        transition: 'border-color 0.3s',
        boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image src="/SmallLogo.png" alt="Stockly" width={30} height={30} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: '20px', fontWeight: 800, color: c.text, letterSpacing: '-0.5px' }}>Stockly</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setDark(!dark)} style={{
            width: '38px', height: '38px', borderRadius: '8px',
            border: `1px solid ${c.border}`, background: c.card,
            cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>
            {dark ? '☀️' : '🌙'}
          </button>
          <Link href="/login" style={{
            padding: '9px 20px', borderRadius: '8px',
            border: `1px solid ${c.border}`,
            color: c.text, textDecoration: 'none',
            fontSize: '14px', fontWeight: 600,
            background: c.card,
          }}>
            Connexion
          </Link>
          <Link href="/register" style={{
            padding: '9px 22px', borderRadius: '8px',
            background: c.accent, color: 'white',
            textDecoration: 'none', fontSize: '14px', fontWeight: 700,
            boxShadow: '0 2px 10px rgba(29,78,216,0.25)',
          }}>
            Essai gratuit
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 32px 88px', textAlign: 'center' }}>
        <FadeIn>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '6px 16px', borderRadius: '20px',
            background: c.accentSoft, border: `1px solid ${c.accentBord}`,
            fontSize: '13px', color: c.accent, fontWeight: 700,
            marginBottom: '36px', letterSpacing: '0.2px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.accent, display: 'inline-block' }} />
            ERP multi-domaines · Nouvelle génération
          </div>
        </FadeIn>

        <FadeIn delay={80}>
          <h1 style={{
            fontSize: '60px', fontWeight: 900, lineHeight: 1.08,
            letterSpacing: '-2.5px', marginBottom: '24px', color: c.text,
          }}>
            Gérez votre stock<br />
            <span style={{ color: c.accent }}>comme un professionnel</span>
          </h1>
        </FadeIn>

        <FadeIn delay={160}>
          <p style={{
            fontSize: '19px', color: c.muted, lineHeight: 1.75,
            maxWidth: '540px', margin: '0 auto 48px', fontWeight: 400,
          }}>
            Stockly s'adapte à votre secteur métier dès la connexion.
            Traçabilité complète, devis liés aux productions, alertes intelligentes.
          </p>
        </FadeIn>

        <FadeIn delay={240}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
            <Link href="/register" style={{
              padding: '14px 36px', borderRadius: '10px',
              background: c.accent, color: 'white',
              textDecoration: 'none', fontSize: '16px', fontWeight: 700,
              boxShadow: '0 4px 18px rgba(29,78,216,0.28)',
              letterSpacing: '-0.2px',
            }}>
              Commencer gratuitement →
            </Link>
            <Link href="/login" style={{
              padding: '14px 30px', borderRadius: '10px',
              border: `2px solid ${c.border}`,
              color: c.text, textDecoration: 'none',
              fontSize: '16px', fontWeight: 600,
              background: c.card,
            }}>
              Se connecter
            </Link>
          </div>
          <p style={{ fontSize: '13px', color: c.subtle }}>
            Aucune carte bancaire · Données isolées · Interface adaptée à votre métier
          </p>
        </FadeIn>
      </section>

      {/* ── SECTEURS ── */}
      <section style={{ background: c.bgAlt, borderTop: `1px solid ${c.hr}`, borderBottom: `1px solid ${c.hr}`, padding: '80px 32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <FadeIn>
            <p style={{ textAlign: 'center', fontSize: '11px', color: c.subtle, fontWeight: 700, letterSpacing: '3px', marginBottom: '52px', textTransform: 'uppercase' }}>
              Adapté à votre secteur dès la connexion
            </p>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {sectors.map((s, i) => (
              <FadeIn key={s.name} delay={i * 80}>
                <div style={{
                  padding: '32px 26px', borderRadius: '16px',
                  background: s.bg, border: `1px solid ${s.border}`,
                  height: '100%', transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                  }}
                >
                  <span style={{ fontSize: '32px', display: 'block', marginBottom: '14px' }}>{s.icon}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: c.text, marginBottom: '18px', letterSpacing: '-0.3px' }}>{s.name}</h3>
                  <ul style={{ listStyle: 'none' }}>
                    {s.features.map(f => (
                      <li key={f} style={{ fontSize: '14px', color: c.muted, marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'flex-start', lineHeight: 1.4 }}>
                        <span style={{ color: s.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '80px 32px', background: c.bg }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <FadeIn>
            <p style={{ textAlign: 'center', fontSize: '11px', color: c.subtle, fontWeight: 700, letterSpacing: '3px', marginBottom: '12px', textTransform: 'uppercase' }}>
              Fonctionnalités
            </p>
            <h2 style={{ textAlign: 'center', fontSize: '38px', fontWeight: 800, color: c.text, letterSpacing: '-1.5px', marginBottom: '56px' }}>
              Un seul outil, tout ce qu'il faut
            </h2>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 60}>
                <div style={{
                  padding: '26px', borderRadius: '14px',
                  background: c.card, border: `1px solid ${c.border}`,
                  height: '100%', transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = c.accentBord
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = c.border
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                  }}
                >
                  <span style={{ fontSize: '26px', display: 'block', marginBottom: '12px' }}>{f.icon}</span>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: c.text, marginBottom: '8px', letterSpacing: '-0.2px' }}>{f.title}</h3>
                  <p style={{ fontSize: '13px', color: c.muted, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: c.bgAlt, borderTop: `1px solid ${c.hr}`, borderBottom: `1px solid ${c.hr}`, padding: '72px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', textAlign: 'center' }}>
            {[
              { value: '3', label: 'Secteurs préconfigurés' },
              { value: '15+', label: 'Modules intégrés' },
              { value: '100%', label: 'Données isolées' },
              { value: '∞', label: 'Personnalisation' },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={i * 70}>
                <div style={{
                  padding: '32px 16px',
                  borderRight: i < 3 ? `1px solid ${c.hr}` : 'none',
                }}>
                  <p style={{ fontSize: '48px', fontWeight: 900, color: c.accent, lineHeight: 1, marginBottom: '10px', letterSpacing: '-2px' }}>{s.value}</p>
                  <p style={{ fontSize: '14px', color: c.muted, fontWeight: 500 }}>{s.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '90px 32px', background: c.bg, textAlign: 'center' }}>
        <FadeIn>
          <div style={{
            maxWidth: '580px', margin: '0 auto',
            padding: '56px 48px', borderRadius: '20px',
            background: c.bgAlt,
            border: `1px solid ${c.border}`,
            boxShadow: d ? 'none' : '0 4px 40px rgba(29,78,216,0.06)',
          }}>
            <h2 style={{ fontSize: '38px', fontWeight: 900, color: c.text, marginBottom: '16px', letterSpacing: '-1.5px' }}>
              Prêt à vous lancer ?
            </h2>
            <p style={{ fontSize: '16px', color: c.muted, marginBottom: '36px', lineHeight: 1.7 }}>
              Créez votre espace en 2 minutes. Choisissez votre secteur, configurez vos produits et commencez à tracer.
            </p>
            <Link href="/register" style={{
              display: 'inline-block',
              padding: '14px 44px', borderRadius: '10px',
              background: c.accent, color: 'white',
              textDecoration: 'none', fontSize: '16px', fontWeight: 700,
              boxShadow: '0 4px 18px rgba(29,78,216,0.28)',
            }}>
              Commencer gratuitement →
            </Link>
            <p style={{ marginTop: '18px', fontSize: '13px', color: c.subtle }}>
              Aucune carte bancaire requise
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: `1px solid ${c.hr}`, background: c.bgAlt,
        padding: '24px 56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Image src="/SmallLogo.png" alt="Stockly" width={20} height={20} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: '14px', color: c.muted, fontWeight: 700 }}>Stockly</span>
          <span style={{ fontSize: '13px', color: c.subtle }}>— ERP multi-domaines</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: '13px', color: c.subtle, textDecoration: 'none', fontWeight: 500 }}>Connexion</Link>
          <Link href="/register" style={{ fontSize: '13px', color: c.subtle, textDecoration: 'none', fontWeight: 500 }}>Inscription</Link>
          <span style={{ fontSize: '13px', color: c.subtle }}>© {new Date().getFullYear()} ESTIAM E4</span>
        </div>
      </footer>
    </div>
  )
}