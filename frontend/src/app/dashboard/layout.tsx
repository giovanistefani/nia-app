export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
        <h1 className="font-semibold text-lg">Nia SaaS Admin</h1>
        {/* Futura Sidebar / Navigation Menu aqui */}
      </header>
      <main className="flex-1 p-6 bg-muted/10">
        {children}
      </main>
    </div>
  )
}
