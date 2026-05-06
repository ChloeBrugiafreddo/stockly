import { auth } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        Bonjour {(session?.user as any)?.name} 👋
      </h1>
      <p className="text-gray-500 mt-1">
        Bienvenue sur Stockly
      </p>
    </div>
  )
}