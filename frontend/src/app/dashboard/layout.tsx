import { getUserSession } from '@/lib/auth-utils'
import Link from 'next/link'
import { Building2, LayoutDashboard, Settings } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await getUserSession()
  const isSuperadmin = user?.app_metadata?.is_superadmin === true

  return (
    <div className="flex min-h-screen bg-gray-950 text-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="flex h-16 items-center border-b border-gray-800 px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-white">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm">
              N
            </div>
            Nia App
          </Link>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            Visão Geral
          </Link>
          
          {isSuperadmin && (
            <Link 
              href="/dashboard/empresas" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Building2 className="h-5 w-5" />
              Empresas
            </Link>
          )}

          <Link 
            href="/dashboard/configuracoes" 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors mt-auto"
          >
            <Settings className="h-5 w-5" />
            Configurações
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="flex h-16 items-center border-b border-gray-800 bg-gray-900/50 px-6 backdrop-blur-sm">
          <h1 className="font-semibold text-lg text-white">Painel de Controle</h1>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            {/* Futuro User Dropdown / Logout aqui */}
          </div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
