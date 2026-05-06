import { EmpresaForm } from '../EmpresaForm'
import { Building2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NovaEmpresaPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="text-gray-400 hover:text-white hover:bg-gray-800">
          <Link href="/dashboard/empresas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-white">
            <Building2 className="h-6 w-6 text-violet-500" />
            Nova Empresa
          </h2>
        </div>
      </div>
      
      <EmpresaForm />
    </div>
  )
}
