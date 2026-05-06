'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createEmpresa, updateEmpresa } from './actions'
import { useRouter } from 'next/navigation'

type EmpresaFormProps = {
  initialData?: any
}

export function EmpresaForm({ initialData }: EmpresaFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    
    let result;
    if (initialData?.id) {
      result = await updateEmpresa(initialData.id, formData)
    } else {
      result = await createEmpresa(formData)
    }

    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800 text-slate-50">
      <CardHeader>
        <CardTitle className="text-white">{initialData ? 'Editar Empresa' : 'Cadastrar Empresa'}</CardTitle>
        <CardDescription className="text-gray-400">
          Preencha os dados abaixo para {initialData ? 'atualizar' : 'registrar'} o cliente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="razao_social" className="text-gray-300">Razão Social *</Label>
              <Input 
                id="razao_social" 
                name="razao_social" 
                defaultValue={initialData?.razao_social || ''}
                required
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-violet-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nome_fantasia" className="text-gray-300">Nome Fantasia</Label>
              <Input 
                id="nome_fantasia" 
                name="nome_fantasia" 
                defaultValue={initialData?.nome_fantasia || ''}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-violet-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documento" className="text-gray-300">Documento (CNPJ/CPF) *</Label>
              <Input 
                id="documento" 
                name="documento" 
                defaultValue={initialData?.documento || ''}
                required
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-violet-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email_contato" className="text-gray-300">Email de Contato</Label>
              <Input 
                id="email_contato" 
                name="email_contato" 
                type="email"
                defaultValue={initialData?.email_contato || ''}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone_contato" className="text-gray-300">Telefone de Contato</Label>
              <Input 
                id="telefone_contato" 
                name="telefone_contato" 
                defaultValue={initialData?.telefone_contato || ''}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco_completo" className="text-gray-300">Endereço Completo</Label>
              <Input 
                id="endereco_completo" 
                name="endereco_completo" 
                defaultValue={initialData?.endereco_completo || ''}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-violet-500"
              />
            </div>

            {initialData && (
              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-300">Status</Label>
                <select 
                  id="status" 
                  name="status"
                  defaultValue={initialData.status}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            )}
          </div>

          {!initialData && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-white border-b border-gray-800 pb-2 mb-4">
                Usuário Administrador da Empresa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="admin_email" className="text-gray-300">Email de Acesso *</Label>
                  <Input 
                    id="admin_email" 
                    name="admin_email" 
                    type="email"
                    required
                    className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_password" className="text-gray-300">Senha Inicial *</Label>
                  <Input 
                    id="admin_password" 
                    name="admin_password" 
                    type="password"
                    required
                    minLength={6}
                    className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-violet-500"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="admin_nome" className="text-gray-300">Nome do Administrador *</Label>
                  <Input 
                    id="admin_nome" 
                    name="admin_nome" 
                    type="text"
                    required
                    className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-violet-500"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm font-medium text-red-500 bg-red-500/10 py-3 px-4 rounded-md mt-6">
              {error}
            </div>
          )}

          <div className="flex gap-4 justify-end border-t border-gray-800 pt-6 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard/empresas')}
              className="border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50"
            >
              {isPending ? 'Salvando...' : 'Salvar Empresa'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
