# Especificação Funcional: Agente de Agendamento Inteligente (Multi-tenant)

## 1. Introdução

Este documento descreve a arquitetura e o funcionamento de um agente de agendamento automatizado via WhatsApp. O sistema utiliza Inteligência Artificial (Gemini) e orquestração (n8n) para gerir marcações, possuindo um backend robusto (Supabase) atuando como fonte principal da verdade, com sincronização para calendários de mercado (Google e Outlook). O sistema é multi-tenant (SaaS), permitindo que uma mesma aplicação atenda várias empresas simultaneamente.

## 2. Stack Tecnológica

*   **Interface de Comunicação e Mensageria:** WhatsApp (via Hookcloud conectado à API Oficial da Meta).
*   **Gerenciamento de Eventos:** O próprio Hookcloud garante a entrega, atuando como gateway, buffer e engine de retentativa para os eventos recebidos.
*   **Orquestrador de Fluxo:** n8n.
*   **Inteligência Artificial:** Google Gemini (Focado em Extração de JSON / Structured Output).
*   **Backend & Banco de Dados:** Supabase (PostgreSQL com Auth e RLS).
*   **Sincronização:** Google Calendar API / Outlook Calendar API.

## 3. Perfis de Acesso e Segurança (RBAC)

O sistema utiliza Row Level Security (RLS) do Supabase para garantir isolamento de dados:

*   **Superadmin:** Acesso irrestrito a todas as tabelas. Responsável por cadastrar novas empresas (tenants), gerenciar status financeiro e configurações globais.
*   **Admin da Empresa (Tenant):** Acesso restrito aos dados da própria empresa (`empresa_id`). Responsável por gerenciar seus funcionários, serviços, grade de horários e integrações de calendário.

## 4. Arquitetura de Dados (Modelo Supabase)

Para garantir o funcionamento multi-tenant e o controle completo da agenda local, as seguintes tabelas compõem o núcleo do banco de dados:

### Tabela: `empresas` (Dados do Inquilino/Tenant)
*   `id`: uuid (Primary Key)
*   `razao_social`: text
*   `nome_fantasia`: text
*   `documento`: text (CNPJ/CPF)
*   `email_contato`: text
*   `telefone_contato`: text
*   `endereco_completo`: text
*   `timezone_padrao`: text (Ex: America/Sao_Paulo)
*   `status`: text (ativo, inadimplente, cancelado)
*   `data_criacao`: timestamp

### Tabela: `instancias_whatsapp`
Faz o roteamento inicial. Quando uma mensagem chega, o n8n consulta qual empresa é a dona do número.
*   `id`: uuid
*   `empresa_id`: uuid (Foreign Key)
*   `numero_telefone`: text (Número do bot da empresa)

### Tabela: `funcionarios`
*   `id`: uuid
*   `empresa_id`: uuid (Foreign Key)
*   `nome`: text
*   `email`: text
*   `credenciais_google`: jsonb (Armazena os tokens de integração do calendário)
*   `credenciais_outlook`: jsonb

### Tabela: `servicos`
*   `id`: uuid
*   `empresa_id`: uuid (Foreign Key)
*   `nome`: text (Ex: "Corte de Cabelo", "Consulta Nutricional")
*   `duracao_minutos`: int (Ex: 45)
*   `valor`: numeric (opcional)

### Tabela: `grade_horarios` (Agenda Local / Expediente)
Define as regras de disponibilidade do profissional antes dos agendamentos.
*   `id`: uuid
*   `funcionario_id`: uuid (Foreign Key)
*   `dia_semana`: int (0 = Domingo, 6 = Sábado)
*   `hora_inicio`: time
*   `hora_fim`: time

### Tabela: `agendamentos` (Agenda Oficial)
*   `id`: uuid
*   `empresa_id`: uuid (Foreign Key)
*   `funcionario_id`: uuid (Foreign Key)
*   `servico_id`: uuid (Foreign Key)
*   `telefone_cliente`: text
*   `data_inicio`: timestamp
*   `data_fim`: timestamp
*   `id_evento_externo`: text (ID retornado pelo Google/Outlook para sincronização)
*   `status`: text (pendente, confirmado, cancelado)

## 5. Fluxo de Processo no n8n (Foco na Economia de Tokens)

A orquestração foca em reduzir o custo do LLM e aumentar a velocidade da resposta. O fluxo é composto por 4 etapas lógicas:

### Etapa 1: Ingestão e Roteamento
*   O Hookcloud recebe o evento de mensagem do WhatsApp.
*   O n8n captura o `numero_telefone` de destino e consulta a tabela `instancias_whatsapp` para descobrir o `empresa_id`.
*   O histórico curto da conversa é recuperado (apenas as últimas 3 a 5 mensagens).

### Etapa 2: Extração de Intenção (Gemini via JSON)
*   O n8n envia a mensagem mais recente e o histórico curto para o Gemini.
*   **Economia de Tokens:** Em vez de pedir ao Gemini para analisar regras matemáticas ou formatar uma mensagem longa de texto, o Prompt instrui o modelo a atuar como um **extrator de dados**, retornando apenas um objeto JSON com a intenção do cliente, o serviço citado e a preferência de data/hora.
    *   *Exemplo:* `{"intencao": "agendamento", "servico": "corte", "preferencia_data": "amanhã de manhã"}`

### Etapa 3: Cruzamento de Agendas e Lógica (Sem Inteligência Artificial)
*   Com o serviço e a data desejada identificados, o n8n consulta o Supabase para verificar a `grade_horarios` do profissional para aquele `empresa_id`.
*   O n8n consulta os bloqueios: busca os eventos já existentes na tabela local de `agendamentos` e, simultaneamente, os eventos do calendário externo (Google/Outlook) do funcionário.
*   O n8n executa uma função nativa (JavaScript / SQL) que cruza os horários livres locais, respeita os bloqueios externos e filtra apenas os blocos onde a duração do serviço cabe.

### Etapa 4: Resposta e Confirmação (Sincronização Dupla)
*   **Apresentação:** O n8n formata o texto localmente listando os horários disponíveis (ex: "Temos 14h, 15h e 16h, qual prefere?") e envia via Hookcloud. **Sem passar novamente pelo Gemini**.
*   **Confirmação:** Após o cliente escolher, o n8n insere o registro na tabela `agendamentos`.
*   **Sincronização Externa:** O n8n dispara uma chamada para criar o evento no Google/Outlook Calendar, salva o ID do evento externo na tabela de agendamentos e envia a confirmação final ao usuário.

## 6. Registro de Decisões do Brainstorming (Decision Log)

*   **Decisão 1 - Escopo do Backend:** Adotado backend em Supabase próprio, para garantir que informações completas de funcionários, serviços e expedientes (`grade_horarios`) existam localmente e não dependam apenas do Google Calendar.
*   **Decisão 2 - Sincronização de Calendários:** O sistema consultará tanto a agenda local quanto o Google/Outlook na busca de disponibilidade. Tudo o que for agendado no backend próprio será replicado (via n8n) para os calendários externos.
*   **Decisão 3 - Economia de Tokens:** A IA (Gemini) será restrita ao papel de classificador de intenções e extrator de variáveis (Retornando JSON). O cálculo de matriz de horários e a redação da mensagem de opções serão feitos pelo n8n via código clássico.
*   **Decisão 4 - Multi-tenant e Permissões:** O banco de dados foi completamente modelado para suportar várias empresas/clínicas (SaaS). Utiliza a chave `empresa_id` associada às instâncias de WhatsApp e aos perfis de Autenticação (RLS) separando Superusuário de Usuários da Empresa.
