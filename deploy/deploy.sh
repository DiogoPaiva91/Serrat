#!/bin/bash
# Deploy Serrat para VPS — SEM causar ban no fail2ban
#
# Uso:
#   ./deploy/deploy.sh
#
# Requisitos:
#   - Chave SSH nookweb_admin.pem acessível
#   - Permissão 600 na chave (chmod 600)
#
# O que faz:
#   1. Envia arquivos via rsync (1 conexão SSH)
#   2. Build + deploy via docker stack (1 conexão SSH)
#   Total: 2 conexões SSH — longe do limite de 3 do fail2ban

set -euo pipefail

# --- Configuração ---
VPS_HOST="5.78.90.166"
VPS_USER="root"
PEM_PATH="${SERRAT_PEM:-$HOME/Área de trabalho/Host/nookweb_admin.pem}"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10"
REMOTE_DIR="/root/serrat"
STACK_NAME="serrat"

# --- Validações ---
if [ ! -f "$PEM_PATH" ]; then
  echo "ERRO: Chave SSH não encontrada em: $PEM_PATH"
  echo "Defina SERRAT_PEM com o caminho correto ou coloque em ~/Área de trabalho/Host/"
  exit 1
fi

chmod 600 "$PEM_PATH" 2>/dev/null || true

# Diretório raiz do projeto
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Serrat Deploy ==="
echo "Projeto: $PROJECT_DIR"
echo "VPS: $VPS_USER@$VPS_HOST"
echo ""

# --- 1. Enviar arquivos (1 conexão SSH) ---
echo "[1/2] Enviando arquivos..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='mobile/node_modules' \
  -e "ssh -i '$PEM_PATH' $SSH_OPTS" \
  "$PROJECT_DIR/" \
  "$VPS_USER@$VPS_HOST:$REMOTE_DIR/"

echo ""

# --- 2. Build + Deploy (1 conexão SSH) ---
echo "[2/2] Build e deploy na VPS..."
ssh -i "$PEM_PATH" $SSH_OPTS "$VPS_USER@$VPS_HOST" bash -s <<'REMOTE_SCRIPT'
  set -euo pipefail
  cd /root/serrat

  echo "  -> Docker build..."
  docker build --no-cache -f deploy/Dockerfile -t serrat-web:latest . 2>&1 | tail -3

  echo "  -> Docker stack deploy..."
  docker stack deploy -c deploy/docker-stack.yml serrat

  echo "  -> Aguardando container atualizar..."
  sleep 5
  docker service update --force --update-parallelism 1 --update-delay 5s serrat_serrat 2>&1 | tail -3

  echo ""
  echo "  -> Status:"
  docker service ls | grep serrat
REMOTE_SCRIPT

echo ""
echo "=== Deploy concluido ==="
echo "URL: https://serrat.operation.app.br"
