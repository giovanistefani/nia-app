
# Guia de Implementação e Deploy (VPS AlmaLinux 9)

Este guia consolida os passos necessários para pegar o código recém-construído (Frontend Next.js e N8N) e colocá-lo para rodar em produção no seu servidor.

## 1. Subindo o Frontend + Proxy (Caddy)

A nossa arquitetura agora tem um `Dockerfile` otimizado dentro da pasta `frontend/`, e o nosso arquivo raiz `docker-compose.yml` já está configurado para "costurar" o Frontend com o Caddy (servidor web e de SSL).

### Passo a passo para o Docker Compose

1. Acesse o diretório raiz do seu projeto no terminal da VPS:

    ```bash
    cd /home/giovani/git/nia-app
    ```

2. Garanta que o arquivo `frontend/.env.local` contenha as chaves do Supabase. O Docker usará este arquivo para "injetar" as credenciais na hora de fazer a *build* da imagem otimizada.
3. Inicie o processo de build e de subida dos containers:

    ```bash
    docker-compose up -d --build
    ```

4. O Docker vai baixar todas as dependências do Node, otimizar o Next.js e ligar o painel administrativo. O Caddy passará a responder pelo seu domínio (`nia-ai.com.br`) na porta 80/443 e redirecionar o tráfego para o painel em plano de fundo.

> [!NOTE]  
> Se houver algum erro de permissão por conta do SELinux no AlmaLinux (ao mapear os volumes do Caddy), lembre-se da nossa documentação do Caddy: adicione o sufixo `:z` nas montagens dos volumes no seu `docker-compose.yml` ou aplique o rótulo local na pasta com o `chcon`.

## 2. Configurando as Variáveis do N8N (Orquestração)

O arquivo de inteligência artificial (`doc/n8n_webhook_flow.json`) que nós criamos precisa ser importado e energizado.

1. Acesse o painel do seu n8n (que já está instalado nativamente na sua VPS).
2. Vá em **Workflows > Add Workflow > Import from File** e selecione o arquivo `n8n_webhook_flow.json`.
3. Preencha as suas chaves nas requisições:
    * **Gemini:** Clique no nó do Gemini 1.5 e substitua `SUA_CHAVE_GEMINI_AQUI` pela sua chave da API do Google AI Studio.
    * **HookCloud:** Clique no nó final "Resposta WhatsApp" e substitua `SEU_TOKEN_HOOKCLOUD` pelo seu Bearer Token.
    * **Supabase:** Vincule as credenciais de PostgreSQL no nó correspondente do Supabase usando a string de conexão nativa do banco de dados (que pode ser copiada na aba Settings > Database do painel do Supabase).
4. No canto superior direito da tela do n8n, **ative** o fluxo ("Active" / "Inactive").

## 3. Integrando o HookCloud (Ponto de Contato)

1. No fluxo ativado do n8n, clique duas vezes no nó **Webhook (HookCloud)**.
2. Copie a **Production URL** (geralmente começa com `https://seu-dominio/webhook/hookcloud-webhook`).
3. Acesse o painel web do **[HookCloud](https://hookcloud.app)**.
4. Vá na seção de Webhooks e adicione a URL que você copiou, marcando para enviar todos os eventos de mensagens recebidas.

## Resumo do Fluxo em Produção

* O cliente envia mensagem para o WhatsApp.
* A Meta entrega para o HookCloud.
* O HookCloud bate na porta do seu N8N (Webhook).
* O N8N identifica o cliente usando o Supabase, analisa a frase usando o Gemini e toma a decisão.
* Em paralelo, você acessa `nia-ai.com.br` pelo navegador, passa pelo proxy do Caddy, faz login com as credenciais seguras e vê os horários sendo agendados através do front-end em React/Next.js.
