# Esquema de Banco de Dados e Row Level Security (RLS)

A estrutura de dados foi normalizada (3NF) e otimizada para consultas concorrentes de matrizes de horários. Todo o isolamento multi-tenant baseia-se na coluna `empresa_id` associada às políticas RLS do Supabase.

## 1. DDL (Data Definition Language) Base

### `empresas`
Tabela âncora do sistema SaaS.
```sql
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    documento VARCHAR(20) UNIQUE NOT NULL, -- CNPJ/CPF
    email_contato VARCHAR(255),
    telefone_contato VARCHAR(20),
    endereco_completo TEXT,
    timezone_padrao VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    status VARCHAR(20) DEFAULT 'ativo', -- ativo, inativo, inadimplente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `instancias_whatsapp`
Faz o roteamento. É através desta tabela que identificamos de qual tenant a mensagem está vindo.
```sql
CREATE TABLE instancias_whatsapp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    numero_telefone VARCHAR(20) UNIQUE NOT NULL,
    nome_instancia VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_instancias_num ON instancias_whatsapp(numero_telefone);
```

### Outras Tabelas Core
*   **`funcionarios`**: `id`, `empresa_id`, `nome`, `email`, `credenciais_google` (JSONB), `credenciais_outlook` (JSONB).
*   **`servicos`**: `id`, `empresa_id`, `nome`, `duracao_minutos` (INT), `valor` (NUMERIC).
*   **`grade_horarios`**: `id`, `funcionario_id`, `dia_semana` (0-6), `hora_inicio` (TIME), `hora_fim` (TIME).
*   **`agendamentos`**: `id`, `empresa_id`, `funcionario_id`, `servico_id`, `telefone_cliente`, `data_inicio` (TIMESTAMPTZ), `data_fim` (TIMESTAMPTZ), `id_evento_externo`, `status`.

## 2. Row Level Security (RLS) Policies

Para garantir segurança "production-grade", o acesso via API para a aplicação Frontend (Next.js) é blindado por RLS.
O Supabase injeta o `jwt()` que contém os metadados do usuário autenticado.

Assumindo que no registro do usuário via Supabase Admin API injetamos `app_metadata->>'empresa_id'`:

```sql
-- Ativando RLS nas tabelas
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Política: Usuário só pode LER funcionários da própria empresa
CREATE POLICY "Leitura restrita por Tenant" ON funcionarios
FOR SELECT USING (
    empresa_id = (auth.jwt() -> 'app_metadata' ->> 'empresa_id')::uuid
);

-- Política: Usuário só pode INSERIR agendamentos para sua empresa
CREATE POLICY "Escrita restrita por Tenant" ON agendamentos
FOR INSERT WITH CHECK (
    empresa_id = (auth.jwt() -> 'app_metadata' ->> 'empresa_id')::uuid
);
```

Para o Superusuário (Role administrativa de gestão do SaaS), políticas separadas baseadas na claim `is_superadmin = true` devem ser criadas na tabela `empresas`.

## 3. Índices de Performance

O cálculo de agendas cruza `agendamentos` com intervalos de data. Índices vitais:
```sql
CREATE INDEX idx_agendamentos_intervalo ON agendamentos (funcionario_id, data_inicio, data_fim);
CREATE INDEX idx_grade_horario_func ON grade_horarios(funcionario_id, dia_semana);
```
