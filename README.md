# Serrat - Gestao Inteligente

Sistema de gestao de ordens de servico de limpeza e manutencao de cabines (banheiros) em terminais portuarios.

## Stack

- **Web:** React 19 + TypeScript + Vite 8 + Tailwind 4 + Radix UI
- **Mobile:** Expo React Native (scanner QR)
- **Backend:** Supabase (Auth, Database, Edge Functions)
- **Infra:** Docker Swarm + Traefik + nginx

## Estrutura

```
serrat/
├── web/          # Dashboard admin (React SPA)
├── shared/       # Tipos e constantes compartilhados
├── mobile/       # App operador (Expo)
├── supabase/     # Migrations e Edge Functions
└── deploy/       # Dockerfile, nginx, docker-stack, script de deploy
```

## Desenvolvimento local

```bash
pnpm install
pnpm dev          # http://localhost:5000
```

## Deploy em producao

**URL:** https://serrat.operation.app.br

**VPS:** 5.78.90.166 (Docker Swarm + Traefik)

### Deploy automatico (recomendado)

```bash
./deploy/deploy.sh
```

O script faz tudo em **2 conexoes SSH** (rsync + build/deploy), longe do limite de 3 do fail2ban.

### Deploy manual

```bash
# 1. Enviar arquivos
rsync -avz --exclude='node_modules' --exclude='.git' \
  -e "ssh -i ~/Área\ de\ trabalho/Host/nookweb_admin.pem" \
  ./ root@5.78.90.166:/root/serrat/

# 2. Build e deploy (1 SSH apenas)
ssh -i ~/Área\ de\ trabalho/Host/nookweb_admin.pem root@5.78.90.166 \
  "cd /root/serrat && \
   docker build --no-cache -f deploy/Dockerfile -t serrat-web:latest . && \
   docker stack deploy -c deploy/docker-stack.yml serrat && \
   sleep 5 && \
   docker service update --force --update-parallelism 1 --update-delay 5s serrat_serrat"
```

### Regras de seguranca (VPS)

- **Fail2ban ativo:** 3 tentativas SSH falhas = ban 24h
- **NUNCA** usar `docker service update --force` logo apos `docker stack deploy` sem `--update-delay`
- **NUNCA** fazer multiplas conexoes SSH em sequencia rapida (agrupar comandos)
- **Autenticacao:** somente chave SSH (`nookweb_admin.pem`), senha desabilitada
- Rede interna Docker: `NookNet`

### DNS

- `serrat.operation.app.br` → A record → `5.78.90.166`
- SSL via Let's Encrypt (automatico pelo Traefik)
- O dominio `operation.app.br` (sem serrat) aponta para o Bubble.io (sistema antigo)
