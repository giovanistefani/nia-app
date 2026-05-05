# Guia de Configuração de Domínio e SSL (nia-ai.com.br)

Este guia prático explica o passo a passo para apontar o seu domínio oficial (`nia-ai.com.br`) para o servidor e configurar o proxy reverso (Caddy) para rotear o tráfego e gerar os certificados de segurança (HTTPS) de forma automática.

## 1. Apontamento de DNS (No seu Provedor)

Acesse o painel onde você comprou o seu domínio (Registro.br, Cloudflare, HostGator, Locaweb, etc.) e vá até a seção de **Zona de DNS**.

Você precisará criar os seguintes registros (Records) do tipo **A**, apontando para o Endereço IP Público da sua VPS (onde o AlmaLinux está instalado).

| Tipo | Nome (Host) | Destino / Valor | Para que serve? |
| :--- | :--- | :--- | :--- |
| **A** | `@` (ou vazio) | `IP_DA_SUA_VPS` | Site principal (ex: `nia-ai.com.br`) |
| **A** | `www` | `IP_DA_SUA_VPS` | Redirecionamento com www |
| **A** | `admin` ou `app` | `IP_DA_SUA_VPS` | Painel de controle SaaS (Next.js) |
| **A** | `n8n` | `IP_DA_SUA_VPS` | Acesso ao painel e webhooks do n8n |

### 1.1 Recomendação Especial para Cloudflare

Recomendamos **fortemente** o uso do **Cloudflare** para gerenciar a sua Zona DNS, devido à alta velocidade de propagação e segurança nativa que ele oferece. No entanto, é necessário um ajuste crítico:

> [!WARNING]
> **A Regra da Nuvem Cinza (DNS Only)**
> Quando for cadastrar as entradas `A` para `admin` e `n8n` no Cloudflare, **desative o Proxy (clique na nuvem laranja para ela ficar cinza, "Apenas DNS").**

**Por que fazer isso?**
1. **Conflito de SSL:** O nosso servidor Linux usará o Caddy, que emite certificados SSL rigorosos e automáticos (Let's Encrypt). Se a nuvem do Cloudflare estiver laranja, ele tentará interceptar o SSL, o que fará o Caddy falhar na emissão do certificado.
2. **Bloqueio de Webhooks:** O firewall rígido (WAF) do Cloudflare ativo na nuvem laranja pode acidentalmente bloquear chamadas POST legítimas enviadas pelo Hookcloud para o seu n8n.

Com a "nuvem cinza", o Cloudflare entregará sua eficiência incrível de DNS sem atrapalhar o Caddy de fazer a segurança e o roteamento.

## 2. Configurando o Proxy Reverso (Caddyfile)

Na raiz do seu servidor Linux, dentro da pasta onde você colocou o `docker-compose.yml`, você deve criar a pasta e o arquivo do Caddy:

```bash
mkdir -p caddy
nano caddy/Caddyfile
```

Copie e cole a seguinte configuração no `Caddyfile`, já adaptada para o seu domínio:

```caddyfile
# 1. Painel Administrativo (Next.js)
# Usaremos o subdominio "admin" (ajuste se preferir "app")
admin.nia-ai.com.br {
    # Redireciona para o container Docker chamado "nia_admin_panel" na porta 3000
    reverse_proxy nia_admin_panel:3000
}

# 2. Orquestrador N8N (Nativo no Linux)
n8n.nia-ai.com.br {
    # Se o seu n8n estiver rodando nativamente no Linux na porta 5678,
    # o Caddy precisa usar o IP do docker gateway (geralmente 172.17.0.1) 
    # ou o IP interno da maquina para chegar nele.
    reverse_proxy 172.17.0.1:5678
}

# 3. (Opcional) Site Principal / Landing Page
# nia-ai.com.br, www.nia-ai.com.br {
#    # Aqui você pode rotear para a landing page do projeto
#    reverse_proxy nome_container_site:3000
# }
```

> **Dica Nerdzão:** O Caddy faz a comunicação HTTPS (certificados Let's Encrypt) nativamente de forma automática. Você **não precisa** rodar nenhum comando de Certbot. Assim que você reiniciar o Docker e o DNS estiver propagado, ele gerará o cadeado verde sozinho.

## 3. Configurando a URL base no N8N

Já que o n8n está instalado diretamente no servidor, você precisará editar o arquivo `.env` do n8n (onde quer que ele esteja salvo) para reconhecer o domínio corretamente, especialmente para que o *Webhook URL* funcione de forma limpa.

Certifique-se de que essas variáveis de ambiente estejam configuradas para a inicialização do seu n8n:
```env
WEBHOOK_URL=https://n8n.nia-ai.com.br/
N8N_HOST=n8n.nia-ai.com.br
N8N_PROTOCOL=https
```
*Se você usa o PM2 ou o Docker nativo para o n8n, não esqueça de reiniciar o serviço após alterar as variáveis.*

## 4. Reiniciando o Caddy para aplicar as mudanças

Toda vez que você mexer no arquivo `Caddyfile` ou nas rotas de domínio, reinicie apenas o proxy no Docker:

```bash
docker exec -w /etc/caddy caddy_proxy caddy reload
```
*(Esse comando dá reload nas regras sem desligar o proxy, resultando em "Zero Downtime" para as outras rotas)*
