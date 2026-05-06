'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Sector {
  _id: string
  name: string
  description: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [sectors, setSectors] = useState<Sector[]>([])
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    sectorId: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Charger les secteurs disponibles
  useEffect(() => {
    fetch('/api/sectors')
      .then((r) => r.json())
      .then((data) => setSectors(data.sectors || []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (form.password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        sectorId: form.sectorId,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erreur lors de la création du compte')
      setLoading(false)
      return
    }

    // Compte créé → redirection vers login
    router.push('/login?registered=true')
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Stockly</h1>
        <p className="text-gray-500 mt-1">Créez votre espace de gestion</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom & Prénom */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              required
              value={form.firstname}
              onChange={(e) => setForm({ ...form, firstname: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              required
              value={form.lastname}
              onChange={(e) => setForm({ ...form, lastname: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="vous@exemple.com"
          />
        </div>

        {/* Entreprise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de votre entreprise
          </label>
          <input
            type="text"
            required
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ex: Aurora Racing"
          />
        </div>

        {/* Secteur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Votre domaine métier
          </label>
          <select
            required
            value={form.sectorId}
            onChange={(e) => setForm({ ...form, sectorId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionnez votre domaine</option>
            {sectors.map((sector) => (
              <option key={sector._id} value={sector._id}>
                {sector.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Cela personnalisera votre interface et vos champs de stock
          </p>
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="8 caractères minimum"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            required
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Création en cours...' : 'Créer mon compte'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}