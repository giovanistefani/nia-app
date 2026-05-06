import { getEmpresas } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, Plus, Pencil } from 'lucide-react'

export default async function EmpresasPage() {
  const empresas = await getEmpresas()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-violet-500" />
            Empresas
          </h2>
          <p className="text-muted-foreground text-gray-400 mt-1">
            Gerencie os clientes (tenants) da plataforma.
          </p>
        </div>
        <Button asChild className="bg-violet-600 hover:bg-violet-500 text-white">
          <Link href="/dashboard/empresas/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Empresa
          </Link>
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Lista de Empresas</CardTitle>
          <CardDescription className="text-gray-400">
            Total de {empresas.length} empresas cadastradas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {empresas.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              Nenhuma empresa cadastrada.
            </div>
          ) : (
            <div className="rounded-md border border-gray-800">
              <Table>
                <TableHeader className="bg-gray-950">
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Razão Social</TableHead>
                    <TableHead className="text-gray-400">Documento</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Cadastro</TableHead>
                    <TableHead className="text-right text-gray-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresas.map((empresa) => (
                    <TableRow key={empresa.id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell className="font-medium text-white">{empresa.razao_social}</TableCell>
                      <TableCell className="text-gray-300">{empresa.documento}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          empresa.status === 'ativo' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {empresa.status.charAt(0).toUpperCase() + empresa.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(empresa.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild className="text-gray-400 hover:text-white hover:bg-gray-800">
                          <Link href={`/dashboard/empresas/${empresa.id}`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
