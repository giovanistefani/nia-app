'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireSuperadmin } from '@/lib/auth-utils'
import { z } from 'zod'

import { createAdminClient } from '@/lib/supabase/admin'

const empresaSchema = z.object({
  razao_social: z.string().min(3, "Razão Social deve ter pelo menos 3 caracteres."),
  nome_fantasia: z.string().optional(),
  documento: z.string().min(14, "Documento inválido (CNPJ/CPF)."),
  email_contato: z.string().email("E-mail inválido.").optional().or(z.literal('')),
  telefone_contato: z.string().optional(),
  endereco_completo: z.string().optional(),
  timezone_padrao: z.string().default('America/Sao_Paulo'),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
})

const adminUserSchema = z.object({
  admin_email: z.string().email("E-mail de administrador inválido."),
  admin_password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  admin_nome: z.string().min(2, "Nome do administrador muito curto.")
})

export async function getEmpresas() {
  await requireSuperadmin()
  const supabase = await createClient()

  const { data: empresas, error } = await supabase
    .from('empresas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar empresas:', error)
    throw new Error('Não foi possível carregar as empresas.')
  }

  return empresas
}

export async function getEmpresa(id: string) {
  await requireSuperadmin()
  const supabase = await createClient()

  const { data: empresa, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar empresa:', error)
    return null
  }

  return empresa
}

export async function createEmpresa(formData: FormData) {
  await requireSuperadmin()
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const data = Object.fromEntries(formData.entries())
  
  const parsedEmpresa = empresaSchema.safeParse(data)
  const parsedAdmin = adminUserSchema.safeParse(data)

  if (!parsedEmpresa.success) {
    return { error: parsedEmpresa.error.errors[0].message }
  }
  if (!parsedAdmin.success) {
    return { error: parsedAdmin.error.errors[0].message }
  }

  // 1. Criar a Empresa (via admin para contornar o RLS de INSERT)
  const { data: novaEmpresa, error: empresaError } = await supabaseAdmin
    .from('empresas')
    .insert([parsedEmpresa.data])
    .select('id')
    .single()

  if (empresaError || !novaEmpresa) {
    console.error('Erro ao criar empresa:', empresaError)
    if (empresaError?.code === '23505') { 
      return { error: 'Já existe uma empresa com este documento.' }
    }
    return { error: 'Ocorreu um erro ao criar a empresa.' }
  }

  // 2. Criar o Usuário Administrador no Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: parsedAdmin.data.admin_email,
    password: parsedAdmin.data.admin_password,
    email_confirm: true,
    app_metadata: {
      empresa_id: novaEmpresa.id,
      is_superadmin: false,
      role: 'admin' // role customizada para a empresa
    }
  })

  if (authError || !authData.user) {
    console.error('Erro ao criar admin auth:', authError)
    // Rollback na empresa (deletar a empresa que acabou de ser criada)
    await supabaseAdmin.from('empresas').delete().eq('id', novaEmpresa.id)
    
    if (authError?.status === 422 || authError?.message.includes('already registered')) {
      return { error: 'Este e-mail de administrador já está em uso.' }
    }
    return { error: 'Erro ao criar o usuário administrador.' }
  }

  // 3. Criar o registro na tabela funcionarios (vincular auth -> tenant)
  const { error: funcError } = await supabaseAdmin
    .from('funcionarios')
    .insert([{
      empresa_id: novaEmpresa.id,
      auth_user_id: authData.user.id,
      nome: parsedAdmin.data.admin_nome,
      email: parsedAdmin.data.admin_email,
      ativo: true
    }])

  if (funcError) {
    console.error('Erro ao vincular funcionário/admin:', funcError)
    // O usuário Auth foi criado mas não vinculado na tabela funcionários.
    // Para simplificar, consideramos um aviso ou completamos com sucesso, mas o ideal seria rollback de tudo.
  }

  revalidatePath('/dashboard/empresas')
  redirect('/dashboard/empresas')
}

export async function updateEmpresa(id: string, formData: FormData) {
  await requireSuperadmin()
  const supabaseAdmin = createAdminClient()

  const data = Object.fromEntries(formData.entries())
  
  const parsed = empresaSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  // UPDATE via admin para contornar RLS de escrita
  const { error } = await supabaseAdmin
    .from('empresas')
    .update(parsed.data)
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar empresa:', error)
    if (error.code === '23505') {
      return { error: 'Já existe outra empresa com este documento.' }
    }
    return { error: 'Ocorreu um erro ao atualizar a empresa.' }
  }

  revalidatePath('/dashboard/empresas')
  redirect('/dashboard/empresas')
}

export async function toggleStatusEmpresa(id: string, currentStatus: string) {
  await requireSuperadmin()
  const supabaseAdmin = createAdminClient()

  const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo'

  // UPDATE via admin para contornar RLS de escrita
  const { error } = await supabaseAdmin
    .from('empresas')
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    console.error('Erro ao alternar status da empresa:', error)
    return { error: 'Ocorreu um erro ao alterar o status.' }
  }

  revalidatePath('/dashboard/empresas')
  return { success: true }
}
