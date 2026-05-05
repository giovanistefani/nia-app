# Infraestrutura de Deploy (Docker)

O projeto foi projetado para rodar de forma otimizada em ambientes com restrições de hardware (ex: VPS de 2 vCores e 4GB de RAM). A premissa central é retirar o banco de dados da VPS e utilizar serviços gerenciados para evitar esgotamento de memória (OOM).

## 1. Topologia do Servidor

A VPS de 4GB será o *Worker Node* e *Frontend Node* da aplicação.

*   **Supabase (Externo):** Todo o tráfego de banco de dados, RLS e autenticação fica a cargo da infraestrutura gerenciada do Supabase Cloud (ou equivalente em outro provedor PaaS). 
*   **n8n (Orquestrador):** Já instalado e configurado nativamente no servidor. Operará os fluxos e receberá as cargas repassadas pelo HookCloud.
*   **Reverse Proxy (Caddy):** Escolhemos o Caddy (via Docker) por sua eficiência em memória (geralmente < 50MB) e provisão automática de certificados SSL (Let's Encrypt) para o Painel.
*   **Next.js (Admin Panel):** Contêiner Node.js restrito a `1GB` de RAM.

## 2. Configurações de Segurança e Memória

A configuração no `docker-compose.yml` utiliza `deploy.resources` para blindar a VPS.

*   Se o Painel Web (Next.js) sofrer vazamento de memória, o Docker o reiniciará isoladamente (recurso `restart: unless-stopped`), sem derrubar o n8n que roda nativamente.
*   **Redes Internas:** O acesso ao container do Next.js ocorre estritamente de forma isolada (`public_web`), sendo exposto para a internet unicamente através do Caddy (Portas 80 e 443).

## 3. Gestão de Logs e Monitoramento

*   Os logs dos contêineres Docker estão configurados com rotação (`max-size: "10m"`, `max-file: "3"`) para evitar que logs infinitos de requisições web saturem o disco SSD (storage) da VPS.

## 4. Hookcloud Firewall (Recomendação)

Como o n8n expõe Webhooks, é uma boa prática configurar o Firewall (iptables / ufw) ou as regras de proxy reverso (Caddyfile) para aceitar chamadas na rota do webhook **apenas dos IPs oficiais do Hookcloud**, bloqueando robôs maliciosos que varrem a internet de consumirem CPU do n8n com requisições falsas.
