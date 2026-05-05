-- ==========================================
-- SCRIPT DE INICIALIZAÇÃO (SUPABASE)
-- Multi-Tenant SaaS: Agendamento Inteligente
-- ==========================================

-- Habilitar a extensão UUID (padrão no Supabase, mas por garantia)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA: empresas (Tenant Base)
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    documento VARCHAR(20) UNIQUE NOT NULL,
    email_contato VARCHAR(255),
    telefone_contato VARCHAR(20),
    endereco_completo TEXT,
    timezone_padrao VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    status VARCHAR(20) DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA: instancias_whatsapp (Roteamento Hookcloud)
CREATE TABLE instancias_whatsapp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    numero_telefone VARCHAR(20) UNIQUE NOT NULL,
    nome_instancia VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_instancias_num ON instancias_whatsapp(numero_telefone);

-- 3. TABELA: funcionarios (Recursos Agendáveis)
CREATE TABLE funcionarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Vínculo com a autenticação do Supabase
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    credenciais_google JSONB,
    credenciais_outlook JSONB,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_funcionarios_empresa ON funcionarios(empresa_id);

-- 4. TABELA: servicos (O que será agendado)
CREATE TABLE servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    duracao_minutos INTEGER NOT NULL DEFAULT 30,
    valor NUMERIC(10, 2),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_servicos_empresa ON servicos(empresa_id);

-- 5. TABELA: grade_horarios (Disponibilidade Base)
CREATE TABLE grade_horarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=Dom, 6=Sab
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_grade_horario_func ON grade_horarios(funcionario_id, dia_semana);

-- 6. TABELA: agendamentos (Eventos)
CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
    telefone_cliente VARCHAR(20) NOT NULL,
    nome_cliente VARCHAR(255),
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    id_evento_externo VARCHAR(255), -- ID do Google Calendar ou Outlook
    status VARCHAR(50) DEFAULT 'confirmado', -- confirmado, cancelado, reagendado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_agendamentos_intervalo ON agendamentos(funcionario_id, data_inicio, data_fim);
CREATE INDEX idx_agendamentos_empresa ON agendamentos(empresa_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) MULTI-TENANT
-- ==========================================

-- Ativar RLS nas Tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE instancias_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- 1. Políticas para 'empresas'
-- Assumimos que a propriedade no JWT (app_metadata ou user_metadata) carrega o ID do tenant
CREATE POLICY "Leitura de empresa para usuarios vinculados" ON empresas
FOR SELECT USING (
    id = (auth.jwt() -> 'app_metadata' ->> 'empresa_id')::uuid
    OR (auth.jwt() -> 'app_metadata' ->> 'is_superadmin')::boolean = true
);

-- 2. Políticas padronizadas Multi-tenant para tabelas filhas (Leitura/Escrita limitadas ao empresa_id)

-- Funcionarios
CREATE POLICY "Acesso tenant isolation funcionarios" ON funcionarios
FOR ALL USING (
    empresa_id = (auth.jwt() -> 'app_metadata' ->> 'empresa_id')::uuid
    OR (auth.jwt() -> 'app_metadata' ->> 'is_superadmin')::boolean = true
);

-- Servicos
CREATE POLICY "Acesso tenant isolation servicos" ON servicos
FOR ALL USING (
    empresa_id = (auth.jwt() -> 'app_metadata' ->> 'empresa_id')::uuid
    OR (auth.jwt() -> 'app_metadata' ->> 'is_superadmin')::boolean = true
);

-- Agendamentos
CREATE POLICY "Acesso tenant isolation agendamentos" ON agendamentos
FOR ALL USING (
    empresa_id = (auth.jwt() -> 'app_metadata' ->> 'empresa_id')::uuid
    OR (auth.jwt() -> 'app_metadata' ->> 'is_superadmin')::boolean = true
);

-- Instancias WhatsApp
CREATE POLICY "Acesso tenant isolation instancias_whatsapp" ON instancias_whatsapp
FOR ALL USING (
    empresa_id = (auth.jwt() -> 'app_metadata' ->> 'empresa_id')::uuid
    OR (auth.jwt() -> 'app_metadata' ->> 'is_superadmin')::boolean = true
);

-- Grade de Horários
-- Essa tabela não tem empresa_id direto, precisamos validar checando a tabela do funcionario dono da grade
CREATE POLICY "Acesso tenant isolation grade_horarios" ON grade_horarios
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM funcionarios f
        WHERE f.id = grade_horarios.funcionario_id
        AND (
            f.empresa_id = (auth.jwt() -> 'app_metadata' ->> 'empresa_id')::uuid
            OR (auth.jwt() -> 'app_metadata' ->> 'is_superadmin')::boolean = true
        )
    )
);
