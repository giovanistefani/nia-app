# Guia de Configuração do Servidor: AlmaLinux 9

Este documento detalha todos os passos necessários no nível do Sistema Operacional (AlmaLinux 9) para preparar a VPS, garantir a segurança e colocar a infraestrutura do projeto no ar.

## 1. Atualização do Sistema e Pacotes Básicos

Primeiro, garanta que o sistema base está atualizado e possui as ferramentas utilitárias (Git, curl, vim).

```bash
sudo dnf update -y
sudo dnf install -y git curl wget nano epel-release
```

## 2. Instalação do Docker e Docker Compose

Como estamos no AlmaLinux 9 (distribuição baseada no RHEL/CentOS), os repositórios oficiais do Docker devem ser adicionados antes da instalação.

```bash
# Instalar utilitários para gerenciar repositórios
sudo dnf install -y dnf-utils

# Adicionar repositório oficial do Docker
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Instalar Docker Engine, CLI e plugin do Compose
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Iniciar o serviço do Docker e habilitar para iniciar junto com o boot
sudo systemctl start docker
sudo systemctl enable docker
```

## 3. Configuração do Firewall (firewalld)

O AlmaLinux 9 utiliza o `firewalld` por padrão. Como usaremos o Caddy (Reverse Proxy) para gerenciar o tráfego HTTP e HTTPS de toda a nossa aplicação, precisamos abrir essas portas de forma definitiva.

```bash
# Habilitar portas para a internet
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Opcional: Se precisar de acesso a porta 5678 direta do n8n (recomenda-se usar pelo Caddy)
# sudo firewall-cmd --permanent --add-port=5678/tcp

# Aplicar as novas regras
sudo firewall-cmd --reload
```

## 4. Tratamento do SELinux (Importante)

O AlmaLinux vem com o **SELinux ativado em modo Enforcing**. Isso significa que o Docker pode ter permissão negada para ler ou escrever nas pastas locais que mapeamos como volumes (como o `./caddy/Caddyfile`).

Há duas formas de resolver:
**A.** Adicionar o sufixo `:z` ou `:Z` nas declarações de volume no `docker-compose.yml` (já recomendado). Exemplo: `./caddy/Caddyfile:/etc/caddy/Caddyfile:ro,Z`
**B.** Mudar o contexto da pasta local via terminal:
```bash
# Mudar o contexto do diretório inteiro do projeto para permitir acesso do container Docker
sudo chcon -Rt svirt_sandbox_file_t /caminho/do/seu/projeto/
```

## 5. Estrutura de Diretórios e Variáveis de Ambiente

Crie a pasta onde o projeto viverá, normalmente em `/opt`.

```bash
sudo mkdir -p /opt/nia-app
sudo chown -R $USER:$USER /opt/nia-app
cd /opt/nia-app

# (Aqui você fará o git clone do repositório)

# Criar arquivo .env
touch .env
```

**Conteúdo do `.env` sugerido:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-chave-anonima>
```

## 6. Integração do n8n Nativo com o Caddy (Docker)

Como o n8n já está rodando **nativamente** no sistema e o Caddy está rodando no **Docker**, para que o Caddy atue como proxy reverso para o painel Next.js e para o n8n usando o mesmo domínio ou subdomínio, você precisará configurar o arquivo `Caddyfile` para acessar o IP interno do host (`host.docker.internal` ou o IP de gateway do docker `172.17.0.1`).

**Exemplo base de `Caddyfile`:**
```caddyfile
# Painel Next.js (Admin)
admin.seusite.com {
    reverse_proxy nia_admin_panel:3000
}

# n8n Nativo
n8n.seusite.com {
    # 172.17.0.1 eh geralmente o IP do Host onde o n8n nativo esta rodando
    reverse_proxy 172.17.0.1:5678
}
```

## 7. Inicializando a Aplicação

Depois de tudo configurado, basta entrar na pasta e iniciar a infraestrutura:

```bash
docker compose up -d --build
```

Para monitorar se tudo subiu corretamente:
```bash
docker compose logs -f
```
