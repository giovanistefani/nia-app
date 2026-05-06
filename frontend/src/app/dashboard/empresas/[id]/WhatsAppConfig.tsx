'use client'

import { useState } from 'react'
import { addInstanciaWhatsapp, removeInstanciaWhatsapp } from './whatsapp-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MessageSquare, Trash2, Plus, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Instancia = {
  id: string
  nome_instancia: string
  numero_telefone: string
  created_at: string
}

type Props = {
  empresaId: string
  instancias: Instancia[]
}

export function WhatsAppConfig({ empresaId, instancias }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function handleAdd(formData: FormData) {
    setIsPending(true)
    setError(null)
    const result = await addInstanciaWhatsapp(empresaId, formData)
    if (result?.error) {
      setError(result.error)
    } else {
      // Limpa o formulário via refresh do servidor
      const form = document.getElementById('whatsapp-form') as HTMLFormElement
      form?.reset()
      router.refresh()
    }
    setIsPending(false)
  }

  async function handleRemove(instanciaId: string) {
    setRemovingId(instanciaId)
    await removeInstanciaWhatsapp(instanciaId, empresaId)
    router.refresh()
    setRemovingId(null)
  }

  return (
    <Card className="bg-gray-900 border-gray-800 text-slate-50 mt-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-green-500" />
          Instâncias WhatsApp
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure os números de WhatsApp que o agente Nia irá utilizar para esta empresa.
          O número deve estar no formato internacional sem símbolos (ex: <span className="text-violet-400 font-mono">5548988253605</span>).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Lista de instâncias existentes */}
        {instancias.length === 0 ? (
          <div className="flex items-center gap-3 text-sm text-gray-500 border border-dashed border-gray-700 rounded-lg px-4 py-3">
            <MessageSquare className="h-4 w-4 shrink-0" />
            Nenhum número configurado ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {instancias.map((inst) => (
              <div
                key={inst.id}
                className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950/60 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">{inst.nome_instancia}</p>
                    <p className="text-xs text-gray-400 font-mono">+{inst.numero_telefone}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={removingId === inst.id}
                  onClick={() => handleRemove(inst.id)}
                  className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remover</span>
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Separador */}
        <div className="border-t border-gray-800" />

        {/* Formulário para adicionar nova instância */}
        <form id="whatsapp-form" action={handleAdd} className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Adicionar novo número</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_instancia" className="text-gray-300 text-sm">Nome da Instância</Label>
              <Input
                id="nome_instancia"
                name="nome_instancia"
                placeholder="ex: Principal, Recepção, Vendas"
                required
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-violet-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero_telefone" className="text-gray-300 text-sm">Número (somente dígitos)</Label>
              <Input
                id="numero_telefone"
                name="numero_telefone"
                placeholder="ex: 5548988253605"
                required
                inputMode="numeric"
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus-visible:ring-violet-500 font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm font-medium text-red-500 bg-red-500/10 py-2 px-4 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-green-700 hover:bg-green-600 text-white disabled:opacity-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isPending ? 'Salvando...' : 'Adicionar Número'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
