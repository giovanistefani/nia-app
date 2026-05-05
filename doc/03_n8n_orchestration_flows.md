# Orquestração de Fluxos no n8n

O n8n atua como o "cérebro lógico" (Controller) da aplicação. A arquitetura dos fluxos foi desenhada para separar claramente processamento semântico (IA) de cálculos matemáticos determinísticos (disponibilidade de agenda).

## 1. Fluxo de Ingestão e Roteamento (Main Webhook)

1.  **Webhook Trigger:** Escuta requisições POST do Hookcloud.
2.  **IF Node (Sanitização):** Ignora mensagens de status (delivery/read) e foca apenas em mensagens do tipo `text` e `audio` (com nó de transcrição prévio, se necessário).
3.  **Supabase Node (Roteamento):** 
    *   Entrada: `{{ $json.body.data.remoteJid }}` (Telefone do bot).
    *   Ação: SELECT `empresa_id` em `instancias_whatsapp`.
    *   Retorno: A identidade da empresa.

## 2. O Processador Semântico (Gemini Structured Extraction)

O custo principal em agentes de IA é o envio repetido de contextos enormes (ex: a agenda inteira de uma semana de 5 médicos). Nossa abordagem elimina isso.

*   **Node HTTP Request / Gemini:** 
*   **Model:** `gemini-1.5-flash`
*   **System Prompt:**
    ```text
    Você é um classificador avançado de intenções de clientes.
    Analise a mensagem e extraia APENAS um JSON estrito.
    Não adicione saudações ou textos adicionais.
    {
      "intencao": "ENUM: agendar, cancelar, tirar_duvida, listar_servicos",
      "servico_mencionado": "string | null",
      "data_preferencial_iso": "string (se mencionada) | null",
      "periodo": "ENUM: manha, tarde, noite | null"
    }
    ```
*   **Vantagem:** Retorna um objeto limpo usando frações de centavos.

## 3. Lógica de Agendamento (Algoritmo Determinístico)

Se a intenção for `agendar`, o n8n entra em modo de processamento (Node de Código / Function Node).

1.  **Busca de Limites:** n8n busca a `grade_horarios` do serviço/funcionário solicitado via Supabase Node.
2.  **Busca de Ocupados:** Consulta eventos no Google Calendar (usando os tokens da tabela `funcionarios`) e os eventos da tabela local `agendamentos` no período de 7 dias à frente.
3.  **Cross-reference (JavaScript Node):**
    ```javascript
    // Pseudo-código do Node
    const expedientes = items[0].json.grade;
    const ocupados = items[1].json.ocupados;
    const duracao_servico = items[0].json.servico.duracao_minutos;

    const slots_livres = calcularSlots(expedientes, ocupados, duracao_servico);
    
    return { slots_formatados: formatarParaTexto(slots_livres.slice(0, 5)) };
    ```
4.  **Envio ao Usuário:** Node do Hookcloud envia a resposta: *"Tenho estes horários amanhã: 1) 09:00 2) 10:30..."*. Sem chamar o Gemini novamente.

## 4. Confirmação e Integração
Quando o cliente responde "1", o fluxo de ingestão detecta a resposta referenciando o contexto anterior, e o n8n executa dois sub-nós em paralelo:
- **Supabase Insert:** Grava na tabela `agendamentos`.
- **Google/Outlook API:** Dispara requisição REST para inserir no calendário externo, salvando o `id_evento_externo` retornado no banco de dados.
