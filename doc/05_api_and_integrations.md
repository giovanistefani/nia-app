# Contratos de Integração e Resiliência (APIs)

A estabilidade de um sistema SaaS B2B depende de como ele lida com a volatilidade de serviços externos. Esta seção aborda as estratégias "Production-grade" aplicadas.

## 1. Google Calendar / Outlook API

A integração de calendários exige autorização OAuth2. O painel Next.js fornecerá a tela de autorização (Consent Screen) para o funcionário/empresa.

*   **Armazenamento de Tokens:** O Refresh Token e o Access Token gerados pelo fluxo OAuth serão armazenados como JSONB criptografados (ou sob forte restrição RLS) na tabela `funcionarios`.
*   **Renovação de Tokens (Refresh):** O n8n, ao tentar buscar ou criar eventos, deve verificar se o erro retornado pela API do Google/Microsoft é `401 Unauthorized`. Em caso afirmativo, um sub-fluxo deve usar o Refresh Token para obter um novo Access Token, salvar via Supabase API, e tentar novamente.
*   **Paginação e Performance:** A busca de eventos deve ser estritamente limitada ao intervalo `timeMin` (hoje) e `timeMax` (+7 dias) com o parâmetro `singleEvents=true` no Google para não lidar com problemas de fuso horário complexos nem gastar processamento.

## 2. Integração WhatsApp via Hookcloud

A comunicação principal utiliza a API Oficial da Meta intermediada pelo Hookcloud.
*   **Atrasos Intencionais:** Para uma UX natural de chatbot, o n8n deve incluir pequenos nós de espera (ex: 1 segundo por palavra) entre o cálculo e o envio, acionando indicadores de digitação na API antes de enviar o texto definitivo.
*   **Buffer de Requisições:** O Hookcloud atua como muralha de resiliência. Ele recebe requisições em alta velocidade da Meta e as envia ao n8n em um ritmo aceitável. Se chegarem 1.000 mensagens simultâneas, o n8n estará protegido de *Out of Memory* ou *Rate Limits*.
*   **Exponencial Backoff:** Se o n8n ou o Supabase caírem (retornando erro 500), o Hookcloud aguardará (10s, 30s, 2m...) antes de tentar enviar o Webhook novamente. Nenhuma mensagem do cliente será perdida.

## 3. Google Gemini API

Para lidar com os rate-limits da API do Gemini:
*   A requisição no n8n será configurada para ter tratamento de erro `On Error: Retry On Fail`.
*   Intervalo de repetição: 3 segundos, máximo de 3 tentativas, lidando com erros HTTP 429.
