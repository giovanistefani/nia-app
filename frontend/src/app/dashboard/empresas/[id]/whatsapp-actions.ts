'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperadmin } from '@/lib/auth-utils'
import { z } from 'zod'

const instanciaSchema = z.object({
  numero_telefone: z
    .string()
    .min(10, 'Informe um número com DDD e código do país (ex: 5548988253605).')
    .regex(/^\d+$/, 'Apenas números são permitidos (sem +, espaços ou traços).'),
  nome_instancia: z.string().min(2, 'O nome da instância deve ter pelo menos 2 caracteres.'),
})

export async function getInstanciasWhatsapp(empresaId: string) {
  await requireSuperadmin()
  const supabaseAdmin = createAdminClient()

  const { data, error } = await supabaseAdmin
    .from('instancias_whatsapp')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Erro ao buscar instâncias WhatsApp:', error)
    return []
  }

  return data
}

export async function addInstanciaWhatsapp(empresaId: string, formData: FormData) {
  await requireSuperadmin()
  const supabaseAdmin = createAdminClient()

  const raw = {
    numero_telefone: formData.get('numero_telefone') as string,
    nome_instancia: formData.get('nome_instancia') as string,
  }

  const parsed = instanciaSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { error } = await supabaseAdmin.from('instancias_whatsapp').insert([
    {
      empresa_id: empresaId,
      numero_telefone: parsed.data.numero_telefone,
      nome_instancia: parsed.data.nome_instancia,
    },
  ])

  if (error) {
    console.error('Erro ao adicionar instância WhatsApp:', error)
    if (error.code === '23505') {
      return { error: 'Este número já está cadastrado em outra empresa.' }
    }
    return { error: 'Erro ao salvar o número de WhatsApp.' }
  }

  revalidatePath(`/dashboard/empresas/${empresaId}`)
  return { success: true }
}

export async function removeInstanciaWhatsapp(instanciaId: string, empresaId: string) {
  await requireSuperadmin()
  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('instancias_whatsapp')
    .delete()
    .eq('id', instanciaId)

  if (error) {
    console.error('Erro ao remover instância WhatsApp:', error)
    return { error: 'Erro ao remover o número de WhatsApp.' }
  }

  revalidatePath(`/dashboard/empresas/${empresaId}`)
  return { success: true }
}
